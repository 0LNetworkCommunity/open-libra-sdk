import { expect, test } from "bun:test";
import path from "path";
import {
  extractViewFunctions,
  generateViewTypes,
  viewFunctionToViewArgs,
  generateSugar,
} from "../../src/codegen/parseViewFunctions";
import fs from "fs";
import os from "os";

const FIXTURES_DIR = path.join(__dirname, "../fixtures");

// Test extracting view functions from example.move

test("extracts view functions from example.move", () => {
  const views = extractViewFunctions(FIXTURES_DIR);
  // Should find two view functions
  const names = views.map((v) => v.name);
  expect(names).toContain("get_voting_duration_secs");
  expect(names).toContain("is_resolved");

  // Check get_voting_duration_secs has no args
  const getVoting = views.find((v) => v.name === "get_voting_duration_secs");
  expect(getVoting?.args.length).toBe(0);

  // Check is_resolved has one arg: proposal_id: u64
  const isResolved = views.find((v) => v.name === "is_resolved");
  expect(isResolved?.args.length).toBe(1);
  expect(isResolved?.args[0].name).toBe("proposal_id");
  expect(isResolved?.args[0].type).toBe("u64");

  // Check file path includes example.move
  expect(getVoting?.file.endsWith("example.move")).toBe(true);
});

test("generates correct TypeScript types for view functions", () => {
  const views = extractViewFunctions(FIXTURES_DIR);
  const types = generateViewTypes(views);
  expect(types).toContain("export type Get_voting_duration_secsView");
  expect(types).toContain("export type Is_resolvedView");
});

test("viewFunctionToViewArgs generates correct ViewArgs payloads", () => {
  const views = extractViewFunctions(FIXTURES_DIR);
  const isResolved = views.find((v) => v.name === "is_resolved");
  expect(isResolved).toBeTruthy();

  // Should require one argument: proposal_id
  const payload = viewFunctionToViewArgs(isResolved!, [42]);
  expect(payload.payload.function).toBe("0x1::example::is_resolved");
  expect(payload.payload.functionArguments).toEqual([42]);

  // get_voting_duration_secs takes no arguments
  const getVoting = views.find((v) => v.name === "get_voting_duration_secs");
  const payload2 = viewFunctionToViewArgs(getVoting!);
  expect(payload2.payload.function).toBe(
    "0x1::example::get_voting_duration_secs",
  );
  expect(payload2.payload.functionArguments).toEqual([]);
});

// Add test for sugar function naming convention
test("generateSugar() writes TS functions with correct camelCase module_function names", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "viewgen-sugar-test"));
  const outFile = path.join(tmpDir, "viewFunctionsSugar.ts");
  const relImport = path
    .relative(tmpDir, path.join(__dirname, "../../src/types/clientPayloads"))
    .replace(/\\/g, "/");
  const importPath = relImport.startsWith(".") ? relImport : "./" + relImport;
  generateSugar(FIXTURES_DIR, outFile, importPath);
  const generated = fs.readFileSync(outFile, "utf8");
  // Should export functions like example_isResolved and example_getVotingDurationSecs
  expect(generated).toMatch(/export function example_isResolved\(/);
  expect(generated).toMatch(/export function example_getVotingDurationSecs\(/);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});
