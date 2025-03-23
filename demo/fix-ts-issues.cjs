/**
 * TypeScript Issue Fixer
 * 
 * Run with: node fix-ts-issues.cjs
 * 
 * This script helps identify and resolve TypeScript issues in the main project.
 * It checks for common errors related to Snowflake integration.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('TypeScript Issue Fixer');
console.log('---------------------');

// Paths to check
const filesToCheck = [
  '../src/config/snowflake.ts',
  '../src/config/database/SnowflakeClient.ts',
  '../src/services/GameService.ts',
  '../src/services/WordService.ts'
];

// Common issues to look for
const knownIssues = [
  {
    pattern: 'executeQuery\\(',
    message: 'Private method executeQuery() used directly',
    solution: 'Use the query() method instead of executeQuery()'
  },
  {
    pattern: 'snowflake-sdk',
    message: 'Direct import from snowflake-sdk',
    solution: 'Consider creating a custom type definition file (snowflake.d.ts)'
  },
  {
    pattern: 'DB_PROVIDER',
    message: 'DB_PROVIDER environment variable usage',
    solution: 'Make sure DB_PROVIDER is set in .env file'
  }
];

// Check if TypeScript is installed
exec('cd .. && npx tsc --version', (error, stdout, stderr) => {
  if (error) {
    console.log('⚠️ TypeScript not found or error checking version');
    console.log('Error:', error.message);
    return;
  }
  
  console.log(`TypeScript version: ${stdout.trim()}`);
  console.log('');
  
  // Check for files and issues
  checkFiles();
});

function checkFiles() {
  filesToCheck.forEach(filePath => {
    const fullPath = path.resolve(__dirname, filePath);
    
    console.log(`Checking ${filePath}...`);
    
    try {
      if (!fs.existsSync(fullPath)) {
        console.log(`  ⚠️ File not found: ${filePath}`);
        return;
      }
      
      const content = fs.readFileSync(fullPath, 'utf8');
      let issuesFound = false;
      
      // Check for known issues
      knownIssues.forEach(issue => {
        const regex = new RegExp(issue.pattern, 'g');
        const matches = content.match(regex);
        
        if (matches) {
          issuesFound = true;
          console.log(`  ⚠️ Issue found: ${issue.message}`);
          console.log(`    Occurrences: ${matches.length}`);
          console.log(`    Suggested solution: ${issue.solution}`);
        }
      });
      
      if (!issuesFound) {
        console.log('  ✅ No known issues found');
      }
      
      console.log('');
    } catch (error) {
      console.error(`  ❌ Error checking file ${filePath}:`);
      console.error('  ', error.message);
      console.log('');
    }
  });
  
  // Run TypeScript compiler to check for errors
  runTypeCheck();
}

function runTypeCheck() {
  console.log('Running TypeScript compiler check...');
  
  exec('cd .. && npx tsc --noEmit', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ TypeScript errors found:');
      
      // Extract just the error messages from the output
      const errorLines = stderr.split('\n').filter(line => 
        line.includes('.ts(') || line.includes('.tsx(')
      );
      
      if (errorLines.length > 0) {
        console.log('');
        console.log('Summary of TypeScript errors:');
        errorLines.slice(0, 10).forEach(line => {
          console.log(`  - ${line.trim()}`);
        });
        
        if (errorLines.length > 10) {
          console.log(`  ... and ${errorLines.length - 10} more errors`);
        }
        
        console.log('');
        console.log('Common solutions:');
        console.log('  1. Create a type definition file for snowflake-sdk (snowflake.d.ts)');
        console.log('  2. Make SnowflakeClient methods public instead of private');
        console.log('  3. Use a factory pattern to handle both mock and real implementations');
        console.log('  4. Consider using "any" type temporarily to unblock development');
      } else {
        console.log(stderr);
      }
    } else {
      console.log('✅ TypeScript compiler check passed!');
    }
    
    console.log('');
    suggestNextSteps();
  });
}

function suggestNextSteps() {
  console.log('Suggested next steps:');
  console.log('-------------------');
  console.log('1. Create a snowflake.d.ts file with type definitions');
  console.log('2. Update SnowflakeClient.ts to handle errors gracefully');
  console.log('3. Switch to mock data during development (npm run use:mock)');
  console.log('4. Test each component individually before integrating');
  console.log('');
  
  // Suggest creating a type definitions file
  console.log('Example snowflake.d.ts:');
  console.log('--------------------');
  console.log(`declare module 'snowflake-sdk' {
  export interface Connection {
    execute(options: {
      sqlText: string;
      complete: (err: Error | null, stmt: any, rows: any[]) => void;
    }): void;
    connect(callback: (err: Error | null, conn: Connection) => void): void;
    destroy(callback?: (err: Error | null, conn: Connection) => void): void;
  }
  
  export interface ConnectionOptions {
    account: string;
    username: string;
    password: string;
    database?: string;
    schema?: string;
    warehouse?: string;
    role?: string;
  }
  
  export function createConnection(options: ConnectionOptions): Connection;
}`);
} 