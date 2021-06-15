module.exports = {
    collectCoverage: true,
    coverageReporters: ['lcov', 'text-summary'],
    preset: 'ts-jest',
    setupFilesAfterEnv: ['<rootDir>/src/setupEnzyme.ts'],
    testMatch: ['<rootDir>/src/**/__tests__/**/*-test.{ts,tsx}']
};
