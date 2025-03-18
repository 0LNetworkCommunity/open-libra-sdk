// Example for how common js would import the sdk

const libraSDK = require('open-libra-sdk');

const main = async () => {
  const mnem = libraSDK.generateMnemonic();
  console.log("Generate a mnemonic:\n");

  console.log(mnem, "\n");

  let coldWallet = new libraSDK.LibraWallet(mnem);
  console.log(coldWallet.getAddress().toStringLong())

  let client = new libraSDK.LibraClientV2(libraSDK.Network.MAINNET);
  console.log(`Client created for: ${client.config.network}`);

  // get the ledger info
  // const ledgerInfo = await client.getLedgerInfo();
  // console.log(ledgerInfo);
}

main()
