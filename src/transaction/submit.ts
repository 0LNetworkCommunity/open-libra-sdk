import {
  AptosConfig,
  generateSignedTransaction,
  postAptosFullNode,
  type InputSubmitTransactionData,
  type PendingTransactionResponse,
} from "@aptos-labs/ts-sdk";
import { MimeType } from "@aptos-labs/ts-sdk"; // Import MimeType from the vendor

export async function submitTransactionDiem(
  args: {
    aptosConfig: AptosConfig;
  } & InputSubmitTransactionData,
): Promise<PendingTransactionResponse> {
  const { aptosConfig } = args;
  const signedTransaction = generateSignedTransaction({ ...args });

  const { data } = await postAptosFullNode<
    Uint8Array,
    PendingTransactionResponse
  >({
    aptosConfig,
    body: signedTransaction,
    path: "transactions",
    originMethod: "submitTransaction",
    // override the crazy x.aptos content-types
    contentType: "application/x.diem.signed_transaction+bcs" as MimeType,
  });
  return data;
}
