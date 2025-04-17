# Testing Guide

This document provides instructions for running tests and understanding the testing coverage for the Reverse Define application.

## API Tests

The API tests verify the functionality of the backend endpoints. To run the API tests:

1. Start the development server:
```bash
npm run simple:dev
```

2. In a new terminal, run the API tests:
```bash
npm run test:api
```

The API tests cover the following endpoints:

- `/api/daily` - Tests retrieving the daily word
- `/api/hint/:gameId/:type` - Tests getting hints for a game
- `/api/guess` - Tests submitting a guess
- `/api/stats/daily` - Tests retrieving daily statistics
- `/api/leaderboard/streaks` - Tests retrieving the leaderboard

## Manual Testing Checklist

For a comprehensive testing checklist, see [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md).

## Test Output

The test script provides clear output for each endpoint test:

- ✅ Success indicators show when an endpoint responds correctly
- ❌ Error indicators show when an endpoint fails
- Detailed information about responses is logged for debugging

## Troubleshooting

If tests fail:

1. Ensure the development server is running
2. Check that the server is running on port 3001
3. Verify that the database is properly initialized
4. Check the server logs for any errors

## Adding New Tests

To add new tests:

1. Add new test cases to `src/tests/api-test.ts`
2. Define appropriate interfaces for new response types
3. Follow the existing pattern for error handling and logging
4. Update this documentation with new test coverage information 