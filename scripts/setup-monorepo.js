#!/usr/bin/env node

/**
 * Monorepo Setup Script
 * 
 * This script handles the initial setup of the monorepo, ensuring all packages
 * are properly installed and built. It's designed to be run once during initial
 * setup or when dependencies change significantly.
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '../..');

// Helper function to run commands
function runCommand(command, cwd = rootDir) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Main setup function
async function setupMonorepo() {
  console.log('🚀 Setting up monorepo...');
  
  // Step 1: Clean install dependencies at the root
  console.log('\n📦 Installing root dependencies...');
  if (!runCommand('npm ci')) {
    console.error('Failed to install root dependencies');
    process.exit(1);
  }
  
  // Step 2: Build shared-types package
  console.log('\n🔨 Building shared-types package...');
  if (!runCommand('npm run build:types')) {
    console.error('Failed to build shared-types package');
    process.exit(1);
  }
  
  // Step 3: Type check the entire project
  console.log('\n✅ Type checking the project...');
  if (!runCommand('npm run typecheck')) {
    console.warn('Type checking failed, but continuing setup');
  }
  
  // Step 4: Build the client
  console.log('\n🌐 Building client...');
  if (!runCommand('npm run build:client')) {
    console.error('Failed to build client');
    process.exit(1);
  }
  
  console.log('\n✨ Monorepo setup complete!');
  console.log('You can now run:');
  console.log('  npm run dev     - Start development servers');
  console.log('  npm run build   - Build the entire project');
  console.log('  npm run test    - Run tests');
}

// Run the setup
setupMonorepo().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
}); 