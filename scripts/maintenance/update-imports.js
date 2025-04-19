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

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

// Directories to search in
const searchDirs = [
  path.join(rootDir, 'src'),
];

// Extensions to process
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// Import patterns to replace
const importPatterns = [
  {
    regex: /import\s+([^;]+?)\s+from\s+['"]([^'"]*?\/types\/shared\.js)['"]/g,
    replacement: "import $1 from 'shared-types'"
  },
  {
    regex: /import\s+([^;]+?)\s+from\s+['"]([^'"]*?\/shared\/types\/shared\.js)['"]/g,
    replacement: "import $1 from 'shared-types'"
  },
  {
    regex: /import\s+\*\s+as\s+([^;]+?)\s+from\s+['"]([^'"]*?\/types\/shared\.js)['"]/g,
    replacement: "import * as $1 from 'shared-types'"
  },
  {
    regex: /import\s+\*\s+as\s+([^;]+?)\s+from\s+['"]([^'"]*?\/shared\/types\/shared\.js)['"]/g,
    replacement: "import * as $1 from 'shared-types'"
  }
];

/**
 * Process a file to update import statements
 * @param {string} filePath - Path to the file
 * @returns {boolean} - Whether the file was updated
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    let originalContent = content;

    for (const pattern of importPatterns) {
      content = content.replace(pattern.regex, pattern.replacement);
    }

    // Check if anything was changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

/**
 * Walk through a directory recursively to find files
 * @param {string} dir - Directory to search
 * @param {Function} callback - Callback for each file
 */
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && 
        !filePath.includes('node_modules') && 
        !filePath.includes('dist')) {
      walkDir(filePath, callback);
    } else if (stat.isFile() && extensions.includes(path.extname(filePath))) {
      callback(filePath);
    }
  });
}

/**
 * Main execution function
 */
function main() {
  console.log('🔄 Updating import statements to use path aliases...');
  
  let totalFiles = 0;
  let updatedFiles = 0;

  searchDirs.forEach(dir => {
    walkDir(dir, (filePath) => {
      totalFiles++;
      const wasUpdated = processFile(filePath);
      if (wasUpdated) {
        updatedFiles++;
        console.log(`✅ Updated: ${path.relative(rootDir, filePath)}`);
      }
    });
  });

  console.log(`\n📊 Summary: Updated ${updatedFiles} of ${totalFiles} files`);
}

main(); 