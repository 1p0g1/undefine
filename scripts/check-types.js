#!/usr/bin/env node

/**
 * TypeScript type definition checker
 * 
 * This script verifies that all necessary @types packages are installed
 * for the dependencies in the project.
 */

import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
const { dependencies = {}, devDependencies = {} } = packageJson;

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

const missingTypes = requiredTypes.filter(type => !devDependencies[type]);

if (missingTypes.length > 0) {
  console.log('🔎 Installing missing @types packages:', missingTypes.join(', '));
  execSync(`npm install --save-dev ${missingTypes.join(' ')}`, { stdio: 'inherit' });
  console.log('✅ Done! All required @types packages are now installed.');
} else {
  console.log('✅ All @types packages are already installed.');
} 