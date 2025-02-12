// DEV note: the instructions in readme.md should
// be copy-paste-proof. Write them here
// and then copy them over to the instructions.

import { afterEach, beforeEach, test } from "bun:test";
import { LibraWallet } from "../../src/wallet/libraWallet";
import { ALICE_MNEM } from "../support/fixture_mnemonics";
import { testnetDown, testnetUp } from "../support/compose";
import { addressFromString } from "../../src/crypto/keyFactory";
import { Ed25519PrivateKey, Network } from "@aptos-labs/ts-sdk";
import { Libra } from "../../src/api/vendorClient";
import { CANONICAL_URL } from "../../src";
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
    // import { LibraWallet, Network } from 'open-libra-sdk'
    // const MNEM = "your mnemonic..."

    // For mainnet, just initialize with your mnemonic
    // const wallet = new LibraWallet(MNEM);

    // optionally, connect to a local testnet, by adding vars
    const wallet = new LibraWallet(
      MNEM,
      Network.TESTNET,
      "http://localhost:8280/v1",
    );

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

test(
  "get resources instructions work",
  async () => {
    // import { Libra } from 'open-libra-sdk'
    const libra = new Libra(Network.TESTNET, "http://localhost:8280/v1");

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
    const coldWalletFromMnem = new LibraWallet(MNEM);
    console.log("address:", coldWalletFromMnem.getAddress().toStringLong());

    // set specific private key and address: in case of key rotation
    const addressObj = addressFromString("0xDECAFC0FFEE");
    const pkey = new Ed25519PrivateKey(
      "0x74f18da2b80b1820b58116197b1c41f8a36e1b37a15c7fb434bb42dd7bdaa66b",
    );
    const coldWalletWithKey = new LibraWallet(
      undefined,
      undefined,
      undefined,
      addressObj,
      pkey,
    );
    console.log(
      "other address:",
      coldWalletWithKey.getAddress().toStringLong(),
    );

    // ONLINE WALLETS
    const mainnetHotWallet = new LibraWallet(
      MNEM,
      Network.MAINNET,
      CANONICAL_URL,
    );
    console.log("fullnode url:", mainnetHotWallet.client?.config.fullnode);

    // Online wallet, using testnet
    const testnetHotWallet = new LibraWallet(
      MNEM,
      Network.TESTNET,
      "http://localhost:8280/v1",
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
    const testnetHotWallet = new LibraWallet(
      MNEM,
      Network.TESTNET,
      "http://localhost:8280/v1",
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
