# Snowflake Connection Guide

This guide summarizes the troubleshooting steps and lessons learned while reconnecting to Snowflake.

## Connection Configuration

The Snowflake connection requires these critical parameters:

```
SNOWFLAKE_ACCOUNT=CYNYRDY-LVB29364
SNOWFLAKE_USERNAME=PADDYDEMO
SNOWFLAKE_PASSWORD=TestingCursor123
SNOWFLAKE_DATABASE=undefine
SNOWFLAKE_WAREHOUSE=undefine_wh
SNOWFLAKE_SCHEMA=PUBLIC
```

## Database Structure

The Snowflake database contains these tables:
- WORDS
- LEADERBOARD
- LEADERBOARD_ARCHIVE
- USER_STATS

### WORDS Table Structure
```
WORD (VARCHAR)
DEFINITION (VARCHAR)
NUM_LETTERS (NUMBER)
ALT_DEFINITION (VARCHAR)
PART_OF_SPEECH (VARCHAR)
DIFFICULTY (VARCHAR)
SYNONYM (VARCHAR)
LIVE_DATE (DATE)
```

## Connection Testing

Three test scripts were created to validate the Snowflake connection:

1. `connect-snowflake.cjs` - Tests basic connectivity to Snowflake
2. `test-words-table.cjs` - Tests the structure and content of the WORDS table
3. `test-api-word.cjs` - Tests the API endpoint that fetches words from Snowflake

## Troubleshooting Issues

When encountering TypeScript errors related to the Snowflake SDK:

1. The main issues stem from `executeQuery` being a private method in the ConnectionManager class
2. ESM/CommonJS compatibility issues with the Snowflake SDK
3. Mismatches between the database schema and the application's expectations

## Direct Connection Example

```javascript
const snowflake = require('snowflake-sdk');
const dotenv = require('dotenv');

dotenv.config();

const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USERNAME,
  password: process.env.SNOWFLAKE_PASSWORD,
  database: process.env.SNOWFLAKE_DATABASE,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  schema: process.env.SNOWFLAKE_SCHEMA || 'PUBLIC',
});

connection.connect((err) => {
  if (err) {
    console.error('Connection error:', err);
    return;
  }
  
  console.log('Connected successfully to Snowflake!');
  
  // Execute a query
  connection.execute({
    sqlText: 'SELECT * FROM WORDS ORDER BY RANDOM() LIMIT 1',
    complete: (err, stmt, rows) => {
      if (err) {
        console.error('Query error:', err);
        return;
      }
      
      console.log('Result:', rows[0]);
      
      // Close connection
      connection.destroy();
    }
  });
});
```

## API Integration

The application integrates with Snowflake through:

1. The `SnowflakeClient` class in `src/config/database/SnowflakeClient.ts`
2. The connection manager in `src/config/snowflake.ts`
3. Environment configuration in `.env`

To switch between mock data and Snowflake, set the `DB_PROVIDER` environment variable to either `mock` or `snowflake`.

## Next Steps

1. Consider updating the TypeScript interfaces to ensure they match the actual database schema
2. Fix the TypeScript errors in the codebase related to the private `executeQuery` method
3. Add more comprehensive error logging to debug future connection issues
4. Set up a simpler fallback mechanism when Snowflake isn't available 