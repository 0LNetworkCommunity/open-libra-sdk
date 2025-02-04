import { test } from "bun:test";
import { getOriginatingAddress } from "../src/crypto/walletUtil";
import {
  mnemonicToAccountObj,
  publicKeyToAuthKey,
} from "../src/crypto/keyFactory";
import { ALICE_MNEM } from "./fixture_mnemonics";

test("can get originating address", async () => {
  const alice_obj = mnemonicToAccountObj(ALICE_MNEM);
  const authKey = publicKeyToAuthKey(alice_obj.publicKey);
  const addr = await getOriginatingAddress(authKey.toString());
  console.log(addr.toString());
});
