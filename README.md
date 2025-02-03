# libra-ts-sdk

## Quickstart

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

# Installation

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
