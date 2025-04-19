#!/usr/bin/env node
/**
 * Render Environment Variable Sync Tool
 * 
 * This script helps sync environment variables to Render.com via their API.
 * It can be used manually or as part of a CI/CD pipeline.
 * 
 * Usage:
 *   node sync-render-env.js --service-id=<id> --api-key=<key> [--env-file=.env.production]
 * 
 * Required environment variables:
 *   - RENDER_API_KEY: Your Render API key (or pass via --api-key)
 *   - RENDER_SERVICE_ID: Your Render service ID (or pass via --service-id)
 * 
 * Optional flags:
 *   --env-file: Path to environment file (default: .env.production)
 *   --dry-run: Don't actually update Render, just show what would change
 *   --help: Show this help message
 * 
 * Note: This requires the 'dotenv' and 'node-fetch' packages.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if required packages are installed
try {
  require.resolve('dotenv');
  require.resolve('node-fetch');
} catch (e) {
  console.error('Required packages not found. Installing dotenv and node-fetch...');
  execSync('npm install dotenv node-fetch', { stdio: 'inherit' });
}

const dotenv = require('dotenv');
const fetch = require('node-fetch');

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  if (arg === '--help' || arg === '-h') {
    acc.help = true;
    return acc;
  }
  
  if (arg === '--dry-run') {
    acc.dryRun = true;
    return acc;
  }
  
  const match = arg.match(/^--([^=]+)=(.+)$/);
  if (match) {
    acc[match[1]] = match[2];
  }
  
  return acc;
}, {});

// Show help if requested
if (args.help) {
  console.log(`
Render Environment Variable Sync Tool

This script helps sync environment variables to Render.com via their API.
It can be used manually or as part of a CI/CD pipeline.

Usage:
  node sync-render-env.js --service-id=<id> --api-key=<key> [--env-file=.env.production]

Required environment variables:
  - RENDER_API_KEY: Your Render API key (or pass via --api-key)
  - RENDER_SERVICE_ID: Your Render service ID (or pass via --service-id)

Optional flags:
  --env-file: Path to environment file (default: .env.production)
  --dry-run: Don't actually update Render, just show what would change
  --help: Show this help message
  `);
  process.exit(0);
}

// Get configuration from arguments or environment variables
const apiKey = args['api-key'] || process.env.RENDER_API_KEY;
const serviceId = args['service-id'] || process.env.RENDER_SERVICE_ID;
const envFile = args['env-file'] || '.env.production';
const dryRun = args.dryRun || false;

// Validate required inputs
if (!apiKey) {
  console.error('Error: Render API key is required. Set RENDER_API_KEY env var or pass --api-key');
  process.exit(1);
}

if (!serviceId) {
  console.error('Error: Render service ID is required. Set RENDER_SERVICE_ID env var or pass --service-id');
  process.exit(1);
}

// Load environment variables from file
const envPath = path.resolve(process.cwd(), envFile);
if (!fs.existsSync(envPath)) {
  console.error(`Error: Environment file not found: ${envPath}`);
  process.exit(1);
}

console.log(`Loading environment variables from ${envPath}...`);
const envVars = dotenv.parse(fs.readFileSync(envPath));

// Filter out commented lines and empty variables
const filteredEnvVars = Object.entries(envVars)
  .filter(([key, value]) => {
    return key && !key.startsWith('#') && value !== undefined && value !== '';
  })
  .reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

console.log(`Found ${Object.keys(filteredEnvVars).length} environment variables to sync`);

// Format for Render API
const envVarsList = Object.entries(filteredEnvVars).map(([key, value]) => ({
  key,
  value
}));

// Prepare Render API request
async function syncToRender() {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Syncing environment variables to Render...`);
  
  // Display variables being synced (masking sensitive values)
  console.log('\nVariables to sync:');
  envVarsList.forEach(({ key, value }) => {
    const isSensitive = key.includes('KEY') || 
                       key.includes('SECRET') || 
                       key.includes('PASSWORD') || 
                       key.includes('TOKEN');
    
    console.log(`  ${key}: ${isSensitive ? '********' : value}`);
  });
  
  if (dryRun) {
    console.log('\n[DRY RUN] No changes made to Render environment');
    return;
  }
  
  try {
    // API documentation: https://api-docs.render.com/reference/update-env-vars
    const response = await fetch(`https://api.render.com/v1/services/${serviceId}/env-vars`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ envVars: envVarsList })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
    }
    
    const result = await response.json();
    console.log('\nEnvironment variables successfully synced to Render!');
    console.log(`Updated ${result.length} environment variables`);
  } catch (error) {
    console.error('Error syncing environment variables:', error.message);
    process.exit(1);
  }
}

// Run the sync function
syncToRender().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
}); 