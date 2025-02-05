import {
  AptosConfig,
  Network,
  Aptos,
  type MoveStructId,
} from "@aptos-labs/ts-sdk";
import { DEBUG_URL } from "./api";
import { addressFromString } from "../crypto/keyFactory";

export function wrapLibra(): Aptos {
  // 0. Setup the client and test accounts
  const config = new AptosConfig({
    network: Network.MAINNET,
    fullnode: DEBUG_URL,
  });

  return new Aptos(config);
}

// @params account can be string
// @params struct_id can be a string in format x::y::z
export async function get_resource<T extends {} = any>(
  account: string,
  struct_id: MoveStructId,
): Promise<T> {
  const aptos = wrapLibra();
  const account_parse = addressFromString(account);
  return await aptos.getAccountResource<T>({
    accountAddress: account_parse,
    resourceType: struct_id,
  });
}
