#!/usr/bin/env node
/**
 * This script updates import statements across the codebase
 * to use path aliases instead of relative paths with .js extensions.
 *
 * It changes:
 * import { Type } from '../types/shared.js' 
 * import { Type } from '../shared/types/shared.js'
 * 
 * to:
 * import { Type } from 'shared-types'
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to update imports in a file
function updateImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Update import statements
  content = content.replace(
    /import\s+{([^}]+)}\s+from\s+['"]shared-types['"]/g,
    'import {$1} from \'@undefine/shared-types\''
  );
  
  content = content.replace(
    /import\s+type\s+{([^}]+)}\s+from\s+['"]shared-types['"]/g,
    'import type {$1} from \'@undefine/shared-types\''
  );
  
  content = content.replace(
    /import\s+(\w+)\s+from\s+['"]shared-types['"]/g,
    'import $1 from \'@undefine/shared-types\''
  );
  
  content = content.replace(
    /import\s+\*\s+as\s+(\w+)\s+from\s+['"]shared-types['"]/g,
    'import * as $1 from \'@undefine/shared-types\''
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated imports in ${filePath}`);
}

// Function to recursively find all TypeScript files
function findTypeScriptFiles(dir) {
  const files = fs.readdirSync(dir);
  const tsFiles = [];
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      tsFiles.push(...findTypeScriptFiles(filePath));
    } else if (stat.isFile() && /\.(ts|tsx)$/.test(file)) {
      tsFiles.push(filePath);
    }
  }
  
  return tsFiles;
}

// Main execution
try {
  const rootDir = path.resolve(__dirname, '../..');
  const tsFiles = findTypeScriptFiles(rootDir);
  
  for (const file of tsFiles) {
    updateImports(file);
  }
  
  console.log('Import updates completed successfully');
} catch (error) {
  console.error('Error updating imports:', error);
  process.exit(1);
} 