import { pathsToModuleNameMapper, JestConfigWithTsJest } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";

const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest",
  moduleDirectories: ["node_modules", "<rootDir>"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),

  testEnvironment: "node",
  testMatch: ["**/**/*.spec.ts"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  detectOpenHandles: true,
  noStackTrace: true,
  testTimeout: 10000,
  openHandlesTimeout: 10000,

  // global setup
  // globalSetup: "<rootDir>/src/__tests__/setup.ts",
  // globalTeardown: "<rootDir>/src/__tests__/teardown.ts",
};

export default jestConfig;
