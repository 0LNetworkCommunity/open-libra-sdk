import { LibraClient } from "../api/api";
import { currentValidatorsPayload } from "../payloads/validators";

// TODO make this extend LibraClient
export const currentValidators = async (
  client: LibraClient,
): Promise<string[]> => {
  client.assertReady();

  const res = await client.postViewFunc(currentValidatorsPayload);
  if (res.length == 1) {
    // yuck, response is a list of validator addresses
    const list: string[] = res[0] as string[];
    return list;
  } else {
    throw "API error, no validator array found";
  }
};
