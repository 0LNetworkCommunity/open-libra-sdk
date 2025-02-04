import type { AccountAddress, AccountAuthenticatorEd25519, AnyRawTransaction, CommittedTransactionResponse, Ed25519Account, InputGenerateTransactionOptions } from "@aptos-labs/ts-sdk";
import { mnemonicToAccountObj } from "../crypto/keyFactory";
import { signTransactionWithAuthenticatorDiem } from "../transaction/txSigning";
import { submitAndWait } from "../transaction/submit";
import { getOriginatingAddress } from "./walletUtil";

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

  /**
   * Transaction options that can be modified based on user preferences.
   */
  tx_options: InputGenerateTransactionOptions;

  /**
   * Constructs a CryptoWallet instance by generating an account from a mnemonic phrase.
   * @param mnemonic - The mnemonic phrase used to generate the account.
   */
  constructor(mnemonic: string) {
    this.account = mnemonicToAccountObj(mnemonic);
    this.tx_options  =  {
      maxGasAmount: 40000,
      gasUnitPrice: 100,
    }; // Default options
  }

  /**
 * Requires connection to a fullnode, will check the actual address which this
 * authKey owns on chain.
 */
  async set_originating_address() {
    this.onchainAddress = await getOriginatingAddress(this.account.publicKey.authKey())
  }


  // /**
  //  * Signs a message using the account's private key.
  //  * @param hexInput - The hex-encoded message to sign.
  //  * @returns A signed message in string format.
  //  */
  // signMessage(hexInput: string): string {
  //   return this.account.signMessage(hexInput);
  // }

  /**
   * Signs a raw transaction using the account's private key.
   * @param transaction - The raw transaction object that needs to be signed.
   * @returns A SignerAuthenticator object containing the signed transaction data.
   */
  signTransaction(transaction: AnyRawTransaction): AccountAuthenticatorEd25519 {
    return signTransactionWithAuthenticatorDiem(
        this.account,
        transaction,
    )
  }

  // /**
  //  * Verifies whether a given signature is valid for a provided message.
  //  * @param hexInput - The hex-encoded message that was originally signed.
  //  * @param signature - The cryptographic signature to verify.
  //  * @returns A boolean indicating whether the signature is valid.
  //  */
  // verifySignature(hexInput: string, signature: string): boolean {
  //   return this.account.verifySignature(hexInput, signature);
  // }

  /**
   * Submits a signed transaction to the blockchain network.
   * @param transaction - The raw transaction object that needs to be signed.
   */
  async signSubmitWait(
    transaction: AnyRawTransaction,
  ): Promise<CommittedTransactionResponse> {
    const signerAuthenticator = this.signTransaction(transaction);
    return submitAndWait(transaction, signerAuthenticator)
  }

}
