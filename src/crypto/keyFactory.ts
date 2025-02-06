import * as hkdf from "@noble/hashes/hkdf";
import { pbkdf2 } from "@noble/hashes/pbkdf2";
import { sha3_256 } from "@noble/hashes/sha3";
import { ed25519 } from "@noble/curves/ed25519";
import {
  AccountAddress,
  AuthenticationKey,
  Ed25519Account,
  Ed25519PrivateKey,
  Ed25519PublicKey,
} from "@aptos-labs/ts-sdk";
import { entropyToMnemonic, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { webcrypto } from "node:crypto";

// Seed generation salting

const INFO_PREFIX = Buffer.concat([
  Buffer.from(
    "0L WALLET: US DEATHS NEAR 100,000, AN INCALCULABLE LOSS: derived key$",
    "ascii",
  ),
  Buffer.alloc(8),
]);

const MNEMONIC_SALT_PREFIX = Buffer.from(
  "0L WALLET: UNREST, FIRES, AND VIOLENCE AS PROTESTS RAGE ACROSS US: mnemonic salt prefix$0L",
  "ascii",
);

const MAIN_KEY_SALT = Buffer.from(
  "0L WALLET: 30 MILLION AMERICANS HAVE FILED INITIAL UNEMPLOYMENT CLAIMS: master key salt$",
  "ascii",
);

//////// RECOVERING ACCOUNTS ////////

// checks if the mnemonic string is valid
export function isMnemString(mnemonic: string): boolean {
  // Validates mnemonic for being 12-24 words contained in `wordlist`.
  return validateMnemonic(mnemonic, wordlist);
}

// throw error if bad mnemonic
function checkMnem(mnemonic: string) {
  if (!isMnemString(mnemonic)) {
    throw "ERROR: not a valid mnemonic string";
  }
}

export function mnemonicToPrivateKey(mnemonic: string): Uint8Array {
  checkMnem(mnemonic);

  const ikm = pbkdf2(sha3_256, mnemonic, MNEMONIC_SALT_PREFIX, {
    c: 2048,
    dkLen: 32,
  });
  const hkdfExtract = hkdf.extract(sha3_256, ikm, MAIN_KEY_SALT);
  return hkdf.expand(sha3_256, hkdfExtract.slice(0, 32), INFO_PREFIX, 32);
}

export function privateKeyToPublicKey(privateKey: Uint8Array) {
  return ed25519.getPublicKey(privateKey);
}

export function publicKeyBytesToAuthKey(publicKey: Uint8Array): Uint8Array {
  // Concatenate the public key with 0. 0 means Ed25519 which is the only Scheme supported for now.
  return sha3_256(new Uint8Array(Buffer.concat([publicKey, Buffer.from([0])])));
}

export function publicKeyToAuthKey(
  publicKey: Ed25519PublicKey,
): AuthenticationKey {
  // Concatenate the public key with 0. 0 means Ed25519 which is the only Scheme supported for now.
  return publicKey.authKey();
}

export function mnemonicToAuthKey(mnemonic: string) {
  checkMnem(mnemonic);

  return publicKeyBytesToAuthKey(
    privateKeyToPublicKey(mnemonicToPrivateKey(mnemonic)),
  );
}

// OL legacy addresses (Pre V5) were only 32 bytes, the last 16 digits of an authkey
export function deriveLegacyAddress(authKey: Uint8Array): Uint8Array {
  const lastHalf = authKey.slice(16);
  return lastHalf;
}

export function mnemonicToEd25519PrivateKey(
  mnemonic: string,
): Ed25519PrivateKey {
  const pk = mnemonicToPrivateKey(mnemonic);
  return new Ed25519PrivateKey(pk);
}

export function mnemonicToAccountObj(mnemonic: string): Ed25519Account {
  const privateKey = mnemonicToEd25519PrivateKey(mnemonic);

  const authkey = mnemonicToAuthKey(mnemonic);

  const address = AccountAddress.from(authkey);

  return new Ed25519Account({
    privateKey,
    address,
  });
}

// gets an AccountAddress type from a string.
// Will pad the string with zeros up to 32 characters.
export function addressFromString(literal: string): AccountAddress {
  return AccountAddress.fromString(literal, { maxMissingChars: 63 });
}

//////// CREATING ACCOUNTS ////////

function getEntropyBytes(): Uint8Array {
  const buffer = new Uint8Array(32);
  webcrypto.getRandomValues(buffer);
  return buffer;
}

export function generateMnemonic(): string {
  const ent = getEntropyBytes();
  const mnem = entropyToMnemonic(ent, wordlist);
  return mnem;
}
