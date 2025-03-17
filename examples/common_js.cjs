// Example for how common js would import the sdk

const libraSDK = require('open-libra-sdk');

const main = async () => {
  const mnem = libraSDK.generateMnemonic();
  console.log("Generate a mnemonic:\n");

  console.log(mnem, "\n");

  let coldWallet = new libraSDK.LibraWallet(mnem);
  console.log(coldWallet.getAddress().toStringLong())

  // optionally connect instantiate a wallet with a client for mainnet
  // const mainnetWallet = new libraSDK.LibraWallet(mnem, "mainnet", libraSDK.MAINNET_URL);

  // const ledgerInfo = await mainnetWallet.client.getLedgerInfo();
  // console.log(ledgerInfo);
}

main()
