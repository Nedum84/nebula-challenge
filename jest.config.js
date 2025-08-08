module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  testMatch: ["**/*.test.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/index.ts",
    "!src/aws/**",
    "!src/cli/**",
  ],
  coverageDirectory: "coverage",
  globalSetup: "<rootDir>/test/utils/setup.ts",
  globalTeardown: "<rootDir>/test/utils/teardown.ts",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testTimeout: 30000,
  clearMocks: true,
  restoreMocks: true,
};