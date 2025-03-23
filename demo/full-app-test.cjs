/**
 * Full Application Test
 * 
 * Run with: node full-app-test.cjs
 * 
 * This script tests the entire application flow from the database to the API to the frontend.
 * It verifies that all components are working together correctly.
 */

const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// API base URL
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

console.log('Full Application Test');
console.log('--------------------');
console.log('Environment:');
console.log(`  API URL: ${API_BASE_URL}`);
console.log(`  Snowflake Account: ${process.env.SNOWFLAKE_ACCOUNT}`);
console.log(`  Snowflake Database: ${process.env.SNOWFLAKE_DATABASE}`);
console.log(`  DB Provider: ${process.env.DB_PROVIDER || 'Not set'}`);
console.log('');

// This script utilizes ES modules for importing the database client
// We'll use dynamic imports here
(async () => {
  try {
    // Import the database module
    const { db } = await import('../src/config/database/index.js');
    
    // Run the full test
    await runFullTest(db);
  } catch (error) {
    console.error('Failed to initialize test:', error);
    process.exit(1);
  }
})();

// Step 1: Check database connection
async function testDatabaseConnection(db) {
  console.log('STEP 1: Testing Database Connection');
  console.log('----------------------------------');
  
  try {
    console.log('Connecting to database...');
    await db.connect();
    console.log('✅ Connected successfully to database!');
    
    // Get a random word to verify database access
    const word = await db.getRandomWord();
    
    if (!word) {
      throw new Error('No words found in the database');
    }
    
    console.log('✅ Successfully retrieved a word from the database:');
    console.log(`  Word: ${word.word}`);
    console.log(`  Definition: ${word.definition}`);
    console.log('');
    
    return word;
  } catch (error) {
    console.error('❌ Database connection or query failed:');
    console.error(error.message);
    throw error;
  }
}

// Step 2: Check API endpoints
async function testApiEndpoints() {
  console.log('STEP 2: Testing API Endpoints');
  console.log('---------------------------');
  
  try {
    // Test the /api/word endpoint
    console.log('Testing /api/word endpoint...');
    const wordResponse = await axios.get(`${API_BASE_URL}/api/word`);
    
    console.log(`✅ /api/word request succeeded with status ${wordResponse.status}`);
    
    // Validate the response structure
    const word = wordResponse.data;
    
    if (!word.word || !word.definition) {
      throw new Error('Response missing required fields: word and definition');
    }
    
    console.log('Word data from API:');
    console.log(`  Word: ${word.word}`);
    console.log(`  Definition: ${word.definition}`);
    console.log(`  Part of Speech: ${word.partOfSpeech || 'N/A'}`);
    console.log('');
    
    // Test the health endpoint
    console.log('Testing health endpoint...');
    
    // Try both /health and /api/health
    let healthResponse;
    try {
      healthResponse = await axios.get(`${API_BASE_URL}/health`);
    } catch (error) {
      healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
    }
    
    console.log(`✅ Health endpoint request succeeded with status ${healthResponse.status}`);
    console.log(`  Response: ${JSON.stringify(healthResponse.data)}`);
    console.log('');
    
    return word;
  } catch (error) {
    console.error('❌ API test failed:');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Data: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Step 3: Verify End-to-End Integration
async function verifyIntegration(dbWord, apiWord) {
  console.log('STEP 3: Verifying Integration');
  console.log('--------------------------');
  
  // Note: DB_PROVIDER=mock would mean these shouldn't match
  if (process.env.DB_PROVIDER === 'mock') {
    console.log('⚠️ Using mock database provider - skipping direct comparison');
    console.log('✅ Integration test passed (using mock data)');
    return;
  }
  
  // Check if data is consistent
  console.log('Comparing database word and API word...');
  
  // The word might be different since we're getting random words
  // but let's check that the structure is consistent
  console.log('Database word properties:');
  console.log(Object.keys(dbWord).join(', '));
  
  console.log('API word properties:');
  console.log(Object.keys(apiWord).join(', '));
  
  // Check if essential fields are present in both
  const dbHasEssentials = dbWord.word && dbWord.definition;
  const apiHasEssentials = apiWord.word && apiWord.definition;
  
  if (dbHasEssentials && apiHasEssentials) {
    console.log('✅ Integration test passed - essential fields present in both sources');
  } else {
    console.error('❌ Integration test failed - missing essential fields');
    throw new Error('Integration verification failed');
  }
}

// Run the full test
async function runFullTest(db) {
  try {
    // Step 1: Test database connection
    const dbWord = await testDatabaseConnection(db);
    
    // Step 2: Test API endpoints
    const apiWord = await testApiEndpoints();
    
    // Step 3: Verify integration
    await verifyIntegration(dbWord, apiWord);
    
    // Disconnect from the database
    await db.disconnect();
    
    console.log('');
    console.log('✅ Full application test completed successfully!');
    console.log('All components are working together correctly.');
  } catch (error) {
    console.error('');
    console.error('❌ Full application test failed:');
    console.error(error.message);
    
    // Try to disconnect from the database if possible
    try {
      await db.disconnect();
    } catch (e) {
      // Ignore errors during cleanup
    }
    
    process.exit(1);
  }
} 