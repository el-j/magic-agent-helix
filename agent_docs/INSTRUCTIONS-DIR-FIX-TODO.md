# Fix: Instruction Output Directory Handling

## Rephrased Issue
- The CLI/VS Code extension currently attempts to create a per-project folder (named after the package) inside `.github/instruction` (singular). This fails when the directory does not exist and is misnamed.
- Expected behavior: Always create `.github/instructions` (plural) if missing, and generate instruction files directly inside that folder, without creating extra subfolders.

## Architecture Context
- Default output directory is defined in core: `packages/magic-helix-core/src/built-in-config.ts` → `.github/instructions`.
- CLI `run` command resolves the output directory and writes `<project>.<suffix>.md` files there. It should not create subdirectories per project.
- VS Code extension shells out to the CLI; directory creation logic lives in the CLI.

## Tasks & TODOs
1. Normalize Output Directory (Core)
   - Add normalization in `packages/magic-helix-core/src/config-merger.ts`:
     - Convert `.github/instruction` → `.github/instructions`.
     - Trim whitespace.
     - Optionally warn when normalization occurs.

2. Tests (Core)
   - Extend `packages/magic-helix-core/src/config-merger.test.ts` to assert normalization from singular to plural.

3. Build & Dry-Run Verification (CLI)
   - Build CLI and run a dry-run to confirm files would be generated into `.github/instructions` and no project subfolders are created.

4. Docs Note (Optional)
   - Brief note clarifying default output directory and normalization behavior.

## Acceptance Criteria
- Running `magic-helix run` generates files within `.github/instructions` without errors, even when user config mistakenly sets `.github/instruction`.
- Tests in core pass and cover the normalization case.
- No changes to file naming or template application behavior.
