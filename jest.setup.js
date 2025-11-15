// jest.setup.js
import '@testing-library/jest-dom'

// Mock fetch globally
global.fetch = jest.fn();

// Clear all mocks after each test
beforeEach(() => {
  global.fetch.mockClear();
  global.fetch
    .mockResolvedValueOnce({ // First call for categories
      ok: true,
      json: () => Promise.resolve({ categories: [{ id: 'cat1', title: 'Category 1' }] }),
    })
    .mockResolvedValueOnce({ // Second call for reports
      ok: true,
      json: () => Promise.resolve({ report: { id: 'new-report-id' } }),
    });
});