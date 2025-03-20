import snowflake, { Connection, StatementCallback } from 'snowflake-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configuration interface
export interface SnowflakeConfig {
  account: string;
  username: string;
  password: string;
  database: string;
  warehouse: string;
  schema: string;
  connectionTimeout: number;
  statementTimeout: number;
  maxRetries: number;
  poolSize: number;
  maxConnectionAge: number; // Maximum age of a connection in milliseconds
  maxConcurrentQueries?: number;
  minQueryInterval?: number;
}

// Error codes enum
export enum SnowflakeErrorCode {
  CONNECTION_TIMEOUT = '1001',
  STATEMENT_TIMEOUT = '1002',
  CONNECTION_ERROR = '1003',
  QUERY_ERROR = '1004',
  AUTHENTICATION_ERROR = '1005'
}

// Query metrics interface
export interface QueryMetrics {
  queryId: string;
  executionTime: number;
  rowCount: number;
  timestamp: Date;
  success: boolean;
  error?: Error;
}

// Utility functions
const validateConfig = (config: SnowflakeConfig): void => {
  const requiredFields = ['account', 'username', 'password', 'database', 'warehouse'];
  for (const field of requiredFields) {
    if (!config[field as keyof SnowflakeConfig]) {
      throw new Error(`Missing required configuration: ${field}`);
    }
  }
};

const sanitizeSQL = (sql: string): string => {
  // Basic SQL injection prevention
  const dangerousPatterns = [
    /--/g,  // SQL comments
    /;.*$/gm,  // Multiple statements
    /\/\*[\s\S]*?\*\//g,  // Block comments
  ];
  
  let sanitized = sql;
  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }
  
  return sanitized.trim();
};

const handleSnowflakeError = (error: any, operation: string): never => {
  console.error(`Error during ${operation}:`, error);
  throw new Error(`Failed to ${operation} in database`);
};

// Connection pool implementation
class ConnectionPool {
  private connections: Array<{ connection: Connection; createdAt: number }> = [];
  private inUse: Set<Connection> = new Set();
  private config: SnowflakeConfig;

  constructor(config: SnowflakeConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    for (let i = 0; i < this.config.poolSize; i++) {
      const connection = await this.createConnection();
      this.connections.push({ connection, createdAt: Date.now() });
    }
  }

  private async createConnection(): Promise<Connection> {
    return new Promise((resolve, reject) => {
      const connection = snowflake.createConnection({
        account: this.config.account,
        username: this.config.username,
        password: this.config.password,
        database: this.config.database,
        warehouse: this.config.warehouse,
        schema: this.config.schema
      });

      connection.connect((err: Error | undefined) => {
        if (err) {
          reject(err);
        } else {
          resolve(connection);
        }
      });
    });
  }

  async acquire(): Promise<Connection> {
    const now = Date.now();
    const availableConnection = this.connections.find(({ connection, createdAt }) => 
      !this.inUse.has(connection) && 
      (now - createdAt) < this.config.maxConnectionAge
    );

    if (availableConnection) {
      this.inUse.add(availableConnection.connection);
      return availableConnection.connection;
    }

    // Create new connection if all existing ones are too old or in use
    const newConnection = await this.createConnection();
    this.connections.push({ connection: newConnection, createdAt: now });
    this.inUse.add(newConnection);
    return newConnection;
  }

  release(connection: Connection): void {
    this.inUse.delete(connection);
  }

  async closeAll(): Promise<void> {
    for (const { connection } of this.connections) {
      await new Promise<void>((resolve) => {
        connection.destroy((err) => {
          if (err) {
            console.error('Error closing connection:', err);
          }
          resolve();
        });
      });
    }
    this.connections = [];
    this.inUse.clear();
  }
}

// Rate limiter implementation
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private maxConcurrentQueries: number;
  private lastQueryTime: number = 0;
  private minQueryInterval: number = 100; // Minimum time between queries in ms

  constructor(maxConcurrentQueries: number, minQueryInterval: number) {
    this.maxConcurrentQueries = maxConcurrentQueries;
    this.minQueryInterval = minQueryInterval;
  }

  async enqueue<T>(query: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const now = Date.now();
          const timeSinceLastQuery = now - this.lastQueryTime;
          if (timeSinceLastQuery < this.minQueryInterval) {
            await new Promise(resolve => setTimeout(resolve, this.minQueryInterval - timeSinceLastQuery));
          }
          const result = await query();
          this.lastQueryTime = Date.now();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const batch = this.queue.splice(0, this.maxConcurrentQueries);
    await Promise.all(batch.map(query => query()));
    this.processing = false;

    if (this.queue.length > 0) {
      await this.processQueue();
    }
  }
}

// Connection manager implementation
class SnowflakeConnectionManager {
  public pool: ConnectionPool;
  private rateLimiter: RateLimiter;
  private healthCheckInterval: NodeJS.Timeout;
  private config: SnowflakeConfig;

