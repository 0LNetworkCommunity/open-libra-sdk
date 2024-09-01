import { postViewFunc } from "../api/api";
import { currentValidatorsPayload } from "../payloads/validators";


export const currentVals = async (): Promise<string[]> => {
  const res = await postViewFunc(currentValidatorsPayload);
  if (res.length == 1) {
    let list: string[] = res[0];
    return list
  } else {
    throw "API error, no validator array found"
  }
}
