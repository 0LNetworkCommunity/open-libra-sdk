import type {
  AccountAddress,
  AccountAuthenticatorEd25519,
  AnyRawTransaction,
  CommittedTransactionResponse,
  Ed25519Account,
  Ed25519PrivateKey,
  InputGenerateTransactionOptions,
  MoveFunctionId,
  Network,
  SimpleEntryFunctionArgumentTypes,
  SimpleTransaction,
} from "@aptos-labs/ts-sdk";
import { mnemonicToAccountObj, newAccount } from "../crypto/keyFactory";
import { signTransactionWithAuthenticatorDiem } from "../transaction/txSigning";

import { LibraClientV2 } from "../client/client";

/**
 * CryptoWallet class provides functionalities for handling a cryptocurrency wallet.
 * It allows generating an account from a mnemonic phrase, signing messages and transactions,
 * verifying signatures, and submitting transactions to the blockchain.
 * It has modes for using online with a client, or offline for account recovery
 * and tx signing only (cold wallet).
 */
export class LibraWallet {
  /**
   * The account associated with this wallet, generated from a mnemonic phrase.
   */
  readonly account: Ed25519Account;
  onchainAddress?: AccountAddress;
  readonly client?: LibraClientV2;

  /**
   * Transaction options that can be modified based on user preferences.
   */
  txOptions: InputGenerateTransactionOptions;

  private constructor(
    account: Ed25519Account,
    client?: LibraClientV2,
    address?: AccountAddress,
  ) {
    this.account = account;
    this.client = client;
    this.onchainAddress = address;
    this.txOptions = {
      maxGasAmount: 40000,
      gasUnitPrice: 100,
    };
  }

  /**
   * Creates a wallet instance from a mnemonic phrase
   * @param mnemonic The mnemonic phrase used to generate the account
   * @param network Optional network settings (MAINNET, TESTNET etc)
   * @param fullnode Optional URL of upstream node
   * @param forceAddress Optional account address if key has rotated
   */
  static fromMnemonic(
    mnemonic: string,
    network?: Network,
    fullnode?: string,
    forceAddress?: AccountAddress,
  ): LibraWallet {
    const account = mnemonicToAccountObj(mnemonic, forceAddress);
    const client = network && fullnode ? new LibraClientV2(network, fullnode) : undefined;
    return new LibraWallet(account, client);
  }

  /**
   * Creates a wallet instance from an existing account address and private key
   * @param address The account address
   * @param privateKey The Ed25519 private key
   * @param client Pre-configured LibraClientV2 instance
   */
  static fromPrivateKey(
    address: AccountAddress,
    privateKey: Ed25519PrivateKey,
    client: LibraClientV2,
  ): LibraWallet {
    const account = newAccount(privateKey, address);
    return new LibraWallet(account, client, address);
  }

  /**
   * Requires connection to a fullnode, will check the actual address which this
   * authKey owns on chain.
   */
  async syncOnchain() {
    const derived_authkey = this.account.publicKey.authKey();
    if (!this.client) throw "Cold wallet can't connect to chain";

    this.onchainAddress =
      await this.client.getOriginatingAddress(derived_authkey);
    if (this.onchainAddress) {
      const account_data = await this.client.account.getAccountInfo({
        accountAddress: this.onchainAddress,
      });

      this.txOptions.accountSequenceNumber = Number(
        account_data.sequence_number,
      );
      if (derived_authkey.toString() != account_data.authentication_key) {
        throw "Derived authentication key does not match the one on-chain, cannot submit transactions";
      }
    }
  }

  getAddress(): AccountAddress {
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
    if (!this.client) throw "Cold wallet can't connect to chain";
    return await this.client.transaction.build.simple({
      sender: this.onchainAddress ?? this.account.accountAddress,
      data: {
        function: entry_function,
        functionArguments: args,
      },
      options: this.txOptions,
    });
  }
  /**
   * Simple transfer function between ordinary accounts
   * @param recipient address of recipient
   * @param amount non-decimal coin amount for transfer. Open Libra uses 6 decimal places. e.g. 1 coin = 1,000,000 amount
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
    if (!this.client) throw "Cold wallet can't connect to chain";

    const signerAuthenticator = this.signTransaction(transaction);
    return this.client
      .submitAndWait(transaction, signerAuthenticator)
      .then((res) => {
        console.log(
          `Transaction success: ${res.success}, vm_status: ${res.vm_status}`,
        );
        return res;
      });
  }
}
