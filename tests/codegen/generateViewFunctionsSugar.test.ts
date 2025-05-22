import { test, expect } from "bun:test";
import path from "path";
import fs from "fs";
import os from "os";
import { generateSugar } from "../../src/codegen/parseViewFunctions";

const FIXTURES_DIR = path.join(__dirname, "../fixtures");

test("generateSugar() writes a valid TypeScript file with sugar functions that compiles", () => {
  // Create a temp directory
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "viewgen-sugar-test"));
  const outFile = path.join(tmpDir, "viewFunctionsSugar.ts");

  // Calculate relative import path from generated file to src/types/clientPayloads
  const relImport = path
    .relative(tmpDir, path.join(__dirname, "../../src/types/clientPayloads"))
    .replace(/\\/g, "/");
  const importPath = relImport.startsWith(".") ? relImport : "./" + relImport;

  // Generate the file with the correct import path
  // generateSugar expects only 2 arguments: moveDir, outFile
  // so pass only those for the test
  generateSugar(FIXTURES_DIR, outFile, importPath);

  // Check file exists
  expect(fs.existsSync(outFile)).toBe(true);

  // Try to compile the generated file with tsc
  const tscPath = path.join(
    __dirname,
    "..",
    "..",
    "node_modules",
    ".bin",
    "tsc",
  );
  // Fallback to global tsc if not found
  const tscCmd = fs.existsSync(tscPath) ? tscPath : "tsc";
  const result = Bun.spawnSync([
    tscCmd,
    "--strict",
    "--noEmit",
    outFile,
    "--skipLibCheck",
  ]);
  if (result.exitCode !== 0) {
    console.error("TSC STDERR:\n", result.stderr.toString());
    console.error("TSC STDOUT:\n", result.stdout.toString());
  }
  expect(result.exitCode).toBe(0);

  // Clean up temp dir
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test("generateSugar() writes a valid TypeScript file that compiles", () => {
  // Create a temp directory
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "viewgen-sugar-test"));
  const outFile = path.join(tmpDir, "viewFunctionsSugar.ts");
  const relImport = path
    .relative(tmpDir, path.join(__dirname, "../../src/types/clientPayloads"))
    .replace(/\\/g, "/");
  const importPath = relImport.startsWith(".") ? relImport : "./" + relImport;
  // Generate the file
  generateSugar(FIXTURES_DIR, outFile, importPath);
  // Check file exists
  expect(fs.existsSync(outFile)).toBe(true);
  // Check that the generated file exports the expected function names
  const generated = fs.readFileSync(outFile, "utf8");
  expect(generated).toMatch(/export function example_isResolved\(/);
  expect(generated).toMatch(/export function example_getVotingDurationSecs\(/);
  // Try to compile the generated file with tsc
  const tscPath = path.join(
    __dirname,
    "..",
    "..",
    "node_modules",
    ".bin",
    "tsc",
  );
  const tscCmd = fs.existsSync(tscPath) ? tscPath : "tsc";
  const result = Bun.spawnSync([
    tscCmd,
    "--strict",
    "--noEmit",
    outFile,
    "--skipLibCheck",
  ]);
  if (result.exitCode !== 0) {
    console.error("TSC STDERR:\n", result.stderr.toString());
    console.error("TSC STDOUT:\n", result.stdout.toString());
  }
  expect(result.exitCode).toBe(0);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});
