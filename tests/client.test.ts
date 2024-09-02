import { test } from "bun:test"
import { LibraClient } from "../src/api/api";
import { currentValidatorsPayload } from "../src/payloads/validators";

test("can get validators", async () => {
    console.log("Calling Libra Explorer API");
    let client = new LibraClient();
    await client.connect();
    client.assertReady();


    let res = await client.getIndex();
    console.log(res);

    let p = await client.postViewFunc(currentValidatorsPayload);
    console.log(p);
  })
