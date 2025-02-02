import { test } from "bun:test";
import { mnemonicToPrivateKey, privateKeyToPublicKey } from "../src/crypto/keyFactory";
import { ALICE_MNEM } from "./fixture_mnemonics";


test("bad mnemonic to pri key should fail", async () => {
  const pri_bytes = mnemonicToPrivateKey("test")
  const pubkey = privateKeyToPublicKey(pri_bytes)
  console.log(pubkey)
})

test("good mnemonic to pri key", async () => {
  const pri_bytes = mnemonicToPrivateKey(ALICE_MNEM)
  const pubkey = privateKeyToPublicKey(pri_bytes)
  console.log(pubkey)
})
