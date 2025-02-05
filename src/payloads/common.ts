import type { ViewObj } from "./types";

export const accountBalancePayload = (address: string): ViewObj => ({
  function: "0x1::ol_account::balance",
  type_arguments: [],
  arguments: [address],
});
