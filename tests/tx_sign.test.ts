import { expect, test } from "bun:test";

import {
  addressFromString,
  mnemonicToAccountObj,
  publicKeyToAuthKey,
} from "../src/crypto/keyFactory";
import { wrapLibra } from "../src/api/vendorClient";
import { ALICE_MNEM } from "./fixture_mnemonics";
import { getOriginatingAddress } from "../src/crypto/walletUtil";
import {
  generateSigningMessageForTransactionDiem,
  signTransactionDiem,
  signTransactionWithAuthenticatorDiem,
  submitTransaction as submitTransactionDiem,
} from "../src/crypto/txSigning";

test("can sign noop tx", async () => {
  const libra = wrapLibra();

  const alice_obj = mnemonicToAccountObj(ALICE_MNEM);
  const authKey = publicKeyToAuthKey(alice_obj.publicKey);
  const onchainAddr = await getOriginatingAddress(authKey.toString());

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
  console.log("\n=== 3. Signing transaction ===\n");

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

test("can submit noop tx", async () => {
  const libra = wrapLibra();

  const alice_obj = mnemonicToAccountObj(ALICE_MNEM);
  const authKey = publicKeyToAuthKey(alice_obj.publicKey);
  const onchainAddr = await getOriginatingAddress(authKey.toString());

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
    aptosConfig: aptos.config,
    ...args,
  });

  console.log(`Submitted transaction hash: ${submittedTransaction.hash}`);

  // 5. Wait for results
  const executedTransaction = await libra.waitForTransaction({
    transactionHash: submittedTransaction.hash,
  });
  console.log(executedTransaction);
});
