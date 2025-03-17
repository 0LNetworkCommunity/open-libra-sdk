import { afterEach, beforeEach, expect, test } from "bun:test";
import { LibraClient } from "../../src/api/api";
import { currentValidatorsPayload } from "../../src/payloads/validators";
import { accountBalancePayload } from "../../src/payloads/common";
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

test("can get validators", async () => {
  console.log("Calling Libra Explorer API");
  const client = new LibraClient();
  await client.connect();
  client.assertReady();

  const res = await client.getIndex();

  // testnet is 2
  expect(res.chain_id).toBe(2);

  const p = await client.postViewFunc(currentValidatorsPayload);
  if (Array.isArray(p[0])) {
    expect(p[0].length).toBeGreaterThan(1);
  } else {
    throw new Error("Expected p[0] to be an array");
  }
});

test("can get balance", async () => {
  console.log("Calling Libra Explorer API");
  const client = new LibraClient();
  await client.connect();
  client.assertReady();

  const res = await client.getIndex();

  // testnet is 2
  expect(res.chain_id).toBe(2);
  const b = accountBalancePayload(
    "0x87515d94a244235a1433d7117bc0cb154c613c2f4b1e67ca8d98a542ee3f59f5",
  );
  const p = await client.postViewFunc(b);
  expect(Number(p[0])).toBeGreaterThan(0);
});
