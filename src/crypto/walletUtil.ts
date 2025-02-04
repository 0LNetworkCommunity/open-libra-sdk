import { AccountAddress, type InputViewFunctionData } from "@aptos-labs/ts-sdk";
import { wrapLibra } from "../api/vendorClient";
import { addressFromString } from "./keyFactory";


export async function getOriginatingAddress(authkey: string): Promise<AccountAddress> {

  const aptos = wrapLibra();

  const payload: InputViewFunctionData = {
    function: "0x1::account::get_originating_address",
    functionArguments: [authkey]
  };
  return aptos.viewJson({ payload }).then((r) => addressFromString(r[0].toString()))
}
