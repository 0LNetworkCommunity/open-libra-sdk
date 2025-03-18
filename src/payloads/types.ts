import type { InputViewFunctionData, LedgerVersionArg } from "@aptos-labs/ts-sdk";

// wrapper for the client.view() view function caller
export interface ViewArgs {
  payload: InputViewFunctionData;
  options?: LedgerVersionArg;
}

export interface EventObj {
  address: string;
  struct: string;
  handler_field: string;
}
