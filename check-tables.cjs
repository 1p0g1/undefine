// Script to check all Snowflake tables
const snowflake = require('snowflake-sdk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configure Snowflake connection
const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USERNAME,
  password: process.env.SNOWFLAKE_PASSWORD,
  database: process.env.SNOWFLAKE_DATABASE,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  schema: process.env.SNOWFLAKE_SCHEMA || 'PUBLIC',
});

// Tables to check
const tables = [
  'WORDS',
  'LEADERBOARD',
  'LEADERBOARD_ARCHIVE',
  'USER_STATS'
];

// Connect to Snowflake
console.log('\nConnecting to Snowflake...');
connection.connect((err) => {
  if (err) {
    console.error('Connection error:', err);
    return;
  }
  
  console.log('Connected successfully to Snowflake!');
  
  // Check each table
  let tableIndex = 0;
  checkNextTable();
  
  function checkNextTable() {
    if (tableIndex >= tables.length) {
      cleanup();
      return;
    }
    
    const table = tables[tableIndex++];
    console.log(`\n==== Checking ${table} table ====`);
    
    // Check table structure
    connection.execute({
      sqlText: `DESCRIBE TABLE ${table}`,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error(`Error describing ${table} table: ${err.message}`);
          checkNextTable();
          return;
        }
        
        console.log(`${table} table columns:`);
        rows.forEach(column => {
          console.log(`- ${column.name} (${column.type})`);
        });
        
        // Count records in the table
        connection.execute({
          sqlText: `SELECT COUNT(*) as COUNT FROM ${table}`,
          complete: (err, stmt, rows) => {
            if (err) {
              console.error(`Error counting records in ${table}: ${err.message}`);
              checkNextTable();
              return;
            }
            
            console.log(`Total records in ${table} table: ${rows[0].COUNT}`);
            checkNextTable();
          }
        });
      }
    });
  }
});

function cleanup() {
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