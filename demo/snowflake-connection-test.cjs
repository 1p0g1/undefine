/**
 * Snowflake Connection Test
 * 
 * Run with: node snowflake-connection-test.cjs
 * 
 * This script tests the connection to Snowflake and performs basic operations
 * to verify that the database is accessible and functioning correctly.
 */

const snowflake = require('snowflake-sdk');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('Snowflake Connection Test');
console.log('------------------------');
console.log('Environment:');
console.log(`  Account: ${process.env.SNOWFLAKE_ACCOUNT}`);
console.log(`  Username: ${process.env.SNOWFLAKE_USERNAME}`);
console.log(`  Database: ${process.env.SNOWFLAKE_DATABASE}`);
console.log(`  Warehouse: ${process.env.SNOWFLAKE_WAREHOUSE}`);
console.log(`  Schema: ${process.env.SNOWFLAKE_SCHEMA || 'PUBLIC'}`);
console.log('');

// Create a connection to Snowflake
const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USERNAME,
  password: process.env.SNOWFLAKE_PASSWORD,
  database: process.env.SNOWFLAKE_DATABASE,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  schema: process.env.SNOWFLAKE_SCHEMA || 'PUBLIC',
});

// Connect to Snowflake
console.log('Connecting to Snowflake...');
connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:');
    console.error(err);
    return;
  }
  
  console.log('✅ Connected successfully to Snowflake!');
  console.log('');
  
  // Run a series of tests
  runTests(connection);
});

function runTests(connection) {
  const tests = [
    { name: 'Test Connection', query: 'SELECT current_version()' },
    { name: 'Test Words Table', query: 'SELECT COUNT(*) AS COUNT FROM WORDS' },
    { name: 'Fetch Random Word', query: 'SELECT * FROM WORDS ORDER BY RANDOM() LIMIT 1' },
    { name: 'Check Tables', query: 'SHOW TABLES' },
  ];

  let testIndex = 0;
  
  function runNextTest() {
    if (testIndex >= tests.length) {
      console.log('');
      console.log('✅ All tests completed successfully!');
      connection.destroy();
      return;
    }
    
    const test = tests[testIndex++];
    console.log(`Running test: ${test.name}`);
    
    connection.execute({
      sqlText: test.query,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error(`❌ Test "${test.name}" failed:`);
          console.error(err);
          connection.destroy();
          return;
        }
        
        console.log(`✅ Test "${test.name}" passed!`);
        console.log(`   Results: ${JSON.stringify(rows[0], null, 2).substring(0, 100)}${JSON.stringify(rows[0], null, 2).length > 100 ? '...' : ''}`);
        console.log('');
        
        runNextTest();
      }
    });
  }
  
  runNextTest();
} 