module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: {},
  moduleNameMapper: {
    uuid: require.resolve("uuid"),
  },
  modulePathIgnorePatterns: ["<rootDir>/examples/"],
  transformIgnorePatterns: [],
};
