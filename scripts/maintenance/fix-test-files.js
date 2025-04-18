#!/usr/bin/env node
// fix-test-files.js
// A script to update userEvent imports and usage in test files

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Helper function to walk through directories
function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    
    if (stats.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
      walk(filepath, callback);
    } else if (stats.isFile()) {
      callback(filepath);
    }
  });
}

// Process test files to fix userEvent usage
function processTestFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath).toLowerCase();
  
  // Only process test files
  if (!['.ts', '.tsx'].includes(ext) || !filename.includes('test')) {
    return false;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // 1. Fix userEvent imports
    content = content.replace(
      /import\s+(\{\s*)?userEvent(\s*\})?\s+from\s+['"]@testing-library\/user-event['"]/g,
      "import userEvent from '@testing-library/user-event'"
    );
    
    // 2. Add setup code for userEvent if not already there
    if (content.includes("userEvent.setup()") === false &&
        content.includes("import userEvent from '@testing-library/user-event'") &&
        content.includes("describe(")) {
      
      // Add setup right after the describe opening
      content = content.replace(
        /(describe\([^{]*\{)/,
        "$1\n  // Create a userEvent instance for each test\n  const user = userEvent.setup();"
      );
      
      // 3. Replace direct userEvent calls with user object calls
      content = content.replace(
        /userEvent\.(click|type|clear|hover|tab|keyboard|selectOptions|upload|paste|clear|dblClick)/g,
        "user.$1"
      );
    }
    
    // 4. Fix missing React imports for TSX files
    if (ext === '.tsx' && !content.includes('import React')) {
      content = `import React from 'react';\n${content}`;
    }
    
    // 5. Fix JSX type errors
    if (content.includes('@testing-library/react')) {
      // Add import for screen if not present
      if (!content.includes('screen') && content.includes('render')) {
        content = content.replace(
          /import\s+\{([^}]*)\}\s+from\s+['"]@testing-library\/react['"]/,
          (match, imports) => {
            if (!imports.includes('screen')) {
              const newImports = imports.trim().endsWith(',') 
                ? `${imports} screen`
                : `${imports}, screen`;
              return `import { ${newImports} } from '@testing-library/react'`;
            }
            return match;
          }
        );
      }
      
      // Add import for jest-dom if not present
      if (!content.includes('@testing-library/jest-dom') && 
          (content.includes('toBeInTheDocument') || content.includes('toHaveClass'))) {
        content = `import '@testing-library/jest-dom';\n${content}`;
      }
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      logSuccess(`Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (err) {
    logError(`Failed to process ${filePath}: ${err.message}`);
    return false;
  }
}

// Main execution
async function main() {
  logStep('Starting test file fix script...');

  const dirsToProcess = [
    path.join(__dirname, 'client'),
    path.join(__dirname, 'src')
  ];
  
  let filesProcessed = 0;
  let filesFixed = 0;
  
  dirsToProcess.forEach(dir => {
    if (fs.existsSync(dir)) {
      logStep(`Processing directory: ${dir}`);
      
      walk(dir, (filePath) => {
        filesProcessed++;
        if (processTestFile(filePath)) {
          filesFixed++;
        }
      });
    } else {
      logWarning(`Directory ${dir} does not exist`);
    }
  });
  
  logStep(`Processed ${filesProcessed} files`);
  logSuccess(`Fixed ${filesFixed} test files`);
}

main().catch(err => {
  logError(`Script failed: ${err.message}`);
  process.exit(1);
}); 