export default {
  testEnvironment: "node",
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/backend/seed.js",
    "!src/backend/config/env.js",
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  transform: {},
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testTimeout: 15000,
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.js"],
};
