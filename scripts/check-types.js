#!/usr/bin/env node

/**
 * TypeScript type definition checker
 * 
 * This script verifies that all necessary @types packages are installed
 * for the dependencies in the project.
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

// Required @types packages for common dependencies
const requiredTypes = [
  '@types/react',
  '@types/react-dom',
  '@types/cors',
  '@types/compression',
  '@types/morgan',
  '@types/node-fetch',
  '@types/testing-library__react'
];

// Helper function to check if a package is installed
function isPackageInstalled(packageName) {
  try {
    // Check if package is in node_modules
    const packagePath = path.join(process.cwd(), 'node_modules', packageName);
    return fs.existsSync(packagePath);
  } catch (error) {
    return false;
  }
}

// Helper function to check if a package is in package.json
function isPackageInPackageJson(packageName) {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check in dependencies and devDependencies
    return (
      (packageJson.dependencies && packageJson.dependencies[packageName]) ||
      (packageJson.devDependencies && packageJson.devDependencies[packageName])
    );
  } catch (error) {
    console.error(`${colors.red}Error reading package.json: ${error.message}${colors.reset}`);
    return false;
  }
}

// Main function to check for missing @types packages
function checkTypes() {
  console.log(`${colors.cyan}Checking for required @types packages...${colors.reset}`);
  
  let missingTypes = [];
  
  for (const typePackage of requiredTypes) {
    if (!isPackageInstalled(typePackage)) {
      missingTypes.push(typePackage);
    }
  }
  
  if (missingTypes.length > 0) {
    console.error(`${colors.red}❌ Missing required @types packages:${colors.reset}`);
    for (const typePackage of missingTypes) {
      console.error(`  - ${typePackage}`);
    }
    console.error(`${colors.yellow}Please install the missing packages with:${colors.reset}`);
    console.error(`  npm install --save-dev ${missingTypes.join(' ')}`);
    process.exit(1);
  }
  
  console.log(`${colors.green}✅ All required @types packages are installed${colors.reset}`);
}

// Run the check
checkTypes(); 