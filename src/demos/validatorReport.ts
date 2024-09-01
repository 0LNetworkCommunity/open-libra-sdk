import { getIndex, initApi, postViewFunc } from "../api/api";
import { currentValidatorsPayload } from "../payloads/validators";
import { currentVals } from "../sugar/validatorHelpers";

console.log("Calling Libra Explorer API");
await initApi();
let res = await getIndex();
console.log(res);

let p = await postViewFunc(currentValidatorsPayload);
console.log(p);
console.log(p.length);
let vals = await currentVals();
console.log(vals);
