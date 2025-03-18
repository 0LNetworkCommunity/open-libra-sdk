import { afterAll, beforeAll, expect, test } from "bun:test";
import {
  mnemonicToAccountObj,
  publicKeyToAuthKey,
} from "../../src/crypto/keyFactory";
import { ALICE_MNEM } from "../../src/local_testnet/fixture_mnemonics";
import { LibraWallet } from "../../src/wallet/libraWallet";
import { LibraClient } from "../../src/client/client";
import { Network } from "@aptos-labs/ts-sdk";
import { DOCKER_URL } from "../../src";
import { testnetDown, testnetUp } from "../../src/local_testnet/compose";

beforeAll(async () => {
  console.log("testnet setup");
  // make sure we teardown any zombies first
  await testnetDown();
  await testnetUp();
});

afterAll(async () => {
  await testnetDown().then(() => {
    console.log("testnet down");
  });
});

test("can get originating address", async () => {
  const alice_obj = mnemonicToAccountObj(ALICE_MNEM);
  const authKey = publicKeyToAuthKey(alice_obj.publicKey);
  const libra = new LibraClient(Network.TESTNET, DOCKER_URL);
  const addr = await libra.getOriginatingAddress(authKey);
  expect(addr.toString()).toBe(
    "0x87515d94a244235a1433d7117bc0cb154c613c2f4b1e67ca8d98a542ee3f59f5",
  );
});

test("can recover address", async () => {
  const wallet = LibraWallet.fromMnemonic(ALICE_MNEM, Network.TESTNET, DOCKER_URL);
  await wallet.syncOnchain();
  const addr = wallet.getAddress();
  expect(addr.toString()).toBe(
    "0x87515d94a244235a1433d7117bc0cb154c613c2f4b1e67ca8d98a542ee3f59f5",
  );
});
