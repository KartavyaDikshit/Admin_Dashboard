module.exports = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/ai/(.*)$': '<rootDir>/src/components/ai/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/lib/ai/(.*)$': '<rootDir>/src/lib/ai/$1',
    '^@/types/ai/(.*)$': '<rootDir>/src/types/ai/$1',
    '^@/prompts/(.*)$': '<rootDir>/src/prompts/$1',
  },
  testMatch: ['**/__tests__/api/**/*.test.ts'],
};
