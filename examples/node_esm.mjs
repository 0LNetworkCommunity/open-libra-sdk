// Example for how a node module would import the sdk

import { generateMnemonic, LibraWallet }  from 'open-libra-sdk';

const main = async () => {
  const mnem = generateMnemonic();
  console.log("Generate a mnemonic:\n");

  console.log(mnem, "\n");

  let coldWallet = new LibraWallet(mnem);
  console.log(coldWallet.getAddress().toStringLong())
}

main()
