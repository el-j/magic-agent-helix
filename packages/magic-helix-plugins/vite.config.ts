import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'nodejs/index': resolve(__dirname, 'src/nodejs/index.ts'),
        'go/index': resolve(__dirname, 'src/go/index.ts'),
        'python/index': resolve(__dirname, 'src/python/index.ts'),
        'rust/index': resolve(__dirname, 'src/rust/index.ts'),
        'java/index': resolve(__dirname, 'src/java/index.ts'),
        'ruby/index': resolve(__dirname, 'src/ruby/index.ts'),
        'php/index': resolve(__dirname, 'src/php/index.ts'),
        'csharp/index': resolve(__dirname, 'src/csharp/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['magic-helix-core', 'node:fs', 'node:path', 'glob'],
    },
  },
});
