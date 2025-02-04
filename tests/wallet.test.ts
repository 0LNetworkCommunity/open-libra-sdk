import { expect, test } from "bun:test";
import { getOriginatingAddress } from "../src/wallet/walletUtil";
import {
  mnemonicToAccountObj,
  publicKeyToAuthKey,
} from "../src/crypto/keyFactory";
import { ALICE_MNEM } from "./fixture_mnemonics";

test("can get originating address", async () => {
  const alice_obj = mnemonicToAccountObj(ALICE_MNEM);
  const authKey = publicKeyToAuthKey(alice_obj.publicKey);
  const addr = await getOriginatingAddress(authKey);
  expect(addr.toString()).toBe(
    "0x000000000000000000000000000000004c613c2f4b1e67ca8d98a542ee3f59f5",
  );
});
