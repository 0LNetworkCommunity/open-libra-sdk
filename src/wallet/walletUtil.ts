import { AccountAddress, AuthenticationKey, type InputViewFunctionJsonData } from "@aptos-labs/ts-sdk";
import { wrapLibra } from "../api/vendorClient";
import { addressFromString } from "../crypto/keyFactory";


export async function getOriginatingAddress(authkey: AuthenticationKey): Promise<AccountAddress> {

  const aptos = wrapLibra();

  const payload: InputViewFunctionJsonData = {
    function: "0x1::account::get_originating_address",
    functionArguments: [authkey.toString()]
  };
  return aptos.viewJson({ payload }).then((r) => addressFromString(r[0].toString()))
}
