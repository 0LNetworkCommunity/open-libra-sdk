// Example for how common js would import the sdk

const libraSDK = require('open-libra-sdk');

const main = async () => {
  const mnem = libraSDK.generateMnemonic();
  console.log("Generate a mnemonic:\n");

  console.log(mnem, "\n");

  let coldWallet = libraSDK.LibraWallet.fromMnemonic(mnem);
  console.log(coldWallet.getAddress().toStringLong())

  let client = new libraSDK.LibraClient(libraSDK.Network.MAINNET);
  console.log(`Client created for: ${client.config.network}`);

  // call a view function with a helper object that contains the
  // payload for querying the current validators

  // let vals = await client.general.viewJson(libraSDK.currentValidatorsPayload);
  // console.log(vals);

}

main()
