import { test, expect } from "bun:test";
import path from "path";
import fs from "fs";
import os from "os";
import { generate } from "../../src/codegen/parseViewFunctions";

const FIXTURES_DIR = path.join(__dirname, "../fixtures");

test("generate() writes a valid TypeScript file that compiles", () => {
  // Create a temp directory
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "viewgen-test"));
  const outFile = path.join(tmpDir, "viewFunctionDefinitions.ts");

  // Calculate relative import path from generated file to src/types/clientPayloads
  const relImport = path
    .relative(tmpDir, path.join(__dirname, "../../src/types/clientPayloads"))
    .replace(/\\/g, "/");
  const importPath = relImport.startsWith(".") ? relImport : "./" + relImport;

  // Generate the file with the correct import path
  generate(FIXTURES_DIR, outFile, importPath);

  // Check file exists
  expect(fs.existsSync(outFile)).toBe(true);

  // Check that the generated file exports the expected constant names (camelCase, not PascalCase)
  const generated = fs.readFileSync(outFile, "utf8");
  expect(generated).toMatch(/export const getVotingDurationSecsView:/i);
  expect(generated).toMatch(/export const isResolvedView:/i);

  // Try to compile the generated file with tsc
  // Use the same tsconfig as the project, but only check the generated file
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
