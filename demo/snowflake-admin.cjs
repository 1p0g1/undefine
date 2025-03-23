/**
 * Snowflake Administration Tool
 * 
 * Run with: node snowflake-admin.cjs [command]
 * 
 * Available commands:
 * - info: Display information about the database
 * - tables: List all tables in the database
 * - count [table]: Count rows in the specified table (default: WORDS)
 * - sample [table] [limit]: Show sample rows from the specified table (default: WORDS, limit: 5)
 * - describe [table]: Show structure of the specified table
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// This script utilizes ES modules for importing the database client
// We'll use dynamic imports here
(async () => {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'info';
    const table = args[1] || 'WORDS';
    const limit = parseInt(args[2]) || 5;

    // Dynamically import the database module
    const { db } = await import('../src/config/database/index.js');
    
    console.log('Connecting to Snowflake...');
    await db.connect();
    console.log('Connected to Snowflake!');
    
    // Execute the requested command
    try {
      switch (command.toLowerCase()) {
        case 'info':
          await showDatabaseInfo();
          break;
        case 'tables':
          await listTables();
          break;
        case 'count':
          await countRows(table);
          break;
        case 'sample':
          await showSample(table, limit);
          break;
        case 'describe':
          await describeTable(table);
          break;
        default:
          console.error(`Unknown command: ${command}`);
          console.log('Available commands: info, tables, count, sample, describe');
      }
    } catch (error) {
      console.error('Error executing command:');
      console.error(error);
    } finally {
      await db.disconnect();
      console.log('Disconnected from Snowflake');
    }

    // Command implementations using the db client
    async function showDatabaseInfo() {
      console.log('Database Information:');
      console.log('--------------------------');
      
      const info = await db.getDatabaseInfo();
      
      console.log(`Snowflake Version: ${info.version}`);
      console.log(`Current Database: ${info.database}`);
      console.log(`Current Schema: ${info.schema}`);
      console.log(`Current Warehouse: ${info.warehouse}`);
      console.log(`Number of Tables: ${info.tableCount}`);
    }

    async function listTables() {
      console.log('Tables in Database:');
      console.log('--------------------------');
      
      const tables = await db.listTables();
      
      if (tables.length === 0) {
        console.log('No tables found.');
        return;
      }
      
      tables.forEach(tableName => {
        console.log(`- ${tableName}`);
      });
    }

    async function countRows(table) {
      console.log(`Row Count for ${table}:`);
      console.log('--------------------------');
      
      try {
        const count = await db.countTableRows(table);
        console.log(`${table} has ${count} rows`);
      } catch (error) {
        console.error(`Error counting rows in ${table}:`);
        console.error(error.message);
      }
    }

    async function showSample(table, limit) {
      console.log(`Sample Data from ${table} (${limit} rows):`);
      console.log('--------------------------');
      
      try {
        const rows = await db.getSampleTableData(table, limit);
        
        if (rows.length === 0) {
          console.log(`No data found in ${table}.`);
          return;
        }
        
        // Print column names
        const columns = Object.keys(rows[0]);
        console.log('Columns: ' + columns.join(', '));
        console.log('--------------------------');
        
        // Print rows
        rows.forEach((row, i) => {
          console.log(`Row ${i + 1}:`);
          columns.forEach(col => {
            const value = row[col] !== null ? row[col] : 'NULL';
            console.log(`  ${col}: ${value}`);
          });
          console.log('--------------------------');
        });
      } catch (error) {
        console.error(`Error retrieving sample data from ${table}:`);
        console.error(error.message);
      }
    }

    async function describeTable(table) {
      console.log(`Structure of ${table}:`);
      console.log('--------------------------');
      
      try {
        const columns = await db.describeTable(table);
        
        if (columns.length === 0) {
          console.log(`No columns found for ${table}.`);
          return;
        }
        
        // Print column info
        columns.forEach(column => {
          console.log(`- ${column.name} (${column.type})`);
        });
      } catch (error) {
        console.error(`Error describing table ${table}:`);
        console.error(error.message);
      }
    }
  } catch (error) {
    console.error('Failed to initialize:', error);
    process.exit(1);
  }
})(); 