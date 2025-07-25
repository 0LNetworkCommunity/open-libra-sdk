// Example for how to use LibraViews to craft a view query in TypeScript/ESM
// NOTE: there's a known issue with `bun` which doesn't support the underlying HTTP client used by `LibraClient`.

import { getLatestBlocks, getLatestTxVersions, LibraClient, LibraViews, Network } from "open-libra-sdk";

const main = async () => {
  // Create a client
  console.log("Creating LibraClient for MAINNET");
  const client = new LibraClient(Network.MAINNET, "https://rpc.scan.openlibra.io/v1");

  // Query the latest 5 blocks
  const latestBlocks = await getLatestBlocks(client, 5);
  console.log("Latest 5 blocks:\n", JSON.stringify(latestBlocks, null, 2));

  // Query the latest 5 transaction versions (all types)
  const latestVersions = await getLatestTxVersions(client, 5, false);
  console.log("Latest 5 transaction versions (all types):\n", JSON.stringify(latestVersions, null, 2));

  // Query the latest 5 user transactions only
  const latestUserTxs = await getLatestTxVersions(client, 5, true);
  console.log("Latest 5 user transactions only:\n", JSON.stringify(latestUserTxs, null, 2));


  // Example address (replace with a real one)
  const address = "0x123";

  // Craft the view payload using the sugar function
  const payload = LibraViews.olAccount_balance(address);
  console.log("View payload:", payload);


  // Call the view function (assuming viewJson is available)
  const result = await client.viewJson(payload);
  console.log("Account balance:", result);
};

main().catch(console.error);
