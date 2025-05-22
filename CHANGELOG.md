# Changelog

## 1.1.3 - 2025-05-22

### Added
- **TypeScript Codegen for Move #[view] Functions:**
  - Added a robust code generation tool that parses Move source files for `#[view]` functions and generates TypeScript sugar functions for each view.
  - Sugar functions are named in the format `moduleName_functionName` (camelCase for both), e.g. `olAccount_balance(address: string)`.
  - All generated sugar functions are exported from `src/views/viewFunctionsSugar.ts`.
  - Added a `LibraViews` namespace/object export, so users can import and use view helpers as:
    ```typescript
    import { LibraViews } from "open-libra-sdk";
    LibraViews.olAccount_balance("0x...");
    ```
  - Codegen supports deduplication, correct Move-to-TypeScript type mapping, and flexible import paths for dev/prod.

- **Testing:**
  - Comprehensive tests for extraction, type mapping, sugar function output, and TypeScript compilation of generated files.
  - E2E test for querying validators using the new sugar functions.

- **Documentation:**
  - Updated README with codegen and release instructions for maintainers.
  - Added usage examples for the new `LibraViews` API.

### Changed
- **Project Structure:**
  - Moved all generated view helpers to `src/views/viewFunctionsSugar.ts`.
  - Updated CLI and test scripts to use the new codegen and import paths.

### Deprecated
- **Deprecation of `payloads`:**
  - The old `payloads` constants (e.g., `currentValidatorsPayload`) are now deprecated.
  - **Use the new `LibraViews` sugar functions instead:**
    ```typescript
    // Deprecated:
    import { currentValidatorsPayload } from "open-libra-sdk/payloads";
    // New:
    import { LibraViews } from "open-libra-sdk";
    LibraViews.validatorUniverse_getEligibleValidators();
    ```
  - The `payloads` module will be removed in a future release.
