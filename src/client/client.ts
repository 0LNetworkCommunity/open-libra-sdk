import {
  AptosConfig,
  Network,
  Aptos,
  type MoveStructId,
  type AnyRawTransaction,
  AccountAuthenticatorEd25519,
  type CommittedTransactionResponse,
  AccountAddress,
  AuthenticationKey,
  type InputViewFunctionJsonData,
  type MoveValue,
} from "@aptos-labs/ts-sdk";
import { addressFromString } from "../crypto/keyFactory";
import { submitTransactionDiem } from "../transaction/submit";

export const MAINNET_URL: string = "https://rpc.scan.openlibra.world/v1";
export const TESTNET_URL: string = "http://testnet.openlibra.io:8080/v1";
// local e2e tests connection, libra-alice in local testnet
export const DOCKER_URL: string = "http://localhost:8280/v1";

// @params account can be string
// @params struct_id can be a string in format x::y::z
export class LibraClient extends Aptos {
  constructor(network?: Network, fullnode?: string) {
    // 0. Setup the client and test accounts
    const config = new AptosConfig({
      network: network ?? Network.MAINNET,
      fullnode: fullnode ?? MAINNET_URL,
      clientConfig: {
        WITH_CREDENTIALS: false, // will cause CORS sadness
      },
    });

    super(config);
  }

  async getResource<T extends object>(
    account: string,
    struct_id: MoveStructId,
  ): Promise<T> {
    const account_parse = addressFromString(account);
    return await this.getAccountResource<T>({
      accountAddress: account_parse,
      resourceType: struct_id,
    });
  }

  async submitAndWait(
    transaction: AnyRawTransaction,
    authenticator: AccountAuthenticatorEd25519,
  ): Promise<CommittedTransactionResponse> {
    const args = {
      transaction: transaction,
      senderAuthenticator: authenticator,
    };
    const submittedTransaction = await submitTransactionDiem({
      aptosConfig: this.config,
      ...args,
    });

    console.log(`Submitted transaction hash: ${submittedTransaction.hash}`);

    return this.waitForTransaction({
      transactionHash: submittedTransaction.hash,
    });
  }

  async getOriginatingAddress(
    authkey: AuthenticationKey,
  ): Promise<AccountAddress> {
    const payload: InputViewFunctionJsonData = {
      function: "0x1::account::get_originating_address",
      functionArguments: [authkey.toString()],
    };
    return this.viewJson({ payload })
      .then((r: MoveValue[]) => {
        if (r[0] == null) {
          throw new Error("Received null or undefined value");
        }
        return addressFromString(r[0].toString());
      })
      .catch((e) => {
        throw e;
      });
  }
}
