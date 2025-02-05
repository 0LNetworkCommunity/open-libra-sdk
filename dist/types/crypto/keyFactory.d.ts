import { AccountAddress, AuthenticationKey, Ed25519Account, Ed25519PrivateKey, Ed25519PublicKey } from "@aptos-labs/ts-sdk";
export declare function isMnemString(mnemonic: string): boolean;
export declare function mnemonicToPrivateKey(mnemonic: string): Uint8Array;
export declare function privateKeyToPublicKey(privateKey: Uint8Array): Uint8Array<ArrayBufferLike>;
export declare function publicKeyBytesToAuthKey(publicKey: Uint8Array): Uint8Array;
export declare function publicKeyToAuthKey(publicKey: Ed25519PublicKey): AuthenticationKey;
export declare function mnemonicToAuthKey(mnemonic: string): Uint8Array<ArrayBufferLike>;
export declare function deriveLegacyAddress(authKey: Uint8Array): Uint8Array;
export declare function mnemonicToEd25519PrivateKey(mnemonic: string): Ed25519PrivateKey;
export declare function mnemonicToAccountObj(mnemonic: string): Ed25519Account;
export declare function addressFromString(literal: string): AccountAddress;
export declare function generateMnemonic(): string;
//# sourceMappingURL=keyFactory.d.ts.map