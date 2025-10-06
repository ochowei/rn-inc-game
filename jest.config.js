module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(mp3)$': '<rootDir>/__mocks__/fileMock.js',
  },
  collectCoverage: true,
  coverageReporters: ['json-summary', 'text', 'lcov'],
  setupFilesAfterEnv: ['./jest.setup.js'],
};