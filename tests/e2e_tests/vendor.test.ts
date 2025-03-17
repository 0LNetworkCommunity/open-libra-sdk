import { afterEach, beforeEach, expect, test } from "bun:test";
import { Libra } from "../../src/api/vendorClient";
import { Network } from "@aptos-labs/ts-sdk";
import { DOCKER_URL } from "../../src";
import { testnetDown, testnetUp } from "../../src/local_testnet/compose";

beforeEach(async () => {
  console.log("testnet setup");
  // make sure we teardown any zombies first
  await testnetDown();
  await testnetUp();
});

afterEach(async () => {
  await testnetDown().then(() => {
    console.log("testnet down");
  });
});

test("use vendor client", async () => {
  const libra = new Libra(Network.TESTNET, DOCKER_URL);
  const ledgerInfo = await libra.getLedgerInfo();
  expect(ledgerInfo.chain_id).toBeGreaterThan(0);
});

test("can get resource", async () => {
  interface Coin {
    coin: {
      value: number;
    };
  }
  const libra = new Libra(Network.TESTNET, DOCKER_URL);

  const res = await libra.getResource<Coin>(
    "0x87515d94a244235a1433d7117bc0cb154c613c2f4b1e67ca8d98a542ee3f59f5",
    "0x1::coin::CoinStore<0x1::libra_coin::LibraCoin>",
  );
  expect(Number(res.coin.value)).toBeGreaterThan(10000000000000);
});
