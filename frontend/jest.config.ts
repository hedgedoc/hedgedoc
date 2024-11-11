/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import nextJest from 'next/jest'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './'
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['@testing-library/jest-dom/jest-globals'],
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    // fix ESM loading of orama breaking jest
    '^@orama/orama$': require.resolve('@orama/orama')
  },
  roots: ['<rootDir>/src'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/cypress/']
}
// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = async () => {
  const nextJestConfig = await createJestConfig(customJestConfig)()
  return {
    ...nextJestConfig,
    moduleNameMapper: {
      ...nextJestConfig.moduleNameMapper,
      '^.+\\.(svg)$': '<rootDir>/src/test-utils/svg-mock.tsx',
      '^react-bootstrap-icons$': '<rootDir>/src/test-utils/bootstrap-icon-mocks.tsx',
      '^react-bootstrap-icons/dist/icons/.*$': '<rootDir>/src/test-utils/svg-mock.tsx'
    }
  }
}
