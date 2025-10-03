/**
 * Jest setup file for system fields tests
 */

// Global test setup
beforeAll(() => {
  console.log('Setting up tests for Kylas system fields...');
});

afterAll(() => {
  console.log('Cleaning up after tests...');
});

// Mock console.error to avoid noise in test output unless we're specifically testing error cases
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

// Global test utilities
global.expectArrayOfObjects = (array, expectedProperties) => {
  expect(Array.isArray(array)).toBe(true);
  array.forEach(item => {
    expectedProperties.forEach(prop => {
      expect(item).toHaveProperty(prop);
    });
  });
};

global.expectValidFieldMetadata = (metadata) => {
  expect(metadata).toHaveProperty('name');
  expect(metadata).toHaveProperty('type');
  expect(metadata).toHaveProperty('required');
  expect(typeof metadata.name).toBe('string');
  expect(typeof metadata.type).toBe('string');
  expect(typeof metadata.required).toBe('boolean');
};
