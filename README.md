# libra-ts-sdk

A minimalist Typescript library for interacting with the Open Libra blockchain.

## Common Transactions

#### Check your connection
Check you can connect to a fullnode, and get the API index with latest block info

```
  import {wrapLibra} from 'libraSdk'
  const libra = wrapLibra();
  const ledgerInfo = await libra.getLedgerInfo();
```

#### Fetch Some Data


You can define a Type, and the get_resource will coerce the type in typescript

```
  import {get_resource} from 'libraSdk'

  interface Coin {
    coin: {
      value: number;
    };
  }

  const res = await get_resource<Coin>(
    "0x4c613c2f4b1e67ca8d98a542ee3f59f5",
    "0x1::coin::CoinStore<0x1::libra_coin::LibraCoin>",
  );

```

#### Initialize a wallet

```
  // requires that you are connected to a fullnode
  const wallet = new LibraWallet("your mnemonic");
  // sync on-chain (and check the account address is correct)
  await wallet.sync_onchain();
```

Build transactions for Entry Functions
```
  const addr_formatted = addressFromString(
    "0xCAFEBABE",
  ).toString();

  const tx = await wallet.buildTransaction("0x1::ol_account::transfer", [
    addr_formatted,
    100,
  ]);
  const t = await wallet.signSubmitWait(tx);
```

Or use the `transfer` helper

```
  const wallet = new LibraWallet("your mnemonic");
  await wallet.sync_onchain();

  const address_obj = addressFromString(
    "0xCAFEBABE",
  );

  const tx = await wallet.transfer(address_obj, 100);
  const res = await wallet.signSubmitWait(tx);

```

## Troubleshooting
There's a known issue where. Executing with `bun` to an `https` url API will fail. Since http/2 is not fully developed in `bun`. NodeJS (with npm, yarn, pnpm) does not appear to produce this error. Deno is untested.

## Flavors
Look in the `./examples` folder for commonjs, Node, and typescript imports of the module.

In a common JS file you can import the sdk to manage wallets
and query the chain. See the minimal example:
```
const libraSDK = require('../libra-ts-sdk/dist/');

const main = async () => {
  const mnem = libraSDK.generateMnemonic();
  console.log("Generate a mnemonic:\n");

  console.log(mnem, "\n");


  console.log("Calling Libra Explorer API");
  const client = new libraSDK.LibraClient();
  await client.connect();
  client.assertReady();

  const res = await client.getIndex();
  console.log(res)
}

main()

```

# Core Devs

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
