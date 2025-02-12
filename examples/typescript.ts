// Example for how a node module would import the sdk

import { generateMnemonic, LibraWallet } from '../dist/index.ts';

const main = async () => {
  const mnem = generateMnemonic();
  console.log("Generate a mnemonic:\n");

  console.log(mnem, "\n");

  let coldWallet = new LibraWallet(mnem);
  console.log(coldWallet.getAddress().toStringLong())
}

main()
