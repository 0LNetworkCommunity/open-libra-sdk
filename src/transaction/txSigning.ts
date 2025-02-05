import {
  AccountAuthenticatorEd25519,
  deriveTransactionType,
  Ed25519Account,
  Ed25519Signature,
  type AnyRawTransaction,
} from "@aptos-labs/ts-sdk";

import { sha3_256 as sha3Hash } from "@noble/hashes/sha3";

const RAW_TRANSACTION_SALT = "DIEM::RawTransaction";
const RAW_TRANSACTION_WITH_DATA_SALT = "DIEM::RawTransactionWithData";

export function generateSigningMessageForTransactionDiem(
  transaction: AnyRawTransaction,
): Uint8Array {
  const rawTxn = deriveTransactionType(transaction);
  if (transaction.feePayerAddress) {
    return generateSigningMessageDiem(
      rawTxn.bcsToBytes(),
      RAW_TRANSACTION_WITH_DATA_SALT,
    );
  }
  if (transaction.secondarySignerAddresses) {
    return generateSigningMessageDiem(
      rawTxn.bcsToBytes(),
      RAW_TRANSACTION_WITH_DATA_SALT,
    );
  }
  return generateSigningMessageDiem(rawTxn.bcsToBytes(), RAW_TRANSACTION_SALT);
}

// NOTE: Ported from Aptos SDK.
// fixes some hard coded names. There domain Separator VOODOO they call "salt"
// which is not a salt. Loup garou.
export function generateSigningMessageDiem(
  bytes: Uint8Array,
  domainSeparator: string,
): Uint8Array {
  const hash = sha3Hash.create();

  hash.update(domainSeparator);

  const prefix = hash.digest();

  const body = bytes;

  const mergedArray = new Uint8Array(prefix.length + body.length);
  mergedArray.set(prefix);
  mergedArray.set(body, prefix.length);

  return mergedArray;
}

export function signTransactionDiem(
  accountObj: Ed25519Account,
  transaction: AnyRawTransaction,
): Ed25519Signature {
  return accountObj.sign(generateSigningMessageForTransactionDiem(transaction));
}

export function signTransactionWithAuthenticatorDiem(
  accountObj: Ed25519Account,
  transaction: AnyRawTransaction,
): AccountAuthenticatorEd25519 {
  const sig = signTransactionDiem(accountObj, transaction);
  return new AccountAuthenticatorEd25519(accountObj.publicKey, sig);
}
