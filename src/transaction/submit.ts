import { AptosConfig, generateSignedTransaction, postAptosFullNode, type AccountAuthenticatorEd25519, type AnyRawTransaction, type CommittedTransactionResponse, type InputSubmitTransactionData, type PendingTransactionResponse } from "@aptos-labs/ts-sdk";
import { wrapLibra } from "../api/vendorClient";

export async function submitTransactionDiem(
  args: {
    aptosConfig: AptosConfig;
  } & InputSubmitTransactionData,
): Promise<PendingTransactionResponse> {
  const { aptosConfig } = args;
  const signedTransaction = generateSignedTransaction({ ...args });
  const { data } = await postAptosFullNode<Uint8Array, PendingTransactionResponse>({
    aptosConfig,
    body: signedTransaction,
    path: "transactions",
    originMethod: "submitTransaction",
    // override the crazy x.aptos content-types
    contentType: "application/x.diem.signed_transaction+bcs",
  });
  return data;
}

export async function submitAndWait(transaction: AnyRawTransaction, authenticator: AccountAuthenticatorEd25519): Promise<CommittedTransactionResponse> {
  const libra = wrapLibra();
  const args = {
    transaction: transaction,
    senderAuthenticator: authenticator,
  };
  const submittedTransaction = await submitTransactionDiem({
    aptosConfig: libra.config,
    ...args,
  });

  console.log(`Submitted transaction hash: ${submittedTransaction.hash}`);

  // 5. Wait for results
  return libra.waitForTransaction({
    transactionHash: submittedTransaction.hash,
  })
}
