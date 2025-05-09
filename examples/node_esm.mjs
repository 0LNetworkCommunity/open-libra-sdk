// Example for how a node module would import the sdk

import { currentValidatorsPayload, generateMnemonic, LibraWallet, LibraClient, Network }  from 'open-libra-sdk';

const main = async () => {
  const mnem = generateMnemonic();
  console.log("Generate a mnemonic:\n");

  console.log(mnem, "\n");

  let coldWallet = LibraWallet.fromMnemonic(mnem);
  console.log(coldWallet.getAddress().toStringLong())

  let client = new LibraClient(Network.MAINNET);
  console.log(`Client created for: ${client.config.network}`);

  // call a view function with a helper object that contains the
  // payload for querying the current validators
  // let vals = await client.general.viewJson(currentValidatorsPayload);
  // console.log(vals);
}

main()
