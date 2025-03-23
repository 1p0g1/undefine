/**
 * API Endpoint Test
 * 
 * Run with: node api-test.cjs
 * 
 * This script tests the API endpoints for the application,
 * ensuring they return the expected data.
 */

const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// API base URL
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

console.log('API Endpoint Test');
console.log('----------------');
console.log(`Base URL: ${API_BASE_URL}`);
console.log('');

// Run all tests
async function runAllTests() {
  try {
    await testWordEndpoint();
    await testHealthEndpoint();
    console.log('');
    console.log('✅ All API tests completed successfully!');
  } catch (error) {
    console.error('❌ API test failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Test the /api/word endpoint
async function testWordEndpoint() {
  console.log('Testing /api/word endpoint...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/word`);
    
    console.log(`✅ /api/word request succeeded with status ${response.status}`);
    
    // Validate the response structure
    const word = response.data;
    
    if (!word.word || !word.definition) {
      throw new Error('Response missing required fields: word and definition');
    }
    
    console.log('Word data:');
    console.log(`  Word: ${word.word}`);
    console.log(`  Definition: ${word.definition}`);
    console.log(`  Part of Speech: ${word.partOfSpeech || 'N/A'}`);
    console.log(`  Difficulty: ${word.difficulty || 'N/A'}`);
    console.log(`  Number of Letters: ${word.numLetters || word.word.length}`);
    
    return word;
  } catch (error) {
    console.error('❌ /api/word request failed:');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Data: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Test the /health or /api/health endpoint
async function testHealthEndpoint() {
  console.log('');
  console.log('Testing health endpoint...');
  
  // Try both /health and /api/health
  const endpoints = ['/health', '/api/health'];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      console.log(`✅ ${endpoint} request succeeded with status ${response.status}`);
      console.log(`  Response: ${JSON.stringify(response.data)}`);
      return;
    } catch (error) {
      console.log(`❌ ${endpoint} request failed - trying next endpoint`);
    }
  }
  
  console.error('❌ All health endpoints failed');
  throw new Error('Health check failed');
}

// Run the tests
runAllTests(); 