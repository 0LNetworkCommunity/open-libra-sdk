import { expect, test } from "bun:test";
import {
  mnemonicToAccountObj,
  publicKeyToAuthKey,
} from "../src/crypto/keyFactory";
import { ALICE_MNEM } from "./support/fixture_mnemonics";
import { LibraWallet } from "../src/wallet/libraWallet";
import { Libra } from "../src/api/vendorClient";
import { Network } from "@aptos-labs/ts-sdk";
import { DEBUG_URL } from "../src";

test("can get originating address", async () => {
  const alice_obj = mnemonicToAccountObj(ALICE_MNEM);
  const authKey = publicKeyToAuthKey(alice_obj.publicKey);
  const libra = new Libra(Network.TESTNET, DEBUG_URL);
  const addr = await libra.getOriginatingAddress(authKey);
  expect(addr.toString()).toBe(
    "0x87515d94a244235a1433d7117bc0cb154c613c2f4b1e67ca8d98a542ee3f59f5",
  );
});

test("can recover address", async () => {
  const wallet = new LibraWallet(ALICE_MNEM, Network.TESTNET, DEBUG_URL);
  await wallet.sync_onchain();
  const addr = wallet.get_address();
  expect(addr.toString()).toBe(
    "0x87515d94a244235a1433d7117bc0cb154c613c2f4b1e67ca8d98a542ee3f59f5",
  );
});
