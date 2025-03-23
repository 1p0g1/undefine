/**
 * Environment Setup Script
 * 
 * Run with: node set-env.cjs [mode]
 * 
 * This script updates the .env file to use either Snowflake or mock data.
 * 
 * Available modes:
 * - snowflake: Use Snowflake as the database provider
 * - mock: Use mock data as the database provider
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Parse command line arguments
const args = process.argv.slice(2);
const mode = args[0]?.toLowerCase() || 'snowflake';

if (mode !== 'snowflake' && mode !== 'mock') {
  console.error('Invalid mode specified. Use either "snowflake" or "mock".');
  process.exit(1);
}

// Path to the .env file in the project root
const envFilePath = path.resolve(__dirname, '../.env');

// Read the current .env file
try {
  const envConfig = dotenv.parse(fs.readFileSync(envFilePath));
  
  // Update the DB_PROVIDER value
  envConfig.DB_PROVIDER = mode;
  
  // Convert the updated config back to a string
  const updatedEnv = Object.entries(envConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  // Write the updated config back to the .env file
  fs.writeFileSync(envFilePath, updatedEnv);
  
  console.log(`✅ Successfully updated .env file to use ${mode.toUpperCase()} as the database provider.`);
  
  // Display current settings
  console.log('\nCurrent Environment Settings:');
  console.log('--------------------------');
  console.log(`DB_PROVIDER: ${envConfig.DB_PROVIDER}`);
  
  if (mode === 'snowflake') {
    console.log(`SNOWFLAKE_ACCOUNT: ${envConfig.SNOWFLAKE_ACCOUNT || 'Not set'}`);
    console.log(`SNOWFLAKE_USERNAME: ${envConfig.SNOWFLAKE_USERNAME || 'Not set'}`);
    console.log(`SNOWFLAKE_DATABASE: ${envConfig.SNOWFLAKE_DATABASE || 'Not set'}`);
    console.log(`SNOWFLAKE_WAREHOUSE: ${envConfig.SNOWFLAKE_WAREHOUSE || 'Not set'}`);
  }
  
  console.log('\nTo switch back, run:');
  console.log(`node set-env.cjs ${mode === 'snowflake' ? 'mock' : 'snowflake'}`);
  
} catch (error) {
  console.error('Error updating .env file:');
  console.error(error.message);
  process.exit(1);
} 