#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob([
  'src/**/*.ts',
  'src/**/*.tsx',
  'tests/**/*.ts',
  'tests/**/*.tsx',
  'dist/**/*.ts',
  'dist/**/*.tsx',
  'dist-server/**/*.ts',
  'dist-server/**/*.tsx',
  'dist-test/**/*.ts',
  'dist-test/**/*.tsx',
  'dist-types/**/*.ts',
  'dist-types/**/*.tsx'
], {
  ignore: ['**/node_modules/**', '**/packages/**']
});

const fixImports = (content) => {
  // Replace imports from shared-types/src with @undefine/shared-types
  return content
    // Fix imports from index.js
    .replace(
      /from ['"]\.\.+\/packages\/shared-types\/src\/index\.js['"];?/g,
      'from "@undefine/shared-types";'
    )
    // Fix imports from specific files
    .replace(
      /from ['"]\.\.+\/packages\/shared-types\/src\/([^'"]+)\.js['"];?/g,
      'from "@undefine/shared-types";'
    )
    // Fix imports without .js extension
    .replace(
      /from ['"]\.\.+\/packages\/shared-types\/src\/([^'"]+)['"];?/g,
      'from "@undefine/shared-types";'
    );
};

let fixedFiles = 0;
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const fixed = fixImports(content);
  if (fixed !== content) {
    writeFileSync(file, fixed);
    console.log(`✅ Fixed imports in ${file}`);
    fixedFiles++;
  }
}

console.log(`\nFixed imports in ${fixedFiles} files`); 