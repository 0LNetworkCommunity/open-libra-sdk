import { afterAll, beforeAll, expect, test } from "bun:test";
import { testnetDown, testnetUp } from "../../src/local_testnet/compose";
import { DOCKER_URL, LibraClientV2 } from "../../src/client/client";
import { Network } from "@aptos-labs/ts-sdk";
import { currentValidatorsPayload } from "../../src/payloads/validators";

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
  const client = new LibraClientV2(Network.TESTNET, DOCKER_URL);
  const chain_id = await client.general.getChainId();

  expect(chain_id).toBe(2);

});

test("can get validators", async () => {
  console.log("Calling Libra Explorer API");
  const client = new LibraClientV2();
  const vals = await client.general.view(currentValidatorsPayload);
  console.log(vals);

});

// test("can get balance", async () => {
//   console.log("Calling Libra Explorer API");
//   const client = new LibraClient();
//   await client.connect();
//   client.assertReady();

//   const res = await client.getIndex();

//   // testnet is 2
//   expect(res.chain_id).toBe(2);
//   const b = accountBalancePayload(
//     "0x87515d94a244235a1433d7117bc0cb154c613c2f4b1e67ca8d98a542ee3f59f5",
//   );
//   const p = await client.postViewFunc(b);
//   expect(Number(p[0])).toBeGreaterThan(0);
// });
