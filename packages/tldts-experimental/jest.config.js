const baseConfig = require('../../jest.config.js');

module.exports = {
  ...baseConfig,
  collectCoverageFrom: ['./src/*', './index.ts'],
};
