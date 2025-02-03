import { expect, test } from "bun:test";
import { LibraClient } from "../src/api/api";
import { currentValidatorsPayload } from "../src/payloads/validators";

test("can get validators", async () => {
  console.log("Calling Libra Explorer API");
  const client = new LibraClient();
  await client.connect();
  client.assertReady();

  const res = await client.getIndex();

  expect(res.chain_id).toBe(1);

  const p = await client.postViewFunc(currentValidatorsPayload);
  console.log(p[0].length);
  expect(p[0].length).toBeGreaterThan(1);
});
