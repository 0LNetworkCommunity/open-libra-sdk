import {
  AccountAddress,
  AuthenticationKey,
  type InputViewFunctionJsonData,
  type MoveValue,
} from "@aptos-labs/ts-sdk";
import { wrapLibra } from "../api/vendorClient";
import { addressFromString } from "../crypto/keyFactory";

export async function getOriginatingAddress(
  authkey: AuthenticationKey,
): Promise<AccountAddress> {
  const aptos = wrapLibra();

  const payload: InputViewFunctionJsonData = {
    function: "0x1::account::get_originating_address",
    functionArguments: [authkey.toString()],
  };
  return aptos
    .viewJson({ payload })
    .then((r: MoveValue[]) => {
      if (r[0] == null) {
        throw new Error("Received null or undefined value");
      }
      return addressFromString(r[0].toString());
    })
    .catch((e) => {
      throw e;
    });
}
