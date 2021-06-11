module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    coverageReporters: ['lcov', 'text-summary'],
    preset: 'ts-jest',
    testPathIgnorePatterns: ['/node_modules/', '<rootDir>/dist/']
};