  constructor(config: SnowflakeConfig) {
    validateConfig(config);
    this.config = config;
    this.pool = new ConnectionPool(config);
    this.rateLimiter = new RateLimiter(config.maxConcurrentQueries || 5, config.minQueryInterval || 100);
    this.healthCheckInterval = setInterval(this.checkConnections.bind(this), 30000);
  }

  async initialize(): Promise<void> {
    await this.pool.initialize();
  }

  private async checkConnections(): Promise<void> {
    for (const { connection, createdAt } of this.pool['connections']) {
      try {
        if (Date.now() - createdAt >= this.config.maxConnectionAge) {
          await this.replaceConnection(connection);
        } else {
          await this.executeQuery('SELECT 1', [], connection);
        }
      } catch (error) {
        console.error('Unhealthy connection detected:', error);
        await this.replaceConnection(connection);
      }
    }
  }

  private async replaceConnection(oldConnection: Connection): Promise<void> {
    const newConnection = await this.pool['createConnection']();
    const index = this.pool['connections'].findIndex(({ connection }) => connection === oldConnection);
    if (index !== -1) {
      this.pool['connections'][index] = { connection: newConnection, createdAt: Date.now() };
    }
    await new Promise<void>((resolve) => {
      oldConnection.destroy((err) => {
        if (err) {
          console.error('Error destroying old connection:', err);
        }
        resolve();
      });
    });
  }

  async executeQuery<T>(sql: string, params: any[] = [], connection: Connection): Promise<T[]> {
    const query = async (): Promise<T[]> => {
      const startTime = Date.now();
      const sanitizedSQL = sanitizeSQL(sql);

      try {
        const result = await new Promise<T[]>((resolve, reject) => {
          const callback: StatementCallback = (err, stmt, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows || []);
            }
          };

          connection.execute({
            sqlText: sanitizedSQL,
            binds: params,
            complete: callback
          });
        });

        // Log metrics
        this.logQueryMetrics({
          queryId: sanitizedSQL.substring(0, 50),
          executionTime: Date.now() - startTime,
          rowCount: result.length,
          timestamp: new Date(),
          success: true
        });

        return result;
      } catch (error) {
        // Log metrics with error
        this.logQueryMetrics({
          queryId: sanitizedSQL.substring(0, 50),
          executionTime: Date.now() - startTime,
          rowCount: 0,
          timestamp: new Date(),
          success: false,
          error: error as Error
        });
        handleSnowflakeError(error, 'execute query');
        return []; // Return empty array in case of error
      } finally {
        this.pool.release(connection);
      }
    };

    return this.rateLimiter.enqueue(query);
  }

  private logQueryMetrics(metrics: QueryMetrics): void {
    console.log('Query Metrics:', {
      ...metrics,
      timestamp: metrics.timestamp.toISOString()
    });
    // Here you could send metrics to a monitoring system
  }

  async cleanup(): Promise<void> {
    clearInterval(this.healthCheckInterval);
    await this.pool.closeAll();
  }

  async getConnection(): Promise<Connection> {
    return this.pool.acquire();
  }

  async releaseConnection(connection: Connection): Promise<void> {
    await this.pool.release(connection);
  }
}

// Load configuration from environment variables
const config: SnowflakeConfig = {
  account: process.env.SNOWFLAKE_ACCOUNT || '',
  username: process.env.SNOWFLAKE_USERNAME || '',
  password: process.env.SNOWFLAKE_PASSWORD || '',
  database: process.env.SNOWFLAKE_DATABASE || '',
  warehouse: process.env.SNOWFLAKE_WAREHOUSE || '',
  schema: process.env.SNOWFLAKE_SCHEMA || 'PUBLIC',
  connectionTimeout: 60000, // 1 minute
  statementTimeout: 30000, // 30 seconds
  maxRetries: 3,
  poolSize: 5,
  maxConnectionAge: 3600000 // 1 hour
};

// Create and export the connection manager instance
const connectionManager = new SnowflakeConnectionManager(config);

// Initialize the connection manager
connectionManager.initialize().catch(error => {
  console.error('Failed to initialize Snowflake connection manager:', error);
  process.exit(1);
});

// Export the executeQuery function for use in other files
export const executeQuery = async <T>(sql: string, params: any[] = []): Promise<T[]> => {
  const connection = await connectionManager.pool.acquire();
  return connectionManager.executeQuery<T>(sql, params, connection);
};

// Export the connection manager for cleanup on application shutdown
export { connectionManager };

// Export connectToSnowflake for backward compatibility
export const connectToSnowflake = async (): Promise<void> => {
  await connectionManager.initialize();
};

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  try {
    await connectionManager.cleanup();
    console.log('Snowflake connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error closing Snowflake connection:', error);
    process.exit(1);
  }
}); 