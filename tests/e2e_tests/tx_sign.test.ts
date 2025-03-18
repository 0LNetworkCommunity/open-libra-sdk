import { afterEach, beforeEach, expect, test } from "bun:test";

import {
  addressFromString,
  mnemonicToAccountObj,
  publicKeyToAuthKey,
} from "../../src/crypto/keyFactory";
import { LibraClient } from "../../src/client/client";
import { ALICE_MNEM } from "../../src/local_testnet/fixture_mnemonics";
import {
  generateSigningMessageForTransactionDiem,
  signTransactionDiem,
  signTransactionWithAuthenticatorDiem,
} from "../../src/transaction/txSigning";
import {
  Deserializer,
  Network,
  SimpleTransaction,
  type InputGenerateTransactionOptions,
} from "@aptos-labs/ts-sdk";
import { submitTransactionDiem } from "../../src/transaction/submit";
import { DOCKER_URL, LibraWallet } from "../../src";
import { testnetDown, testnetUp } from "../../src/local_testnet/compose";

beforeEach(async () => {
  console.log("testnet setup");
  // make sure we teardown any zombies first
  await testnetDown();
  await testnetUp();
});

afterEach(async () => {
  await testnetDown().then(() => {
    console.log("testnet down");
  });
});

test("can sign noop tx", async () => {
  const libra = new LibraClient(Network.TESTNET, DOCKER_URL);

  const alice_obj = mnemonicToAccountObj(ALICE_MNEM);
  const authKey = publicKeyToAuthKey(alice_obj.publicKey);
  const onchainAddr = await libra.getOriginatingAddress(authKey);

  const marlon_addr = addressFromString("0x1234");

  const transaction = await libra.transaction.build.simple({
    sender: onchainAddr,
    data: {
      // All transactions on Aptos are implemented via smart contracts.
      function: "0x1::ol_account::transfer",
      functionArguments: [marlon_addr, 100],
    },
  });

  // 3. Sign
  const message = generateSigningMessageForTransactionDiem(transaction);

  const signature = signTransactionDiem(alice_obj, transaction);

  const authenticator = signTransactionWithAuthenticatorDiem(
    alice_obj,
    transaction,
  );

  expect(authenticator.signature.toString()).toBe(signature.toString());

  const ver = alice_obj.publicKey.verifySignature({ signature, message });
  expect(ver).toBeTruthy();
});

test(
  "can submit noop tx",
  async () => {
    const libra = new LibraClient(Network.TESTNET, DOCKER_URL);

    const alice_obj = mnemonicToAccountObj(ALICE_MNEM);
    const authKey = publicKeyToAuthKey(alice_obj.publicKey);
    const onchainAddr = await libra.getOriginatingAddress(authKey);

    const marlon_addr = addressFromString("0x37799DA327DB4C58D5E28E7DD6338F6B");

    const options: InputGenerateTransactionOptions = {
      maxGasAmount: 40000,
      gasUnitPrice: 100,
    };

    const transaction = await libra.transaction.build.simple({
      sender: onchainAddr,
      data: {
        // All transactions on Aptos are implemented via smart contracts.
        function: "0x1::ol_account::transfer",
        functionArguments: [marlon_addr, 100],
      },
      options,
    });

    // 3. Sign
    const authenticator = signTransactionWithAuthenticatorDiem(
      alice_obj,
      transaction,
    );

    // 4. Submit
    const args = {
      transaction: transaction,
      senderAuthenticator: authenticator,
    };
    const submittedTransaction = await submitTransactionDiem({
      aptosConfig: libra.config,
      ...args,
    });

    // 5. Wait for results
    const executedTransaction = await libra.waitForTransaction({
      transactionHash: submittedTransaction.hash,
    });
    expect(executedTransaction.success).toBeTrue();
  },
  { timeout: 30_000 },
);

test(
  "can transfer",
  async () => {
    const wallet = LibraWallet.fromMnemonic(
      ALICE_MNEM,
      Network.TESTNET,
      DOCKER_URL,
    );
    await wallet.syncOnchain();

    const addr_formatted = addressFromString(
      "0x37799DA327DB4C58D5E28E7DD6338F6B",
    ).toString();

    const tx = await wallet.buildTransaction("0x1::ol_account::transfer", [
      addr_formatted,
      100,
    ]);
    const t = await wallet.signSubmitWait(tx);
    expect(t.success).toBeTrue();
  },
  { timeout: 30_000 },
);

test(
  "can transfer multiple sequence numbers",
  async () => {
    const wallet = LibraWallet.fromMnemonic(
      ALICE_MNEM,
      Network.TESTNET,
      DOCKER_URL,
    );
    await wallet.syncOnchain();

    const addr_formatted = addressFromString(
      "0x37799DA327DB4C58D5E28E7DD6338F6B",
    ).toString();

    const tx_one = await wallet.buildTransaction("0x1::ol_account::transfer", [
      addr_formatted,
      100,
    ]);
    const t = await wallet.signSubmitWait(tx_one);
    expect(t.success).toBeTrue();

    // You can set the next sequence number manually
    // with wallet.txOptions.accountSequenceNumber
    // or fetch from the chain with syncOnchain
    await wallet.syncOnchain();

    const tx_two = await wallet.buildTransaction("0x1::ol_account::transfer", [
      addr_formatted,
      200,
    ]);

    const t2 = await wallet.signSubmitWait(tx_two);

    expect(t2.success).toBeTrue();
  },
  { timeout: 40_000 },
);

test("can sign noop tx", async () => {
  const libra = new LibraClient(Network.TESTNET, DOCKER_URL);

  const alice_obj = mnemonicToAccountObj(ALICE_MNEM);
  const authKey = publicKeyToAuthKey(alice_obj.publicKey);
  const onchainAddr = await libra.getOriginatingAddress(authKey);

  const marlon_addr = addressFromString("0x1234");

  const transaction = await libra.transaction.build.simple({
    sender: onchainAddr,
    data: {
      // All transactions on Aptos are implemented via smart contracts.
      function: "0x1::ol_account::transfer",
      functionArguments: [marlon_addr, 100],
    },
  });

  // 3. Sign
  const message = generateSigningMessageForTransactionDiem(transaction);

  const signature = signTransactionDiem(alice_obj, transaction);

  const authenticator = signTransactionWithAuthenticatorDiem(
    alice_obj,
    transaction,
  );

  expect(authenticator.signature.toString()).toBe(signature.toString());

  const ver = alice_obj.publicKey.verifySignature({ signature, message });
  expect(ver).toBeTruthy();
});

test("cold wallet workflow", async () => {
  // Prepare transaction in online environment
  const libra = LibraWallet.fromMnemonic(
    ALICE_MNEM,
    Network.TESTNET,
    DOCKER_URL,
  );

  const marlon_addr = addressFromString("0x37799DA327DB4C58D5E28E7DD6338F6B");

  const transaction = await libra.buildTransaction(
    "0x1::ol_account::transfer",
    [marlon_addr.toString(), 100],
  );

  const bytes = transaction.bcsToBytes();
  // Save the bytes to file, etc.

  // This part can happen in a cold wallet environment
  const de = new Deserializer(bytes);
  const simple = SimpleTransaction.deserialize(de);
  expect(simple.rawTransaction.sender.toStringLong()).toBe(
    libra.account.accountAddress.toStringLong(),
  );
});
