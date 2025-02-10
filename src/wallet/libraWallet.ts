import type {
  AccountAddress,
  AccountAuthenticatorEd25519,
  AnyRawTransaction,
  CommittedTransactionResponse,
  Ed25519Account,
  InputGenerateTransactionOptions,
  MoveFunctionId,
  SimpleEntryFunctionArgumentTypes,
  SimpleTransaction,
} from "@aptos-labs/ts-sdk";
import { mnemonicToAccountObj } from "../crypto/keyFactory";
import { signTransactionWithAuthenticatorDiem } from "../transaction/txSigning";

import { Libra } from "../api/vendorClient";

/**
 * CryptoWallet class provides functionalities for handling a cryptocurrency wallet.
 * It allows generating an account from a mnemonic phrase, signing messages and transactions,
 * verifying signatures, and submitting transactions to the blockchain.
 */
export class LibraWallet {
  /**
   * The account associated with this wallet, generated from a mnemonic phrase.
   */
  readonly account: Ed25519Account;
  onchainAddress?: AccountAddress;
  readonly libra: Libra;

  /**
   * Transaction options that can be modified based on user preferences.
   */
  tx_options: InputGenerateTransactionOptions;

  /**
   * Constructs a CryptoWallet instance by generating an account from a mnemonic phrase.
   * @param mnemonic - The mnemonic phrase used to generate the account.
   */
  constructor(mnemonic: string, network?: Network, fullnode?: string) {
    this.account = mnemonicToAccountObj(mnemonic);
    this.tx_options = {
      maxGasAmount: 40000,
      gasUnitPrice: 100,
    }; // Default options
    this.libra = new Libra(network, fullnode);
  }

  /**
   * Requires connection to a fullnode, will check the actual address which this
   * authKey owns on chain.
   */
  async sync_onchain() {
    this.onchainAddress = await this.libra.getOriginatingAddress(
      this.account.publicKey.authKey(),
    );
  }

  get_address(): AccountAddress {
    return this.onchainAddress ?? this.account.accountAddress;
  }

  /**
   * Signs a raw transaction using the account's private key.
   * @param transaction - The raw transaction object that needs to be signed.
   * @returns A SignerAuthenticator object containing the signed transaction data.
   */
  signTransaction(transaction: AnyRawTransaction): AccountAuthenticatorEd25519 {
    return signTransactionWithAuthenticatorDiem(this.account, transaction);
  }

  /**
   *
   * @param entry_function address of the function e.g. "0x1::ol_account::transfer"
   * @param args: list of simple serializable Move values e.g. [marlon_addr, 100]
   */
  async buildTransaction(
    entry_function: MoveFunctionId,
    args: Array<SimpleEntryFunctionArgumentTypes>,
  ): Promise<SimpleTransaction> {
    return await this.libra.transaction.build.simple({
      sender: this.onchainAddress ?? this.account.accountAddress,
      data: {
        function: entry_function,
        functionArguments: args,
      },
      options: this.tx_options,
    });
  }
  /**
   * Simple transfer function between ordinary accounts
   * @param recipient address of recipient
   * @param amount non-decimal coin amount for transfer. Libra uses 6 decimal places. e.g. 1 coin = 1,000,000 amount
   */
  async buildTransferTx(
    recipient: AccountAddress,
    amount: number,
  ): Promise<AnyRawTransaction> {
    return this.buildTransaction("0x1::ol_account::transfer", [
      recipient.toString(),
      amount,
    ]);
  }
  /**
   * Submits a signed transaction to the blockchain network.
   * @param transaction - The raw transaction object that needs to be signed.
   */
  async signSubmitWait(
    transaction: AnyRawTransaction,
  ): Promise<CommittedTransactionResponse> {
    const signerAuthenticator = this.signTransaction(transaction);
    return this.libra
      .submitAndWait(transaction, signerAuthenticator)
      .then((res) => {
        console.log(
          `Transaction success: ${res.success}, vm_status: ${res.vm_status}`,
        );
        return res;
      });
  }
}
