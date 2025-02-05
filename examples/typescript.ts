// Example for how a node module would import the sdk

import { generateMnemonic } from '../dist/index.ts';

const main = async () => {
  const mnem = generateMnemonic();
  console.log("Generate a mnemonic:\n");

  console.log(mnem, "\n");
}

main()
