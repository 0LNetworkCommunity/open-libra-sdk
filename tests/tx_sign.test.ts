import { expect, test } from "bun:test";

import {
  addressFromString,
  mnemonicToAccountObj,
  publicKeyToAuthKey,
} from "../src/crypto/keyFactory";
import { wrapLibra } from "../src/api/vendorClient";
import { ALICE_MNEM } from "./support/fixture_mnemonics";
import { getOriginatingAddress } from "../src/wallet/walletUtil";
import {
  generateSigningMessageForTransactionDiem,
  signTransactionDiem,
  signTransactionWithAuthenticatorDiem,
} from "../src/transaction/txSigning";
import type { InputGenerateTransactionOptions } from "@aptos-labs/ts-sdk";
import { submitTransactionDiem } from "../src/transaction/submit";

test("can sign noop tx", async () => {
  const libra = wrapLibra();

  const alice_obj = mnemonicToAccountObj(ALICE_MNEM);
  const authKey = publicKeyToAuthKey(alice_obj.publicKey);
  const onchainAddr = await getOriginatingAddress(authKey);

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
  console.log(signature.toString());

  const authenticator = signTransactionWithAuthenticatorDiem(
    alice_obj,
    transaction,
  );

  console.log(authenticator.signature.toString());
  expect(authenticator.signature.toString()).toBe(signature.toString());

  const ver = alice_obj.publicKey.verifySignature({ signature, message });
  console.log(ver);
  expect(ver).toBeTruthy();
});

test(
  "can submit noop tx",
  async () => {
    const libra = wrapLibra();

    const alice_obj = mnemonicToAccountObj(ALICE_MNEM);
    const authKey = publicKeyToAuthKey(alice_obj.publicKey);
    const onchainAddr = await getOriginatingAddress(authKey);

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

    console.log(`Submitted transaction hash: ${submittedTransaction.hash}`);

    // 5. Wait for results
    const executedTransaction = await libra.waitForTransaction({
      transactionHash: submittedTransaction.hash,
    });
    expect(executedTransaction.success).toBeTrue();
  },
  { timeout: 10_000 },
);
