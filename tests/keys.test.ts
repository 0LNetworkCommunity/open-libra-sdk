import { expect, test } from "bun:test";
import {
  isMnemString,
  deriveLegacyAddress,
  mnemonicToAccountObj,
  mnemonicToEd25519PrivateKey,
  mnemonicToPrivateKey,
  privateKeyToPublicKey,
  publicKeyBytesToAuthKey,
  generateMnemonic,
  publicKeyToAuthKey,
} from "../src/crypto/keyFactory";
import { ALICE_MNEM } from "../src/local_testnet/fixture_mnemonics";

test("keygen mnemonic", async () => {
  const mnem = generateMnemonic();
  const is_good = isMnemString(mnem);

  expect(is_good).toBe(true);

  const mnem2 = generateMnemonic();
  expect(mnem == mnem2).toBe(false);
});

test("bad mnemonic to pri key should fail", async () => {
  const is_good = isMnemString("test should fail");
  expect(is_good).toBe(false);

  expect(() => {
    mnemonicToPrivateKey("not a mnemonic string");
  }).toThrow();
});

test("good mnemonic to pri key", async () => {
  const pri_bytes = mnemonicToPrivateKey(ALICE_MNEM);
  const pk_literal = Buffer.from(pri_bytes).toString("hex");
  expect(pk_literal).toBe(
    "74f18da2b80b1820b58116197b1c41f8a36e1b37a15c7fb434bb42dd7bdaa66b",
  );

  const pubkey = privateKeyToPublicKey(pri_bytes);
  const pubkey_string = Buffer.from(pubkey).toString("hex");
  expect(pubkey_string).toBe(
    "9b01701b040a91792f6e1c9003f633e1d39b02b72a54a4bba6296a70dddcf3ab",
  );

  const auth = publicKeyBytesToAuthKey(pubkey);
  const auth_literal = Buffer.from(auth).toString("hex");
  expect(auth_literal).toBe(
    "87515d94a244235a1433d7117bc0cb154c613c2f4b1e67ca8d98a542ee3f59f5",
  );

  const address = deriveLegacyAddress(auth);
  const addr_literal = Buffer.from(address).toString("hex");
  expect(addr_literal).toBe("4c613c2f4b1e67ca8d98a542ee3f59f5");

  const pkobj = mnemonicToEd25519PrivateKey(ALICE_MNEM).toHexString();
  expect(pkobj).toBe(
    "0x74f18da2b80b1820b58116197b1c41f8a36e1b37a15c7fb434bb42dd7bdaa66b",
  );

  const accObj = mnemonicToAccountObj(ALICE_MNEM);

  expect(accObj.privateKey.toString()).toBe(
    "0x74f18da2b80b1820b58116197b1c41f8a36e1b37a15c7fb434bb42dd7bdaa66b",
  );
});

test("can derive authkey", async () => {
  const alice_obj = mnemonicToAccountObj(ALICE_MNEM);
  const auth = alice_obj.publicKey.authKey();
  expect(auth.toString()).toBe(
    "0x87515d94a244235a1433d7117bc0cb154c613c2f4b1e67ca8d98a542ee3f59f5",
  );

  const auth2 = publicKeyToAuthKey(alice_obj.publicKey);
  expect(auth2.toString()).toBe(auth.toString());
});

test("signs a message with single signer ed25519 scheme and verifies successfully", () => {
  const messageEncoded = "68656c6c6f20776f726c64"; // "hello world"
  const edAccount = mnemonicToAccountObj(ALICE_MNEM);

  const signature = edAccount.sign(messageEncoded);

  expect(
    edAccount.verifySignature({ message: messageEncoded, signature }),
  ).toBeTruthy();
});
