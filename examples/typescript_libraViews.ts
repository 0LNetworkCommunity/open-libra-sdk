// Example for how to use LibraViews to craft a view query in TypeScript/ESM

import { LibraClient, LibraViews, Network } from "open-libra-sdk";

const main = async () => {
  // Example address (replace with a real one)
  const address = "0x123...";

  // Craft the view payload using the sugar function
  const payload = LibraViews.olAccount_balance(address);
  console.log("View payload:", payload);

  // Create a client
  const client = new LibraClient(Network.MAINNET);

  // Call the view function (assuming viewJson is available)
  const result = await client.viewJson(payload);
  console.log("Account balance:", result);
};

main().catch(console.error);
