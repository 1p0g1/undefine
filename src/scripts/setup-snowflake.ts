import { connectToSnowflake, executeQuery } from '../config/snowflake.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupSnowflake() {
  try {
    // Connect to Snowflake
    await connectToSnowflake();
    console.log('Connected to Snowflake');

    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'config', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    // Execute each statement
    for (const statement of statements) {
      try {
        await executeQuery(statement);
        console.log('Successfully executed:', statement.split('\n')[0] + '...');
      } catch (error) {
        console.error('Error executing statement:', statement);
        console.error('Error details:', error);
      }
    }

    console.log('Schema setup completed');
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setupSnowflake(); 