#!/usr/bin/env node
// fix-imports.js
// A script to handle TypeScript import extensions correctly for both client and server

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Adjust rootDir to be the project root (two levels up from scripts/maintenance)
const rootDir = path.resolve(__dirname, '../..');

// Common extensions to add to imports
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

// Updated directories to process using the new project structure
const dirsToProcess = ['src', 'client/src', 'packages/shared-types/src'];

// Regex to match relative imports without extensions
const importRegex = /from\s+['"]([./][^'"]*)['"]/g;
const typeImportRegex = /import\s+type\s+.*?from\s+['"]([./][^'"]*)['"]/g;

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  fg: {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
  }
};

function logStep(message) {
  console.log(`${colors.fg.cyan}${colors.bright}==> ${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.fg.green}✓ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.fg.yellow}⚠️ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.fg.red}✗ ${message}${colors.reset}`);
}

async function fixImports(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    let modified = content;
    
    // Determine if this is a client-side file (different rules apply)
    const isClientFile = filePath.includes('/client/');

    const processImport = (match, importPath) => {
      // Skip if already has an extension or is a package import (not starting with . or /)
      if (extensions.some(ext => importPath.endsWith(ext)) || 
          !(importPath.startsWith('.') || importPath.startsWith('/'))) {
        return match;
      }
      
      // For client-side files, we don't need to add extensions when using Vite
      if (isClientFile) {
        return match;
      }
      
      // Add .js extension for NodeNext compatibility
      return match.replace(importPath, `${importPath}.js`);
    };

    // Replace imports (both regular and type imports)
    modified = modified.replace(importRegex, (match, importPath) => {
      return processImport(match, importPath);
    });
    
    modified = modified.replace(typeImportRegex, (match, importPath) => {
      return processImport(match, importPath);
    });

    // Fix React imports for client files
    if (isClientFile && (filePath.endsWith('.tsx') || filePath.endsWith('.jsx'))) {
      // Ensure React is imported for JSX files
      if (!modified.includes("import React")) {
        modified = `import React from 'react';\n${modified}`;
      }
    }

    // Save if changes were made
    if (modified !== content) {
      await fs.writeFile(filePath, modified, 'utf8');
      logSuccess(`Fixed imports in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    logError(`Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

async function findTypeScriptFiles(dir) {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    let tsFiles = [];

    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory() && file.name !== 'node_modules' && file.name !== 'dist' && !file.name.startsWith('.')) {
        const subDirFiles = await findTypeScriptFiles(fullPath);
        tsFiles = [...tsFiles, ...subDirFiles];
      } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.jsx'))) {
        tsFiles.push(fullPath);
      }
    }

    return tsFiles;
  } catch (error) {
    logError(`Error reading directory ${dir}: ${error.message}`);
    return [];
  }
}

async function main() {
  let filesFixed = 0;
  
  for (const dir of dirsToProcess) {
    const fullDir = path.join(rootDir, dir);
    logStep(`Processing directory: ${fullDir}`);
    
    try {
      // Check if directory exists before processing
      await fs.access(fullDir);
      const tsFiles = await findTypeScriptFiles(fullDir);
      logStep(`Found ${tsFiles.length} TypeScript/JSX files`);
      
      for (const file of tsFiles) {
        const wasFixed = await fixImports(file);
        if (wasFixed) {
          filesFixed++;
        }
      }
    } catch (err) {
      logError(`Error processing directory ${fullDir}: ${err.message}`);
    }
  }
  
  logStep(`\nCompleted! Fixed imports in ${filesFixed} files.`);
}

main().catch(err => {
  logError(`Error: ${err.message}`);
  process.exit(1);
}); 