import { expect, test } from "bun:test";
import { get_resource, wrapLibra } from "../src/api/vendorClient";

// NOTE: must be running a local testnet, or fullnode on localhost:8080

test("use vendor client", async () => {
  const libra = wrapLibra();
  const ledgerInfo = await libra.getLedgerInfo();
  expect(ledgerInfo.chain_id).toBeGreaterThan(0);
});

test("can get resource", async () => {
  interface Coin {
    coin: {
      value: number;
    };
  }
  const res = await get_resource<Coin>(
    "0x4c613c2f4b1e67ca8d98a542ee3f59f5",
    "0x1::coin::CoinStore<0x1::libra_coin::LibraCoin>",
  );
  expect(Number(res.coin.value)).toBeGreaterThan(0);
});
