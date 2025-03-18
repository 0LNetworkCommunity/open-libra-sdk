# open-libra-sdk

A minimalist Typescript library for interacting with the Open Libra blockchain.

```
npm install open-libra-sdk
```
[https://www.npmjs.com/package/open-libra-sdk](https://www.npmjs.com/package/open-libra-sdk)

### Quick Start
```
  // Uses LibraWallet for common account operations
  import { LibraWallet, Network, addressFromString } from 'open-libra-sdk'
  const MNEM = "your mnemonic..."

  // For mainnet, just initialize with your mnemonic
  const wallet = LibraWallet.fromMnemonic(MNEM);

  // optionally, connect to a local testnet, by adding vars
  // const wallet = LibraWallet.fromMnemonic(MNEM, Network.TESTNET, 'http://localhost:8280/v1');

  // check your connection to the fullnode
  const ledgerInfo = await wallet.client?.getLedgerInfo();
  console.log("block height:", ledgerInfo?.block_height);

  // get the account's state from chain
  await wallet.syncOnchain();

  // parse an address which you'd like to send a tx to
  const addressObj = addressFromString(
    "0xDECAFC0FFEE",
  );

  // use the transfer helper function
  const tx = await wallet.buildTransferTx(addressObj, 100);
  // wait for the result
  const res = await wallet.signSubmitWait(tx);

  if (res.success == false) {
    throw "Tx fails"
  }
```

## Common Transactions

#### Create a client
You may not need to instantiate a wallet to check the chain status. Below you can check you can connect to a fullnode, and get the API index with latest block info

```
  import { LibraClient, Network } from 'open-libra-sdk'
  // for mainnet
  const libra = new LibraClient();
  // local testnet
  const libra = new LibraClient(Network.TESTNET, 'http://localhost:8480/v1');

  const ledgerInfo = await libra.getLedgerInfo();

  // Advanced:
  // You can reuse this client instance to create a LibraWallet instance for a user.
  // First get the Ed25519Account type, in this case generated:
  // const edAccount = Ed25519Account.generate()
  // then init a wallet
  // const wallet = new LibraWallet(edAccount, client);
```

#### Fetch Some Data

You can define a Type, and the Libra.getResource will coerce the type in typescript

```

  // import { LibraClient } from 'open-libra-sdk'
  const libra = new LibraClient(Network.TESTNET, 'http://localhost:8280/v1');

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
    throw "no coin found"
  }

```

#### Initialize a wallet

```
    // You can construct the wallet object for offline (cold wallet)
    // cases as well as online wallets to update state and submit transactions

    // COLD WALLETS
    // simple case: cold wallet, where no key rotation happened
    const coldWalletFromMnem = LibraWallet.fromMnemonic(MNEM);
    console.log("address:", coldWalletFromMnem.getAddress().toStringLong());

    // set specific private key and address: in case of key rotation
    const addressObj = addressFromString("0xDECAFC0FFEE");
    const pkey = new Ed25519PrivateKey(
      "0x74f18da2b80b1820b58116197b1c41f8a36e1b37a15c7fb434bb42dd7bdaa66b"
    );
    const coldWalletWithKey = new LibraWallet(
      undefined,
      undefined,
      undefined,
      addressObj,
      pkey,
    );
    console.log("other address:", coldWalletWithKey.getAddress().toStringLong());

    // ONLINE WALLETS
    const mainnetHotWallet = new LibraWallet(
      MNEM,
      Network.MAINNET,
      MAINNET_URL,
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
    await testnetHotWallet.syncOnchain()
      .then(() => {
        console.log("sequence number:", testnetHotWallet.txOptions.accountSequenceNumber);
      });
```

#### Build transactions for Entry Functions
Using the same wallet function above you can build arbitrary "entry functions" which call onchain smart contracts.

```
    // ... continued from above

    const tx = await testnetHotWallet.buildTransaction("0x1::ol_account::transfer", [
      // address string (here's a good practice to check address parsing)
      addressFromString("0x1234abcde").toStringLong(),
      // number of coins
      100,
    ]);
    const t = await testnetHotWallet.signSubmitWait(tx);
    if (t.success == false ) {
      throw "Tx failed"
    }
```

Or use the `transfer` helper for simple account transfers.

```
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
```

## Troubleshooting
There's a known issue when executing using `bun`. Calling a fullnode with an `https` url API will fail. Since http/2 is not fully developed in `bun` as of 1.2.2.

NodeJS (with npm, yarn, pnpm) does not appear to produce this error. Deno is untested.

## Flavors
Look in the `./examples` folder for commonjs, Node, and typescript imports of the module.

In a common JS file you can import the sdk to manage wallets
and query the chain. See the minimal example:
```
const libraSDK = require('open-libra-sdk');

const main = async () => {
  const mnem = libraSDK.generateMnemonic();
  console.log("Generate a mnemonic:\n");

  console.log(mnem, "\n");

  let coldWallet = new libraSDK.LibraWallet(mnem);
  console.log(coldWallet.get_address().toStringLong())

  const mainnetWallet = new libraSDK.LibraWallet(mnem, "mainnet", libraSDK.MAINNET_URL);

  const ledgerInfo = await mainnetWallet.client.getLedgerInfo();
  console.log(ledgerInfo);
}

main()

```

# Testnet in a bottle
Start a containerized testnet with docker etc.
This repo contains a `tests/support/container/compose.yml` which will create a three node testnet with production binaries.

```
# with npm/yarn/bun:
bun run testnet
bun run testnet-down

## call docker directly with:
cd tests/support/container
docker compose up --detach --timeout 600
docker compose down
```


# Maintainers

### Bun
`bun` is the default Node/JS/TS runtime for OL development.

https://bun.sh/docs/installation

### To install dependencies:

```bash
bun install
```

### To run tests:

```bash
bun test
```

End to end tests will start a local testnet before each test, and requires `docker` be installed.

### Documentation
The examples references in README.md must all be tested at: `./tests/e2e_tests/docs.tests.ts`
