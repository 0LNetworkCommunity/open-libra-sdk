import * as hkdf from '@noble/hashes/hkdf';
import { pbkdf2 } from '@noble/hashes/pbkdf2';
import { sha3_256 } from '@noble/hashes/sha3';
import { ed25519 } from '@noble/curves/ed25519';
import { AccountAddress, Ed25519Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk'
import { validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';



// Seed generation salting

const INFO_PREFIX = Buffer.concat([
  Buffer.from(
    '0L WALLET: US DEATHS NEAR 100,000, AN INCALCULABLE LOSS: derived key$',
    'ascii',
  ),
  Buffer.alloc(8),
]);

const MNEMONIC_SALT_PREFIX = Buffer.from(
  '0L WALLET: UNREST, FIRES, AND VIOLENCE AS PROTESTS RAGE ACROSS US: mnemonic salt prefix$0L',
  'ascii',
);

const MAIN_KEY_SALT = Buffer.from(
  '0L WALLET: 30 MILLION AMERICANS HAVE FILED INITIAL UNEMPLOYMENT CLAIMS: master key salt$',
  'ascii',
);


export function checkMnemList(mnemonic: string): boolean {
  // Validates mnemonic for being 12-24 words contained in `wordlist`.
  return validateMnemonic(mnemonic, wordlist)
}
export function mnemonicToPrivateKey(mnemonic: string): Uint8Array {
  if (!checkMnemList(mnemonic)) {
    throw "ERROR: not a valid mnemonic string"
  }

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

export function publicKeyToAuthKey(publicKey: Uint8Array): Uint8Array {
  // Concatenate the public key with 0. 0 means Ed25519 which is the only Scheme supported for now.
  return sha3_256(new Uint8Array(Buffer.concat([publicKey, Buffer.from([0])])));
}

export function mnemonicToAuthKey(mnemonic: string) {
  return publicKeyToAuthKey(
    privateKeyToPublicKey(mnemonicToPrivateKey(mnemonic)),
  );
}

export function deriveLegacyAddress(authKey: Uint8Array): Uint8Array {
  const lastHalf = authKey.slice(16)
  return lastHalf
}

export function mnemonicToEd25519PrivateKey(mnemonic: string): Ed25519PrivateKey {
  const pk = mnemonicToPrivateKey(mnemonic)
  return new Ed25519PrivateKey(pk)

}

export function mnemonicToAccountObj(mnemonic: string): Ed25519Account {
  const privateKey = mnemonicToEd25519PrivateKey(mnemonic)

  const authkey = mnemonicToAuthKey(mnemonic)

  const address = AccountAddress.from(authkey)

  return new Ed25519Account({
    privateKey,
    address
  })
}
