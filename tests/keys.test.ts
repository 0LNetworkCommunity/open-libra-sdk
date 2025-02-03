import { expect, test } from "bun:test";
import {
  checkMnemList,
  deriveLegacyAddress,
  mnemonicToAccountObj,
  mnemonicToEd25519PrivateKey,
  mnemonicToPrivateKey,
  privateKeyToPublicKey,
  publicKeyToAuthKey,
} from "../src/crypto/keyFactory";
import { ALICE_MNEM } from "./fixture_mnemonics";

test("bad mnemonic to pri key should fail", async () => {
  const is_good = checkMnemList("test should fail");
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

  const auth = publicKeyToAuthKey(pubkey);
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

// tests ported from rust:
// https://github.com/0LNetworkCommunity/libra-framework/blob/16aef3af91160e1586170bafeb5acef08edc9c41/tools/wallet/src/account_keys.rs#L177

// #[test]
// fn test_legacy_keys() {
//   let alice_mnem = "talent sunset lizard pill fame nuclear spy noodle basket okay critic grow sleep legend hurry pitch blanket clerk impose rough degree sock insane purse";

//   let l = get_keys_from_mnem(alice_mnem.to_string()).unwrap();

//   assert_eq!(
//     get_ol_legacy_address(l.child_0_owner.account)
//       .unwrap()
//       .to_string(),
//     "000000000000000000000000000000004c613c2f4b1e67ca8d98a542ee3f59f5"
//   );

//   assert_eq!(
//     "2570472a9a08b9cc1f7c616e9ebb1dc534db452d3a3d3c567e58bec9f0fbd13e",
//         & hex:: encode(& l.seed)
//   );
// }

// #[test]
// // We want to check that the address and auth key derivation is the same from what Diem generates, and what the vendor types do.
// fn type_conversion_give_same_auth_and_address() {
//     use crate:: load_keys:: get_account_from_mnem;

//   let alice_mnem = "talent sunset lizard pill fame nuclear spy noodle basket okay critic grow sleep legend hurry pitch blanket clerk impose rough degree sock insane purse";

//   let(auth_key, account, wallet) = get_account_from_mnem(alice_mnem.to_owned()).unwrap();

//   let l = KeyChain::new (& wallet).unwrap();

//   assert_eq!(
//     account.to_hex_literal(),
//     l.child_0_owner.account.to_hex_literal()
//   );
//   assert_eq!(auth_key.to_string(), l.child_0_owner.auth_key.to_string());

//     // Check the vendor ConfigKey struct is the same.
//     use diem_config:: keys:: ConfigKey;
//     use diem_crypto:: ed25519:: Ed25519PrivateKey;

//   let cfg_key: ConfigKey<Ed25519PrivateKey> = ConfigKey::new (l.child_0_owner.pri_key);
//   let auth_key_from_cfg = AuthenticationKey:: ed25519(& cfg_key.public_key()).derived_address();
//   assert_eq!(
//     auth_key_from_cfg.to_string(),
//     l.child_0_owner.auth_key.to_string()
//   );
// }
