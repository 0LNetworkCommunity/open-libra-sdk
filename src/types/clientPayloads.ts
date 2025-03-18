import type {
  InputViewFunctionJsonData,
  LedgerVersionArg,
} from "@aptos-labs/ts-sdk";

// wrapper for the client.view() view function caller
export interface ViewArgs {
  payload: InputViewFunctionJsonData;
  options?: LedgerVersionArg;
}

export interface EventObj {
  address: string;
  struct: string;
  handler_field: string;
}
