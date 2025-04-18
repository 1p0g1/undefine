#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Common extensions to add to imports
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

// Directories to process
const dirsToProcess = ['src', 'packages/shared-types/src'];

// Regex to match relative imports without extensions
const importRegex = /from\s+['"]([./][^'"]*)['"]/g;
const typeImportRegex = /import\s+type\s+.*?from\s+['"]([./][^'"]*)['"]/g;

async function fixImports(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    let modified = content;

    const processImport = (match, importPath) => {
      // Skip if already has an extension
      if (extensions.some(ext => importPath.endsWith(ext))) {
        return match;
      }
      
      // Add .js extension for ESM compatibility
      return match.replace(importPath, `${importPath}.js`);
    };

    // Replace imports (both regular and type imports)
    modified = modified.replace(importRegex, (match, importPath) => {
      return processImport(match, importPath);
    });
    
    modified = modified.replace(typeImportRegex, (match, importPath) => {
      return processImport(match, importPath);
    });

    // Save if changes were made
    if (modified !== content) {
      await fs.writeFile(filePath, modified, 'utf8');
      console.log(`Fixed imports in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
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
      } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.tsx'))) {
        tsFiles.push(fullPath);
      }
    }

    return tsFiles;
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    return [];
  }
}

async function main() {
  let filesFixed = 0;
  
  for (const dir of dirsToProcess) {
    const fullDir = path.join(rootDir, dir);
    console.log(`Processing directory: ${fullDir}`);
    
    const tsFiles = await findTypeScriptFiles(fullDir);
    console.log(`Found ${tsFiles.length} TypeScript files`);
    
    for (const file of tsFiles) {
      const wasFixed = await fixImports(file);
      if (wasFixed) {
        filesFixed++;
      }
    }
  }
  
  console.log(`\nCompleted! Fixed imports in ${filesFixed} files.`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 