import {test } from "bun:test";
import { testnetBottle } from "./support/testnet_bottle";

test("meta bottled testnet", async () => {
  await testnetBottle()
  .then(() => {
    console.log("hi");
  });

}, {timeout: 60 * 1000 })
