import { afterAll, beforeAll, expect, test } from "bun:test";
import { testnetDown, testnetUp } from "../../src/local_testnet/compose";
import { DOCKER_URL, LibraClient } from "../../src/client/client";
import { Network } from "@aptos-labs/ts-sdk";
import * as LibraViews from "../../src/views/viewFunctionsSugar";

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

test("can get chain id", async () => {
  console.log("Calling Libra Explorer API");
  const client = new LibraClient(Network.TESTNET, DOCKER_URL);
  const chain_id = await client.general.getChainId();

  expect(chain_id).toBe(2);
});

test("can get validators using viewFunctionsSugar", async () => {
  const client = new LibraClient(Network.TESTNET, DOCKER_URL);
  // Use the sugar function to craft the payload
  const payload = LibraViews.validatorUniverse_getEligibleValidators();
  const vals = await client.general.viewJson(payload);
  console.log(vals);
  expect(Array.isArray(vals)).toBe(true);
  expect(vals.length).toBeGreaterThan(0);
});
