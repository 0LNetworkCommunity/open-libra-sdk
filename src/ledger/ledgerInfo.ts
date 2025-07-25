import type { TransactionResponse } from "@aptos-labs/ts-sdk";
import { LibraClient } from "../client/client";
/**
 * Returns the latest versions up to the given limit.
 * @param client LibraClient instance
 * @param limit Number of versions to return
 */
export async function getLatestTxVersions(
  client: LibraClient,
  limit: number,
  only_user_txs: boolean,
): Promise<TransactionResponse[]> {
  const txs = await client.getTransactions({ options: { limit } });
  return only_user_txs
    ? txs.filter((tx) => tx.type === "user_transaction")
    : txs;
}

/**
 * Returns the latest blocks up to the given limit.
 * @param client LibraClient instance
 * @param limit Number of blocks to return
 */
export async function getLatestBlocks(client: LibraClient, limit: number) {
  // Get the latest ledger info to find the current block height
  const ledgerInfo = await client.general.getLedgerInfo();
  const latestHeight = Number(ledgerInfo.block_height);

  // Calculate the starting height (don't go below 0)
  const startHeight = Math.max(0, latestHeight - limit + 1);

  // Fetch blocks from startHeight to latestHeight (inclusive)
  const blocks = [];
  for (let h = startHeight; h <= latestHeight; h++) {
    const block = await client.general.getBlockByHeight({ blockHeight: h });
    blocks.push(block);
  }
  return blocks;
}
