// Test script for the /api/word endpoint connected to Snowflake
const snowflake = require('snowflake-sdk');
const dotenv = require('dotenv');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

// Create a test JWT token for authentication
const createTestToken = () => {
  const payload = {
    id: '1',
    email: 'test@example.com',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET || 'development_secret_key');
};

// Configure Snowflake connection
const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USERNAME,
  password: process.env.SNOWFLAKE_PASSWORD,
  database: process.env.SNOWFLAKE_DATABASE,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  schema: process.env.SNOWFLAKE_SCHEMA || 'PUBLIC',
});

// Set up API client
const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Authorization': `Bearer ${createTestToken()}`
  }
});

// Compare database directly and API response
async function compareDirectAndApiResults() {
  console.log('=== Testing Word API vs Direct Database Access ===\n');
  
  // Connect to Snowflake
  console.log('1. Connecting to Snowflake directly...');
  await new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        console.error('Direct connection error:', err);
        reject(err);
        return;
      }
      console.log('✓ Connected successfully to Snowflake directly');
      resolve();
    });
  });
  
  try {
    // Get a random word directly from database
    console.log('\n2. Fetching random word directly from Snowflake...');
    const directWord = await new Promise((resolve, reject) => {
      connection.execute({
        sqlText: 'SELECT * FROM WORDS ORDER BY RANDOM() LIMIT 1',
        complete: (err, stmt, rows) => {
          if (err) {
            console.error('Error fetching random word directly:', err);
            reject(err);
            return;
          }
          
          if (rows.length === 0) {
            console.log('No words found in database');
            resolve(null);
            return;
          }
          
          console.log('✓ Direct database query successful');
          resolve(rows[0]);
        }
      });
    });
    
    if (!directWord) {
      console.error('No words available in the database');
      return;
    }
    
    console.log('Direct database word:', {
      word: directWord.WORD,
      definition: directWord.DEFINITION?.substring(0, 50) + (directWord.DEFINITION?.length > 50 ? '...' : ''),
      partOfSpeech: directWord.PART_OF_SPEECH
    });
    
    // Get a word from the API
    console.log('\n3. Fetching word from API endpoint...');
    try {
      const apiResponse = await api.get('/api/word');
      console.log('✓ API request successful');
      console.log('API response word:', {
        word: apiResponse.data.word,
        definition: apiResponse.data.definition?.substring(0, 50) + (apiResponse.data.definition?.length > 50 ? '...' : ''),
        partOfSpeech: apiResponse.data.partOfSpeech
      });
      
      // Compare results
      console.log('\n4. Comparing results:');
      if (apiResponse.data) {
        console.log('API successfully returned a word ✓');
        
        // Check if API includes necessary fields
        const requiredFields = ['word', 'definition', 'partOfSpeech'];
        const missingFields = requiredFields.filter(field => !apiResponse.data[field]);
        
        if (missingFields.length === 0) {
          console.log('API response contains all required fields ✓');
        } else {
          console.error(`API response is missing fields: ${missingFields.join(', ')} ✘`);
        }
      } else {
        console.error('API did not return a valid word object ✘');
      }
    } catch (error) {
      console.error('API request failed:', error.message);
      if (error.response) {
        console.error('API error details:', {
          status: error.response.status,
          data: error.response.data
        });
      }
    }
  } finally {
    // Clean up database connection
    console.log('\nClosing direct database connection...');
    await new Promise(resolve => {
      connection.destroy(err => {
        if (err) {
          console.error('Error closing connection:', err);
        } else {
          console.log('Database connection closed successfully');
        }
        resolve();
      });
    });
  }
}

// Install axios if not already installed
try {
  require.resolve('axios');
  require.resolve('jsonwebtoken');
  // If we get here, the modules are installed
  compareDirectAndApiResults().catch(console.error);
} catch (e) {
  console.log('Installing required dependencies...');
  const { execSync } = require('child_process');
  execSync('npm install axios jsonwebtoken', { stdio: 'inherit' });
  console.log('Dependencies installed, running test...');
  compareDirectAndApiResults().catch(console.error);
} 