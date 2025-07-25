const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      const tasks = require('./cypress/support/tasks');
      
      on('task', {
        cleanupTestData: tasks.cleanupTestData,
        seedTestData: tasks.seedTestData,
      });
    },
  },
});