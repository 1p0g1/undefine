import dotenv from 'dotenv';
import { connectionManager } from './config/snowflake.js';
import { Connection, RowStatement as Statement } from 'snowflake-sdk';

// Load environment variables first
dotenv.config();

// Simple test script to check Snowflake connection
async function testSnowflakeConnection() {
  console.log('Testing Snowflake connection...');
  let connection: Connection | null = null;
  
  try {
    console.log('Snowflake configuration:');
    console.log(`Account: ${process.env.SNOWFLAKE_ACCOUNT}`);
    console.log(`Username: ${process.env.SNOWFLAKE_USERNAME}`);
    console.log(`Database: ${process.env.SNOWFLAKE_DATABASE}`);
    console.log(`Warehouse: ${process.env.SNOWFLAKE_WAREHOUSE}`);
    console.log(`Schema: ${process.env.SNOWFLAKE_SCHEMA || 'PUBLIC'}`);
    
    // Get a connection from the pool
    console.log('\nAttempting to connect to Snowflake...');
    connection = await connectionManager.getConnection();
    console.log('✓ Connection successful');
    
    // Change Snowflake settings
    console.log('\nSetting up Snowflake session...');
    await connection.execute({
      sqlText: `USE WAREHOUSE ${process.env.SNOWFLAKE_WAREHOUSE}`,
      complete: (err: Error | undefined, stmt: Statement, rows: any[] | undefined) => {
        if (err) console.error('Error setting warehouse:', err);
        else console.log('Warehouse set successfully');
      }
    });
    
    await connection.execute({
      sqlText: `USE DATABASE ${process.env.SNOWFLAKE_DATABASE?.split('.')[0]}`,
      complete: (err: Error | undefined, stmt: Statement, rows: any[] | undefined) => {
        if (err) console.error('Error setting database:', err);
        else console.log('Database set successfully');
      }
    });
    
    await connection.execute({
      sqlText: 'USE SCHEMA PUBLIC',
      complete: (err: Error | undefined, stmt: Statement, rows: any[] | undefined) => {
        if (err) console.error('Error setting schema:', err);
        else console.log('Schema set successfully');
      }
    });
    
    // Test a simple query
    console.log('\nTesting simple query...');
    let queryResult = null;
    await new Promise<any[]>((resolve, reject) => {
      connection?.execute({
        sqlText: 'SELECT CURRENT_TIMESTAMP() as CURRENT_TIME',
        complete: (err: Error | undefined, stmt: Statement, rows: any[] | undefined) => {
          if (err) {
            console.error('Query error:', err);
            reject(err);
          } else {
            queryResult = rows;
            console.log('✓ Query successful');
            console.log('Result:', rows?.[0]);
            resolve(rows || []);
          }
        }
      });
    });
    
    // Test database-specific query - checking table structure
    console.log('\nTesting database structure...');
    console.log('Querying tables in the current schema...');
    
    try {
      await new Promise<any[]>((resolve, reject) => {
        connection?.execute({
          sqlText: `SHOW TABLES IN DATABASE ${process.env.SNOWFLAKE_DATABASE?.split('.')[0]}`,
          complete: (err: Error | undefined, stmt: Statement, rows: any[] | undefined) => {
            if (err) {
              console.error('Error querying tables:', err);
              reject(err);
            } else {
              console.log(`Found ${rows?.length || 0} tables:`);
              rows?.slice(0, 5).forEach((table: any) => {
                console.log(`- ${table.name} (${table.database_name}.${table.schema_name})`);
              });
              if (rows && rows.length > 5) {
                console.log(`... and ${rows.length - 5} more`);
              }
              resolve(rows || []);
            }
          }
        });
      });
    } catch (error) {
      console.error('Error querying tables:', error);
    }
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Snowflake connection test failed:', error);
    
    // Provide troubleshooting guidance
    console.log('\nTroubleshooting suggestions:');
    console.log('1. Check your Snowflake credentials in .env file');
    console.log('2. Verify the account, database, and warehouse names');
    console.log('3. Make sure your IP is whitelisted if using IP restrictions');
    console.log('4. Check if your account is active and not locked');
  } finally {
    // Clean up
    console.log('\nCleaning up...');
    try {
      // Return connection to pool if available
      if (connection) {
        await connectionManager.releaseConnection(connection);
        console.log('Connection returned to pool.');
      }
      
      await connectionManager.cleanup();
      console.log('Connection resources released.');
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
  }
}

// Run the test
testSnowflakeConnection().catch(console.error); 