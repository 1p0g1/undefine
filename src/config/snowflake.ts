import snowflake, { Connection, StatementCallback } from 'snowflake-sdk';
import dotenv from 'dotenv';

dotenv.config();

const {
  SNOWFLAKE_ACCOUNT,
  SNOWFLAKE_USERNAME,
  SNOWFLAKE_PASSWORD,
  SNOWFLAKE_DATABASE,
  SNOWFLAKE_WAREHOUSE,
  SNOWFLAKE_SCHEMA = 'PUBLIC'
} = process.env;

if (!SNOWFLAKE_ACCOUNT || !SNOWFLAKE_USERNAME || !SNOWFLAKE_PASSWORD || !SNOWFLAKE_DATABASE || !SNOWFLAKE_WAREHOUSE) {
  throw new Error('Missing required Snowflake configuration');
}

// Create a connection pool
const connection: Connection = snowflake.createConnection({
  account: SNOWFLAKE_ACCOUNT,
  username: SNOWFLAKE_USERNAME,
  password: SNOWFLAKE_PASSWORD,
  database: SNOWFLAKE_DATABASE,
  warehouse: SNOWFLAKE_WAREHOUSE,
  schema: SNOWFLAKE_SCHEMA
});

export const connectToSnowflake = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    connection.connect((err: Error | undefined, conn: Connection) => {
      if (err) {
        console.error('Unable to connect to Snowflake:', err);
        reject(err);
        return;
      }
      console.log('Successfully connected to Snowflake!');
      resolve();
    });
  });
};

export const executeQuery = <T>(query: string, binds: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const callback: StatementCallback = (err, stmt, rows) => {
      if (err) {
        console.error('Failed to execute query:', err);
        reject(err);
        return;
      }
      resolve(rows as T[]);
    };

    connection.execute({
      sqlText: query,
      binds: binds,
      complete: callback
    });
  });
};

export const closeConnection = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    connection.destroy((err: Error | undefined) => {
      if (err) {
        console.error('Error destroying connection:', err);
        reject(err);
        return;
      }
      resolve();
    });
  });
};

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  try {
    await closeConnection();
    console.log('Snowflake connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error closing Snowflake connection:', error);
    process.exit(1);
  }
}); 