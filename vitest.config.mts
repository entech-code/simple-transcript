import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Export output contains local times; a fixed zone makes it the same on every machine.
    env: { TZ: 'UTC' },
  },
});
