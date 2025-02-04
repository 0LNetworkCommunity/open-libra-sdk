import { test } from "bun:test";

import {
  addressFromString,
  mnemonicToAccountObj,
  publicKeyToAuthKey,
} from "../src/crypto/keyFactory";
import { wrapLibra } from "../src/api/vendorClient";
import { ALICE_MNEM } from "./fixture_mnemonics";
import { getOriginatingAddress } from "../src/crypto/walletUtil";

test("can sign noop tx", async () => {
  const aptos = wrapLibra();

  const alice_obj = mnemonicToAccountObj(ALICE_MNEM);

  const marlon_addr = addressFromString("0x1234");

  // console.log(alice_obj.accountAddress.toString());
  const authKey = publicKeyToAuthKey(alice_obj.publicKey);

  const onchainAddr = await getOriginatingAddress(authKey.toString());
  // console.log(onchainAddr.toString());
  // 1. Build
  console.log("\n=== 1. Building the transaction ===\n");
  const transaction = await aptos.transaction.build.simple({
    sender: onchainAddr,
    data: {
      // All transactions on Aptos are implemented via smart contracts.
      function: "0x1::ol_account::transfer",
      functionArguments: [marlon_addr, 100],
    },
  });
  // console.log(transaction.)

  // 2. Simulate (Optional)
  // console.log("\n === 2. Simulating Response (Optional) === \n")
  // const [userTransactionResponse] = await aptos.transaction.simulate.simple({
  //   signerPublicKey: alice_obj.publicKey,
  //   transaction,
  // });
  // console.log(userTransactionResponse)

  // // 3. Sign
  console.log("\n=== 3. Signing transaction ===\n");
  const senderAuthenticator = aptos.transaction.sign({
    signer: alice_obj,
    transaction,
  });
  // console.log("Signed the transaction!", senderAuthenticator)

  // // 4. Submit
  console.log("\n=== 4. Submitting transaction ===\n");
  const submittedTransaction = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator,
  });
  console.log(submittedTransaction);

  // console.log(`Submitted transaction hash: ${submittedTransaction.hash}`);

  // // 5. Wait for results
  // console.log("\n=== 5. Waiting for result of transaction ===\n");
  // const executedTransaction = await aptos.waitForTransaction({ transactionHash: submittedTransaction.hash });
  // console.log(executedTransaction)
});
