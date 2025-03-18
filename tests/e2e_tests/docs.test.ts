// DEV note: the instructions in readme.md should
// be copy-paste-proof. Write them here
// and then copy them over to the instructions.

import { afterEach, beforeEach, expect, test } from "bun:test";
import { LibraWallet } from "../../src/wallet/libraWallet";
import { ALICE_MNEM } from "../../src/local_testnet/fixture_mnemonics";
import { testnetDown, testnetUp } from "../../src/local_testnet/compose";
import { addressFromString } from "../../src/crypto/keyFactory";
import { Ed25519Account, Ed25519PrivateKey, Network } from "@aptos-labs/ts-sdk";
import { LibraClient } from "../../src/client/client";
import { MAINNET_URL } from "../../src";

const TESTNET_URL = "http://localhost:8280/v1";

beforeEach(async () => {
  console.log("testnet setup");
  // make sure we teardown any zombies first
  await testnetDown();
  await testnetUp();
});

afterEach(async () => {
  await testnetDown().then(() => {
    console.log("testnet down");
  });
});

const MNEM = ALICE_MNEM;

test(
  "quickstart instructions work",
  async () => {
    // Uses LibraWallet for common account operations
    // import { LibraWallet, Network, addressFromString } from 'open-libra-sdk'

    // const TESTNET_URL = "https://testnet.openlibra.io/v1";
    // const MNEM = "your mnemonic..."

    // For mainnet, just initialize with your mnemonic
    // const wallet_mainnet = LibraWallet.fromMnemonic(MNEM);

    // optionally, connect to a local testnet, by adding vars
    const wallet = LibraWallet.fromMnemonic(MNEM, Network.TESTNET, TESTNET_URL);

    // check your connection to the fullnode
    const ledgerInfo = await wallet.client?.getLedgerInfo();
    console.log("block height:", ledgerInfo?.block_height);

    // get the account's state from chain
    await wallet.syncOnchain();

    // parse an address which you'd like to send a tx to
    const addressObj = addressFromString("0xDECAFC0FFEE");

    // use the transfer helper function
    const tx = await wallet.buildTransferTx(addressObj, 100);
    // wait for the result
    const res = await wallet.signSubmitWait(tx);

    if (res.success == false) {
      throw "Tx fails";
    }
  },
  { timeout: 40_000 },
);

test("create a client instructions work", async () => {
  // import { LibraClient, Network,  } from 'open-libra-sdk'

  // const TESTNET_URL = "https://testnet.openlibra.io/v1";

  // for mainnet
  // const client_mainnet = new LibraClient();
  // local testnet
  const client_testnet = new LibraClient(Network.TESTNET, TESTNET_URL);

  const ledgerInfo = await client_testnet.getLedgerInfo();
  console.log("block height:", ledgerInfo.block_height);

  expect(ledgerInfo.block_height).toBeDefined();

  // Advanced:
  // You can reuse this client instance to create a LibraWallet instance for a user.
  // First get the Ed25519Account type, in this case generated:
  const edAccount = Ed25519Account.generate();
  // then init a wallet
  const wallet = LibraWallet.fromPrivateKey(
    edAccount.accountAddress,
    edAccount.privateKey,
    client_testnet,
  );
  // now you can use the wallet to interact with the chain
  const id = await wallet.client?.general.getChainId();
  console.log(id);
  expect(id).toBeDefined();
});

test(
  "get resources instructions work",
  async () => {
    // import { LibraClient, Network,  } from 'open-libra-sdk'

    // const TESTNET_URL = "https://testnet.openlibra.io/v1";
    const libra = new LibraClient(Network.TESTNET, TESTNET_URL);

    interface Coin {
      coin: {
        value: number;
      };
    }

    const res = await libra.getResource<Coin>(
      // alice
      "0x87515d94a244235a1433d7117bc0cb154c613c2f4b1e67ca8d98a542ee3f59f5",
      "0x1::coin::CoinStore<0x1::libra_coin::LibraCoin>",
    );
    if (res.coin.value == 0) {
      throw "no coin found";
    }
  },
  { timeout: 40_000 },
);

test(
  "init wallet instructions work",
  async () => {
    // You can construct the wallet object for offline (cold wallet)
    // cases as well as online wallets to update state and submit transactions

    // COLD WALLETS
    // simple case: cold wallet, where no key rotation happened
    const coldWalletFromMnem = LibraWallet.fromMnemonic(MNEM);
    console.log("address:", coldWalletFromMnem.getAddress().toStringLong());

    // set specific private key and address: in case of key rotation
    const addressObj = addressFromString("0xDECAFC0FFEE");

    const pkey = new Ed25519PrivateKey(
      "0x74f18da2b80b1820b58116197b1c41f8a36e1b37a15c7fb434bb42dd7bdaa66b",
    );
    const coldWalletWithKey = LibraWallet.fromPrivateKey(addressObj, pkey);
    console.log(
      "other address:",
      coldWalletWithKey.getAddress().toStringLong(),
    );

    // ONLINE WALLETS
    const mainnetHotWallet = LibraWallet.fromMnemonic(
      MNEM,
      Network.MAINNET,
      MAINNET_URL,
    );
    console.log("fullnode url:", mainnetHotWallet.client?.config.fullnode);

    // Online wallet, using testnet
    const testnetHotWallet = LibraWallet.fromMnemonic(
      MNEM,
      Network.TESTNET,
      TESTNET_URL,
    );

    // Get the latest account state.
    // Checks if key is rotated and update the LibraWallet.onchainAddress
    // will also update to the most recent sequence number found on chain
    // plus if the authentication key was changed
    await testnetHotWallet.syncOnchain().then(() => {
      console.log(
        "sequence number:",
        testnetHotWallet.txOptions.accountSequenceNumber,
      );
    });
  },
  { timeout: 40_000 },
);

test(
  "build transactions instructions work",
  async () => {
    // Online wallet, using local docker testnet
    const testnetHotWallet = LibraWallet.fromMnemonic(
      MNEM,
      Network.TESTNET,
      TESTNET_URL,
    );

    // ... continued from above

    const tx = await testnetHotWallet.buildTransaction(
      "0x1::ol_account::transfer",
      [
        // address string (here's a good practice to check address parsing)
        addressFromString("0x1234").toStringLong(),
        // number of coins
        100,
      ],
    );
    const res = await testnetHotWallet.signSubmitWait(tx);
    if (res.success == false) {
      throw "Tx failed";
    }

    // ... continued from above
    // remember to update the account sequence number like so:
    await testnetHotWallet.syncOnchain();
    // send another transaction
    const tx2 = await testnetHotWallet.buildTransferTx(
      addressFromString("0xabcde"),
      100,
    );
    const res2 = await testnetHotWallet.signSubmitWait(tx2);
    if (res2.success == false) {
      throw "Tx failed";
    }
  },
  { timeout: 40_000 },
);
