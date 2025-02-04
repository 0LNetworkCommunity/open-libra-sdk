import { expect, test } from "bun:test";
import { getOriginatingAddress } from "../src/wallet/walletUtil";
import {
  addressFromString,
  mnemonicToAccountObj,
  publicKeyToAuthKey,
} from "../src/crypto/keyFactory";
import { ALICE_MNEM } from "./fixture_mnemonics";
import { LibraWallet } from "../src/wallet/libraWallet";

test("can get originating address", async () => {
  const alice_obj = mnemonicToAccountObj(ALICE_MNEM);
  const authKey = publicKeyToAuthKey(alice_obj.publicKey);
  const addr = await getOriginatingAddress(authKey);
  expect(addr.toString()).toBe(
    "0x000000000000000000000000000000004c613c2f4b1e67ca8d98a542ee3f59f5",
  );
});

test("can initialize LibraWallet", async () => {
  const wallet = new LibraWallet(ALICE_MNEM);
  await wallet.sync_onchain();
  const addr = wallet.get_address();
  expect(addr.toString()).toBe(
    "0x000000000000000000000000000000004c613c2f4b1e67ca8d98a542ee3f59f5",
  );
});

test("can initialize LibraWallet", async () => {
  const wallet = new LibraWallet(ALICE_MNEM);
  await wallet.sync_onchain();

  const addr_formatted = addressFromString(
    "0x37799DA327DB4C58D5E28E7DD6338F6B",
  ).toString();

  const tx = await wallet.buildTransaction("0x1::ol_account::transfer", [
    addr_formatted,
    100,
  ]);
  const t = await wallet.signSubmitWait(tx);
  expect(t.success).toBeTrue();
});
