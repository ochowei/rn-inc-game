module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@react-native|react-native|expo-.*|@expo/.*|@react-navigation/.*)/)",
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(mp3)$': '<rootDir>/__mocks__/fileMock.js',
  },
  collectCoverage: true,
  coverageReporters: ['json-summary', 'text', 'lcov'],
  setupFilesAfterEnv: ['./jest.setup.js'],
};