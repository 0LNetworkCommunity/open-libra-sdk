import { LibraClient } from "../api/api";
import { currentValidatorsPayload } from "../payloads/validators";
import { currentValidators } from "../sugar/validatorHelpers";

console.log("Calling Libra Explorer API");
let client = new LibraClient();
await client.checkAPIConnectivity();
client.assertReady();


let res = await client.getIndex();
console.log(res);

let p = await client.postViewFunc(currentValidatorsPayload);
console.log(p);

let vals = await currentValidators(client);
console.log(vals);
