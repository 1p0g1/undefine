# Snowflake Testing Scripts

This folder contains scripts for testing and verifying the Snowflake connection for the Reversedefine application.

## Prerequisites

Before running these scripts, make sure you have:

1. Node.js installed
2. Configured your `.env` file in the project root with the correct Snowflake credentials
3. Installed the required dependencies: `npm install`

## Quick Start

Run a full application test:

```bash
npm test
```

Switch between Snowflake and mock data:

```bash
# Use Snowflake as the database provider
npm run use:snowflake

# Use mock data as the database provider
npm run use:mock
```

Check for TypeScript issues:

```bash
npm run fix-ts
```

## Available npm Scripts

For convenience, you can use the following npm scripts:

```bash
# Run full application test
npm test

# Test just the database connection
npm run test:db

# Test just the API endpoints
npm run test:api

# Run the Snowflake admin tool with default 'info' command
npm run admin

# Switch to using Snowflake as the database provider
npm run use:snowflake

# Switch to using mock data as the database provider
npm run use:mock

# List all tables in the database
npm run tables

# Count rows in the WORDS table
npm run count

# Get sample rows from the WORDS table
npm run sample

# Describe the structure of the WORDS table
npm run describe

# Find and fix TypeScript issues
npm run fix-ts
```

## Available Scripts

### Snowflake Connection Test

Test basic connectivity to Snowflake and run simple queries:

```bash
node snowflake-connection-test.cjs
```

This script verifies that your Snowflake credentials are correct and that you can connect to and query the database.

### API Test

Test the API endpoints to ensure they're working correctly:

```bash
node api-test.cjs
```

This script tests the `/api/word` endpoint and health endpoints to verify that the server is responding correctly.

### Full Application Test

Test the entire application flow from database to API:

```bash
node full-app-test.cjs
```

This comprehensive test verifies that:
1. The database connection works
2. The API endpoints work
3. The integration between the database and API is working correctly

### Snowflake Admin Tool

Perform various administrative tasks on your Snowflake database:

```bash
node snowflake-admin.cjs [command] [table] [limit]
```

Available commands:
- `info`: Display information about the database
- `tables`: List all tables in the database
- `count [table]`: Count rows in the specified table (default: WORDS)
- `sample [table] [limit]`: Show sample rows from the table (default: WORDS, limit: 5)
- `describe [table]`: Show structure of the specified table

Examples:
```bash
# Show database info
node snowflake-admin.cjs info

# List all tables
node snowflake-admin.cjs tables

# Count rows in WORDS table
node snowflake-admin.cjs count WORDS

# Get 10 sample rows from LEADERBOARD table
node snowflake-admin.cjs sample LEADERBOARD 10

# Describe the USER_STATS table structure
node snowflake-admin.cjs describe USER_STATS
```

### Environment Setup

Switch between using Snowflake or mock data:

```bash
node set-env.cjs [mode]
```

Where `mode` is either `snowflake` or `mock`.

### TypeScript Issue Fixer

Identify and suggest fixes for TypeScript issues in the main project:

```bash
node fix-ts-issues.cjs
```

This script will:
1. Check for common issues in key files
2. Run the TypeScript compiler to identify type errors
3. Suggest solutions for common problems
4. Provide an example type definition file for Snowflake

## Troubleshooting

If you encounter issues with these scripts:

1. **Connection Errors**: Verify your Snowflake credentials in the `.env` file.
2. **API Errors**: Make sure your server is running (`npm run dev` in the project root).
3. **Module Errors**: Try reinstalling dependencies with `npm install`.

For detailed error information, check the error output from the scripts.

## Environment Configuration

The scripts look for the following environment variables:

```
SNOWFLAKE_ACCOUNT=your-account-id
SNOWFLAKE_USERNAME=your-username
SNOWFLAKE_PASSWORD=your-password
SNOWFLAKE_DATABASE=your-database
SNOWFLAKE_WAREHOUSE=your-warehouse
SNOWFLAKE_SCHEMA=PUBLIC  # Default
DB_PROVIDER=snowflake    # or 'mock'
API_URL=http://localhost:3001  # Default
```

Make sure these are correctly set in your `.env` file at the project root. 