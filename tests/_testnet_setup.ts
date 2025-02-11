import { afterEach, beforeEach } from "bun:test";
import { testnetDown, testnetUp } from "./support/compose";

// NOTE: if you are running from CLI the bunfig.toml should preload this file
// Otherwise you need to run: bun test --preload ./tests/_testnet_setup.ts
beforeEach(async () => {
  console.log("testnet setup");
  // make sure we teardown any zombies first
  await testnetDown();
  await testnetUp();
});

afterEach(async () => {
  await testnetDown().then(() => {
    console.log("testnet down");
  });
});
