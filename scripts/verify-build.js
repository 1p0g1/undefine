#!/usr/bin/env node

/**
 * Build verification script for the undefine monorepo
 * 
 * This script verifies that:
 * 1. Shared types are built correctly
 * 2. Path aliases are resolved correctly
 * 3. All necessary files are present
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Helper function to check if a directory exists
function dirExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
}

// Helper function to run a command and return its output
function runCommand(command, cwd = process.cwd()) {
  try {
    return execSync(command, { cwd, encoding: 'utf8' });
  } catch (error) {
    console.error(`${colors.red}Error running command: ${command}${colors.reset}`);
    console.error(error.message);
    return null;
  }
}

// Helper function to check TypeScript path resolution
function checkTypeScriptPathResolution() {
  console.log(`${colors.blue}Checking TypeScript path resolution...${colors.reset}`);
  
  // Create a temporary file to test imports
  const tempDir = path.join(process.cwd(), 'temp-verify');
  if (!dirExists(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  
  const tempFile = path.join(tempDir, 'test-import.ts');
  fs.writeFileSync(tempFile, `
    import { WordData } from '@undefine/shared-types/utils/word';
    console.log('Import successful');
  `);
  
  // Try to compile the file
  const result = runCommand('npx tsc --noEmit ' + tempFile);
  
  // Clean up
  fs.rmSync(tempDir, { recursive: true, force: true });
  
  return result !== null;
}

// Main verification function
function verifyBuild() {
  console.log(`${colors.cyan}=== Undefine Build Verification ===${colors.reset}`);
  
  // Step 1: Check if shared types are built
  console.log(`${colors.blue}Step 1: Checking shared types build...${colors.reset}`);
  const sharedTypesDist = path.join(process.cwd(), 'packages', 'shared-types', 'dist');
  const sharedTypesIndexDts = path.join(sharedTypesDist, 'index.d.ts');
  const sharedTypesIndexJs = path.join(sharedTypesDist, 'index.js');
  
  if (!fileExists(sharedTypesIndexDts)) {
    console.error(`${colors.red}❌ Shared types declaration file not found: ${sharedTypesIndexDts}${colors.reset}`);
    console.log(`${colors.yellow}Running shared types build...${colors.reset}`);
    runCommand('cd packages/shared-types && npm run build');
    
    if (!fileExists(sharedTypesIndexDts)) {
      console.error(`${colors.red}❌ Shared types build failed${colors.reset}`);
      process.exit(1);
    }
  }
  
  if (!fileExists(sharedTypesIndexJs)) {
    console.error(`${colors.red}❌ Shared types JavaScript file not found: ${sharedTypesIndexJs}${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`${colors.green}✅ Shared types build verified${colors.reset}`);
  
  // Step 2: Check TypeScript path resolution
  console.log(`${colors.blue}Step 2: Checking TypeScript path resolution...${colors.reset}`);
  if (!checkTypeScriptPathResolution()) {
    console.error(`${colors.red}❌ TypeScript path resolution failed${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`${colors.green}✅ TypeScript path resolution verified${colors.reset}`);
  
  // Step 3: Check server build
  console.log(`${colors.blue}Step 3: Checking server build...${colors.reset}`);
  const serverDist = path.join(process.cwd(), 'dist-server');
  const serverIndexJs = path.join(serverDist, 'index.js');
  
  if (!fileExists(serverIndexJs)) {
    console.log(`${colors.yellow}Server build not found, running build...${colors.reset}`);
    runCommand('npm run build:server');
    
    if (!fileExists(serverIndexJs)) {
      console.error(`${colors.red}❌ Server build failed${colors.reset}`);
      process.exit(1);
    }
  }
  
  console.log(`${colors.green}✅ Server build verified${colors.reset}`);
  
  // Step 4: Check client build
  console.log(`${colors.blue}Step 4: Checking client build...${colors.reset}`);
  const clientDist = path.join(process.cwd(), 'client', 'dist');
  const clientIndexHtml = path.join(clientDist, 'index.html');
  
  if (!fileExists(clientIndexHtml)) {
    console.log(`${colors.yellow}Client build not found, running build...${colors.reset}`);
    runCommand('cd client && npm run build');
    
    if (!fileExists(clientIndexHtml)) {
      console.error(`${colors.red}❌ Client build failed${colors.reset}`);
      process.exit(1);
    }
  }
  
  console.log(`${colors.green}✅ Client build verified${colors.reset}`);
  
  // All checks passed
  console.log(`${colors.green}✅ All build verification checks passed${colors.reset}`);
}

// Run the verification
verifyBuild(); 