/**
 * This example shows how to use the Aptos SDK to send a transaction.
 * Don't forget to install @aptos-labs/ts-sdk before running this example!
 */

import {
  Account,
  AccountAuthenticatorEd25519,
  AptosConfig,
  deriveTransactionType,
  Ed25519Signature,
  generateSignedTransaction,
  postAptosFullNode,
  type AnyRawTransaction,
  type InputSubmitTransactionData,
  type PendingTransactionResponse,
} from "@aptos-labs/ts-sdk";

import { sha3_256 as sha3Hash } from "@noble/hashes/sha3";


export async function submitTransaction(
  args: {
    aptosConfig: AptosConfig;
  } & InputSubmitTransactionData,
): Promise<PendingTransactionResponse> {
  const { aptosConfig } = args;
  const signedTransaction = generateSignedTransaction({ ...args });
  const { data } = await postAptosFullNode<Uint8Array, PendingTransactionResponse>({
    aptosConfig,
    body: signedTransaction,
    path: "transactions",
    originMethod: "submitTransaction",
    contentType: "application/x.diem.signed_transaction+bcs",
  });
  return data;
}


const RAW_TRANSACTION_SALT = "DIEM::RawTransaction";
const RAW_TRANSACTION_WITH_DATA_SALT = "DIEM::RawTransactionWithData";

export function generateSigningMessageForTransactionDiem(transaction: AnyRawTransaction): Uint8Array {
  const rawTxn = deriveTransactionType(transaction);
  if (transaction.feePayerAddress) {
    return generateSigningMessageDiem(rawTxn.bcsToBytes(), RAW_TRANSACTION_WITH_DATA_SALT);
  }
  if (transaction.secondarySignerAddresses) {
    return generateSigningMessageDiem(rawTxn.bcsToBytes(), RAW_TRANSACTION_WITH_DATA_SALT);
  }
  return generateSigningMessageDiem(rawTxn.bcsToBytes(), RAW_TRANSACTION_SALT);
}

export function generateSigningMessageDiem(bytes: Uint8Array, domainSeparator: string): Uint8Array {
  const hash = sha3Hash.create();

  // if (!domainSeparator.startsWith("APTOS::")) {
  //   throw new Error(`Domain separator needs to start with 'APTOS::'.  Provided - ${domainSeparator}`);
  // }

  hash.update(domainSeparator);

  const prefix = hash.digest();

  const body = bytes;

  const mergedArray = new Uint8Array(prefix.length + body.length);
  mergedArray.set(prefix);
  mergedArray.set(body, prefix.length);

  return mergedArray;
}

export function signTransactionDiem(accountObj: Account, transaction: AnyRawTransaction): Ed25519Signature {
  return accountObj.sign(generateSigningMessageForTransactionDiem(transaction));
}

export function signTransactionWithAuthenticatorDiem(accountObj: Account, transaction: AnyRawTransaction): AccountAuthenticatorEd25519 {
  return new AccountAuthenticatorEd25519(accountObj.publicKey, signTransactionDiem(accountObj, transaction));
}
