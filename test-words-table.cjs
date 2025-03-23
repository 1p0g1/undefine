// Test script for the WORDS table in Snowflake
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

// Connect to Snowflake
console.log('\nConnecting to Snowflake...');
connection.connect((err) => {
  if (err) {
    console.error('Connection error:', err);
    return;
  }
  
  console.log('Connected successfully to Snowflake!');
  
  // Check WORDS table structure
  console.log('\nChecking WORDS table structure...');
  connection.execute({
    sqlText: 'DESCRIBE TABLE WORDS',
    complete: (err, stmt, rows) => {
      if (err) {
        console.error('Error describing WORDS table:', err);
        cleanup();
        return;
      }
      
      console.log('WORDS table columns:');
      rows.forEach(column => {
        console.log(`- ${column.name} (${column.type})`);
      });
      
      // Count records in the WORDS table
      connection.execute({
        sqlText: 'SELECT COUNT(*) as COUNT FROM WORDS',
        complete: (err, stmt, rows) => {
          if (err) {
            console.error('Error counting records:', err);
            cleanup();
            return;
          }
          
          console.log(`\nTotal records in WORDS table: ${rows[0].COUNT}`);
          
          // Sample some records
          connection.execute({
            sqlText: 'SELECT * FROM WORDS LIMIT 3',
            complete: (err, stmt, rows) => {
              if (err) {
                console.error('Error fetching sample records:', err);
                cleanup();
                return;
              }
              
              console.log('\nSample WORDS records:');
              rows.forEach((row, index) => {
                console.log(`Record #${index + 1}:`);
                Object.keys(row).forEach(key => {
                  // Avoid printing large text fields completely
                  const value = typeof row[key] === 'string' && row[key].length > 50 
                    ? row[key].substring(0, 50) + '...' 
                    : row[key];
                  console.log(`  ${key}: ${value}`);
                });
                console.log('---');
              });
              
              // Test the getRandomWord query
              connection.execute({
                sqlText: 'SELECT * FROM WORDS ORDER BY RANDOM() LIMIT 1',
                complete: (err, stmt, rows) => {
                  if (err) {
                    console.error('Error fetching random word:', err);
                    cleanup();
                    return;
                  }
                  
                  console.log('\nRandom word:');
                  if (rows.length > 0) {
                    const word = rows[0];
                    console.log(`Word: ${word.WORD}`);
                    console.log(`Definition: ${word.DEFINITION}`);
                    console.log(`Part of Speech: ${word.PART_OF_SPEECH}`);
                  } else {
                    console.log('No words found');
                  }
                  
                  // Clean up and exit
                  cleanup();
                }
              });
            }
          });
        }
      });
    }
  });
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