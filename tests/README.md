# Un-Define API Tests

This directory contains manual and automated tests for the Un-Define API.

## Running the API Tests

To run the API tests, first ensure you have the required dependencies:

```bash
npm install -D node-fetch @types/node-fetch
```

Then run the test:

```bash
npx ts-node tests/api-test.ts
```

Note: These tests are excluded from the main server build to avoid dependency issues in production. 