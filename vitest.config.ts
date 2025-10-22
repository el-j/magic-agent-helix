import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Look for tests in *all* packages
    include: ['packages/**/*.test.ts', 'packages/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      // Target only the CLI for coverage, not the VSCode plugin wrapper
      include: ['packages/magic-agent-helix/src/**/*.ts'],
      exclude: ['packages/vscode-magic-helix/**'],
    },
    globals: true,
  },
});
