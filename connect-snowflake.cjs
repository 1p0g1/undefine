// Simple Snowflake connection test using the Node.js driver directly
const snowflake = require('snowflake-sdk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Log connection parameters (sensitive info redacted)
console.log('Snowflake Configuration:');
console.log(`Account: ${process.env.SNOWFLAKE_ACCOUNT}`);
console.log(`Username: ${process.env.SNOWFLAKE_USERNAME}`);
console.log(`Database: ${process.env.SNOWFLAKE_DATABASE}`);
console.log(`Warehouse: ${process.env.SNOWFLAKE_WAREHOUSE}`);
console.log(`Schema: ${process.env.SNOWFLAKE_SCHEMA || 'PUBLIC'}`);

// Configure Snowflake connection
const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USERNAME,
  password: process.env.SNOWFLAKE_PASSWORD,
  database: process.env.SNOWFLAKE_DATABASE,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  schema: process.env.SNOWFLAKE_SCHEMA || 'PUBLIC',
});

// Connect to Snowflake
console.log('\nConnecting to Snowflake...');
connection.connect((err) => {
  if (err) {
    console.error('Connection error:', err);
    console.log('\nTroubleshooting suggestions:');
    console.log('1. Check if Snowflake credentials are correct');
    console.log('2. Verify account identifier format (should be like ORGNAME-ACCOUNTNAME)');
    console.log('3. Make sure your IP is whitelisted if using IP restrictions');
    console.log('4. Check if the account is active and not locked');
    console.log('5. Verify that database, warehouse, and schema exist and are accessible');
    return;
  }
  
  console.log('Connected successfully to Snowflake!');
  
  // Execute a simple query
  console.log('\nExecuting test query...');
  connection.execute({
    sqlText: 'SELECT CURRENT_TIMESTAMP() as CURRENT_TIME',
    complete: (err, stmt, rows) => {
      if (err) {
        console.error('Query error:', err);
        return;
      }
      
      console.log('Query executed successfully');
      console.log('Result:', rows[0]);
      
      // Test database structure
      console.log('\nQuerying database structure...');
      connection.execute({
        sqlText: `SHOW TABLES IN DATABASE ${process.env.SNOWFLAKE_DATABASE.split('.')[0]}`,
        complete: (err, stmt, rows) => {
          if (err) {
            console.error('Error querying tables:', err);
          } else {
            console.log(`Found ${rows.length} tables:`);
            rows.slice(0, 5).forEach(table => {
              console.log(`- ${table.name} (${table.database_name}.${table.schema_name})`);
            });
            if (rows.length > 5) {
              console.log(`... and ${rows.length - 5} more`);
            }
          }
          
          // Finally, destroy the connection
          console.log('\nClosing connection...');
          connection.destroy(function(err) {
            if (err) {
              console.error('Error during disconnect:', err);
            } else {
              console.log('Disconnected successfully');
            }
            
            // Exit process
            process.exit(0);
          });
        }
      });
    }
  });
}); 