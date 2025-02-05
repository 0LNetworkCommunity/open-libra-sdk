import { AccountAuthenticatorEd25519, Ed25519Account, Ed25519Signature, type AnyRawTransaction } from "@aptos-labs/ts-sdk";
export declare function generateSigningMessageForTransactionDiem(transaction: AnyRawTransaction): Uint8Array;
export declare function generateSigningMessageDiem(bytes: Uint8Array, domainSeparator: string): Uint8Array;
export declare function signTransactionDiem(accountObj: Ed25519Account, transaction: AnyRawTransaction): Ed25519Signature;
export declare function signTransactionWithAuthenticatorDiem(accountObj: Ed25519Account, transaction: AnyRawTransaction): AccountAuthenticatorEd25519;
//# sourceMappingURL=txSigning.d.ts.map