import { expect, test } from "bun:test";
import { Libra } from "../src/api/vendorClient";
import { Network } from "@aptos-labs/ts-sdk";
import { DEBUG_URL } from "../src";

// NOTE: must be running a local testnet, or fullnode on localhost:8080

test("use vendor client", async () => {
  const libra = new Libra(Network.TESTNET, DEBUG_URL);
  const ledgerInfo = await libra.getLedgerInfo();
  expect(ledgerInfo.chain_id).toBeGreaterThan(0);
});

test("can get resource", async () => {
  interface Coin {
    coin: {
      value: number;
    };
  }
  const libra = new Libra(Network.TESTNET, DEBUG_URL);

  const res = await libra.get_resource<Coin>(
    "0x87515d94a244235a1433d7117bc0cb154c613c2f4b1e67ca8d98a542ee3f59f5",
    "0x1::coin::CoinStore<0x1::libra_coin::LibraCoin>",
  );
  expect(Number(res.coin.value)).toBeGreaterThan(10000000000000);
});
