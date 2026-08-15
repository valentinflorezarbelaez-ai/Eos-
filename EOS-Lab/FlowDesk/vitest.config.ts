import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    alias: {
      'node:sqlite': 'node:sqlite',
      'sqlite': 'node:sqlite'
    }
  },
});
