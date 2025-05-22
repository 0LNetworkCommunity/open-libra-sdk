// viewCodeGen.ts
//
// Usage:
//   bun ./scripts/viewCodeGen.ts MOVE_DIR
//
// - MOVE_DIR: Path to directory containing .move files. (Required)
//
// This script generates TypeScript view function definitions and sugar helpers in './src/views/'.
//
// Example:
//   bun ./scripts/viewCodeGen.ts ./my-move-modules
//   # Output: ./src/views/viewFunctionsSugar.ts

import path from "path";
import fs from "fs";
import { generateSugar } from "../src/codegen/parseViewFunctions";

// Get Move directory from command line argument (required)
if (!process.argv[2]) {
  console.error("Error: MOVE_DIR argument is required.\nUsage: bun ./scripts/viewCodeGen.ts MOVE_DIR");
  process.exit(1);
}
const MOVE_DIR = path.resolve(process.cwd(), process.argv[2]);
// Output directory for generated TS files
const OUT_DIR = path.join(__dirname, "../src/views");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Generate viewFunctionsSugar.ts only
const sugarFile = path.join(OUT_DIR, "viewFunctionsSugar.ts");
generateSugar(MOVE_DIR, sugarFile);
console.log(`Generated: ${sugarFile}`);
