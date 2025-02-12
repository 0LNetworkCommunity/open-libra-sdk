import { LibraClient } from "../src/api/api";
import { currentValidatorsPayload } from "../src/payloads/validators";
import { currentValidators } from "../src/sugar/validatorHelpers";

console.log("Calling Libra Explorer API");
const client = new LibraClient();
await client.connect();
client.assertReady();

const res = await client.getIndex();
console.log(res);

const p = await client.postViewFunc(currentValidatorsPayload);
console.log(p);

const vals = await currentValidators(client);
console.log(vals);
