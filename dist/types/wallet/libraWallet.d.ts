import type { AccountAddress, AccountAuthenticatorEd25519, AnyRawTransaction, CommittedTransactionResponse, Ed25519Account, InputGenerateTransactionOptions, MoveFunctionId, SimpleEntryFunctionArgumentTypes, SimpleTransaction } from "@aptos-labs/ts-sdk";
/**
 * CryptoWallet class provides functionalities for handling a cryptocurrency wallet.
 * It allows generating an account from a mnemonic phrase, signing messages and transactions,
 * verifying signatures, and submitting transactions to the blockchain.
 */
export declare class LibraWallet {
    /**
     * The account associated with this wallet, generated from a mnemonic phrase.
     */
    readonly account: Ed25519Account;
    onchainAddress?: AccountAddress;
    /**
     * Transaction options that can be modified based on user preferences.
     */
    tx_options: InputGenerateTransactionOptions;
    /**
     * Constructs a CryptoWallet instance by generating an account from a mnemonic phrase.
     * @param mnemonic - The mnemonic phrase used to generate the account.
     */
    constructor(mnemonic: string);
    /**
     * Requires connection to a fullnode, will check the actual address which this
     * authKey owns on chain.
     */
    sync_onchain(): Promise<void>;
    get_address(): AccountAddress;
    /**
     * Signs a raw transaction using the account's private key.
     * @param transaction - The raw transaction object that needs to be signed.
     * @returns A SignerAuthenticator object containing the signed transaction data.
     */
    signTransaction(transaction: AnyRawTransaction): AccountAuthenticatorEd25519;
    /**
     *
     * @param entry_function address of the function e.g. "0x1::ol_account::transfer"
     * @param args: list of simple serializable Move values e.g. [marlon_addr, 100]
     */
    buildTransaction(entry_function: MoveFunctionId, args: Array<SimpleEntryFunctionArgumentTypes>): Promise<SimpleTransaction>;
    /**
     * Simple transfer function between ordinary accounts
     * @param recipient address of recipient
     * @param amount non-decimal coin amount for transfer. Libra uses 6 decimal places. e.g. 1 coin = 1,000,000 amount
     */
    buildTransferTx(recipient: AccountAddress, amount: number): Promise<AnyRawTransaction>;
    /**
     * Submits a signed transaction to the blockchain network.
     * @param transaction - The raw transaction object that needs to be signed.
     */
    signSubmitWait(transaction: AnyRawTransaction): Promise<CommittedTransactionResponse>;
}
//# sourceMappingURL=libraWallet.d.ts.map