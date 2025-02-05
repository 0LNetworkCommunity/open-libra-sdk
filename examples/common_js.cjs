// Example for how common js would import the sdk

const libraSDK = require('../dist/index.cjs');

const main = async () => {
  const mnem = libraSDK.generateMnemonic();
  console.log("Generate a mnemonic:\n");

  console.log(mnem, "\n");
}

main()
