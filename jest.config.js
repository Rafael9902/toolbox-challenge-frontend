/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/test/**/*.test.{js,jsx}'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  moduleNameMapper: {
    // Webpack loads CSS; Jest does not need its contents.
    '\\.css$': '<rootDir>/test/styleMock.js'
  },
  clearMocks: true
}
