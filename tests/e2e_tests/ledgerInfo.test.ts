import { afterAll, beforeAll, expect, test } from "bun:test";
import { testnetDown, testnetUp } from "../../src/local_testnet/compose";
import { DOCKER_URL, LibraClient } from "../../src/client/client";
import { Network } from "@aptos-labs/ts-sdk";
import {
  getLatestBlocks,
  getLatestTxVersions,
} from "../../src/ledger/ledgerInfo";

beforeAll(async () => {
  await testnetDown();
  await testnetUp();
});

afterAll(async () => {
  await testnetDown();
});

test("can retrieve latest blocks using LibraClient", async () => {
  const client = new LibraClient(Network.TESTNET, DOCKER_URL);
  // wait a few seconds to produce blocks
  await new Promise((resolve) => setTimeout(resolve, 5000)); // wait for 5

  // loop on checking the ledger info and continue when the block height is greater than 5.
  const ledgerInfo = await client.general.getLedgerInfo();
  let latestHeight = Number(ledgerInfo.block_height);
  while (latestHeight <= 5) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for 1 second
    const ledgerInfo = await client.general.getLedgerInfo();
    latestHeight = Number(ledgerInfo.block_height);
  }

  const latestBlocks = await getLatestBlocks(client, 5); // fetch 5 latest blocks

  expect(Array.isArray(latestBlocks)).toBe(true);
  expect(latestBlocks.length).toBe(5);

  // Optionally, check the structure of a block
  const block = latestBlocks[0];
  expect(block).toHaveProperty("block_height");
  expect(block).toHaveProperty("transactions");
}, 60_000);

test("can retrieve latest versions using LibraClient", async () => {
  const client = new LibraClient(Network.TESTNET, DOCKER_URL);
  // wait a few seconds to produce transactions/versions
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // loop on checking the ledger info and continue when the ledger version is greater than 5.
  const ledgerInfo = await client.general.getLedgerInfo();
  let latestVersion = Number(ledgerInfo.ledger_version);
  while (latestVersion <= 5) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const ledgerInfo = await client.general.getLedgerInfo();
    latestVersion = Number(ledgerInfo.ledger_version);
  }

  const latestVersions = await getLatestTxVersions(client, 5, false); // fetch 5 latest versions
  expect(Array.isArray(latestVersions)).toBe(true);
  expect(latestVersions.length).toBe(5);

  // Optionally, check the structure of a version/txn
  const txn = latestVersions[0];
  expect(txn).toHaveProperty("version");
  expect(txn).toHaveProperty("hash");

  // in the local testnet there would be no user transactions
  const latestUserTxVersions = await getLatestTxVersions(client, 5, true); // fetch 5 latest user transaction versions
  expect(Array.isArray(latestUserTxVersions)).toBe(true);
  expect(latestUserTxVersions.length).toBe(0);
}, 60_000);
