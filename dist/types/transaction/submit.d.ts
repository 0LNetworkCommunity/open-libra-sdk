import { AptosConfig, type AccountAuthenticatorEd25519, type AnyRawTransaction, type CommittedTransactionResponse, type InputSubmitTransactionData, type PendingTransactionResponse } from "@aptos-labs/ts-sdk";
export declare function submitTransactionDiem(args: {
    aptosConfig: AptosConfig;
} & InputSubmitTransactionData): Promise<PendingTransactionResponse>;
export declare function submitAndWait(transaction: AnyRawTransaction, authenticator: AccountAuthenticatorEd25519): Promise<CommittedTransactionResponse>;
//# sourceMappingURL=submit.d.ts.map