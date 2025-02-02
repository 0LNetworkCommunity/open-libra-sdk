import { test } from "bun:test";
import { LibraClient } from "../src/api/api";
import { currentValidatorsPayload } from "../src/payloads/validators";

test("can get validators", async () => {
  console.log("Calling Libra Explorer API");
  const client = new LibraClient();
  await client.connect();
  client.assertReady();

  const res = await client.getIndex();
  console.log(res);

  const p = await client.postViewFunc(currentValidatorsPayload);
  console.log(p);
});
