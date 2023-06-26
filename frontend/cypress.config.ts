import { defineConfig } from 'cypress';

export default defineConfig({
  defaultCommandTimeout: 20000,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 1,
  },
});
