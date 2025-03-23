import { Connection, createConnection, RowStatement as Statement, SnowflakeError as SDKSnowflakeError } from 'snowflake-sdk';
import { config as dotenvConfig } from 'dotenv';
import * as prometheus from 'prom-client';
import { v4 as uuidv4 } from 'uuid';

// Custom property to track if a connection is being used
declare module 'snowflake-sdk' {
  interface Connection {
    isExecuting?: boolean;
  }
}

dotenvConfig();

// Prometheus metrics
const queryDuration = new prometheus.Histogram({
  name: 'snowflake_query_duration_seconds',
  help: 'Duration of Snowflake queries in seconds',
  labelNames: ['query_type', 'status', 'query_source'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const slowQueries = new prometheus.Counter({
  name: 'snowflake_slow_queries_total',
  help: 'Total number of slow Snowflake queries (>300ms)',
  labelNames: ['query_type', 'query_source']
});

const activeConnections = new prometheus.Gauge({
  name: 'snowflake_active_connections',
  help: 'Number of active Snowflake connections'
});

const poolUtilization = new prometheus.Gauge({
  name: 'snowflake_pool_utilisation',
  help: 'Snowflake connection pool utilization (0-1)',
  labelNames: ['status']
});

const queryErrors = new prometheus.Counter({
  name: 'snowflake_query_errors_total',
  help: 'Total number of Snowflake query errors',
  labelNames: ['error_type', 'query_source']
});

const connectionErrors = new prometheus.Counter({
  name: 'snowflake_connection_errors_total',
  help: 'Total number of Snowflake connection errors',
  labelNames: ['error_type']
});

// Configuration interface
export interface SnowflakeConfig {
  account: string;
  username: string;
  password: string;
  database: string;
  warehouse: string;
  schema: string;
  role?: string;
  connectionTimeout: number;
  maxRetries: number;
  poolSize: number;
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
  const requiredFields = ['account', 'username', 'password', 'database', 'warehouse'] as const;
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required Snowflake configuration: ${field}`);
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

export interface SnowflakeError extends Error {
  code?: string;
  statusCode?: number;
  sqlState?: string;
  sqlMessage?: string;
}

export type QueryParam = string | number | boolean | null;
export type QueryParams = QueryParam | { [key: string]: QueryParam };

const handleSnowflakeError = (error: SnowflakeError, operation: string): never => {
  console.error(`Snowflake error during ${operation}:`, {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    sqlState: error.sqlState,
    sqlMessage: error.sqlMessage
  });
  throw error;
};

interface StatementOptions {
  sqlText: string;
  binds?: any[];
  complete: (err: SDKSnowflakeError | undefined, stmt: Statement, rows: any[] | undefined) => void;
}

export class ConnectionManager {
  private pool: Connection[] = [];
  private readonly maxConnections: number;
  private readonly connectionTimeout: number;
  private readonly config: SnowflakeConfig;
  private readonly queryTimeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private lastHealthCheck: number = 0;
  private readonly healthCheckInterval: number = 30000; // 30 seconds

  constructor() {
    const poolSize = process.env.SNOWFLAKE_POOL_SIZE;
    const connectionTimeout = process.env.SNOWFLAKE_CONNECTION_TIMEOUT;
    const queryTimeout = process.env.SNOWFLAKE_QUERY_TIMEOUT || '30000';
    const maxRetries = process.env.SNOWFLAKE_MAX_RETRIES || '3';
    const retryDelay = process.env.SNOWFLAKE_RETRY_DELAY || '1000';

    if (!poolSize) {
      throw new Error('Missing SNOWFLAKE_POOL_SIZE environment variable. Please check your .env file.');
    }

    if (!connectionTimeout) {
      throw new Error('Missing SNOWFLAKE_CONNECTION_TIMEOUT environment variable. Please check your .env file.');
    }

    this.maxConnections = Number(poolSize);
    this.connectionTimeout = Number(connectionTimeout);
    this.queryTimeout = Number(queryTimeout);
    this.maxRetries = Number(maxRetries);
    this.retryDelay = Number(retryDelay);
    
    const account = process.env.SNOWFLAKE_ACCOUNT;
    const username = process.env.SNOWFLAKE_USERNAME;
    const password = process.env.SNOWFLAKE_PASSWORD;
    const database = process.env.SNOWFLAKE_DATABASE;
    const warehouse = process.env.SNOWFLAKE_WAREHOUSE;
    const schema = process.env.SNOWFLAKE_SCHEMA;
    const role = process.env.SNOWFLAKE_ROLE;

    if (!account || !username || !password || !database || !warehouse) {
      throw new Error('Missing required Snowflake environment variables. Please check your .env file.');
    }

    this.config = {
      account,
      username,
      password,
      database,
      warehouse,
      schema: schema || 'PUBLIC',
      role,
      connectionTimeout: this.connectionTimeout,
      maxRetries: this.maxRetries,
      poolSize: this.maxConnections
    };

    this.validateConfig();
    this.initializePool();

    // Add health check interval
    this.healthCheckInterval = Number(process.env.SNOWFLAKE_HEALTH_CHECK_INTERVAL || '30000');
    
    // Start periodic health checks
    setInterval(() => this.checkPoolHealth(), this.healthCheckInterval);
  }

  private validateConfig(): void {
    const requiredFields = ['account', 'username', 'password', 'database', 'warehouse'] as const;
    for (const field of requiredFields) {
      if (!this.config[field]) {
        throw new Error(`Missing required Snowflake configuration: ${field}`);
      }
    }
  }

  private sanitizeSQL(sql: string): string {
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
  }

  private async initializePool(): Promise<void> {
    try {
      // Test connection with a simple query
      const connection = await this.getConnection();
      await this.executeQuery('SELECT CURRENT_TIMESTAMP()', [], connection);
      console.log('Snowflake connection pool initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Snowflake connection pool:', error);
      throw error;
    }
  }

  private async checkPoolHealth(): Promise<void> {
    const now = Date.now();
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return;
    }
    this.lastHealthCheck = now;

    for (const connection of this.pool) {
      try {
        await this.executeQuery('SELECT 1', [], connection);
      } catch (error) {
        console.warn('Unhealthy connection detected, removing from pool');
        await this.releaseConnection(connection);
      }
    }
  }

  private updatePoolMetrics(): void {
    const utilization = this.pool.length / this.maxConnections;
    poolUtilization.set({ status: 'active' }, utilization);
    poolUtilization.set({ status: 'available' }, 1 - utilization);
  }

  async getConnection(): Promise<Connection> {
    console.log('[ConnectionManager.getConnection] Attempting to get connection');
    try {
      // First, try to find an available connection in the pool
      const availableConnection = this.pool.find(conn => !conn.isExecuting);
      if (availableConnection) {
        console.log('[ConnectionManager.getConnection] Found available connection in pool');
        return availableConnection;
      }

      // If pool is not full, create a new connection
      if (this.pool.length < this.maxConnections) {
        console.log('[ConnectionManager.getConnection] Creating new connection, current pool size:', this.pool.length);
        const connection = createConnection(this.config);
        
        return new Promise((resolve, reject) => {
          connection.connect((err, conn) => {
            if (err) {
              console.error('[ConnectionManager.getConnection] Connection error:', {
                error: err.message,
                code: err.code,
                sqlState: err.sqlState,
                stack: err.stack
              });
              connectionErrors.inc({ error_type: err.code || 'unknown' });
              reject(err);
              return;
            }
            
            console.log('[ConnectionManager.getConnection] Successfully created new connection');
            this.pool.push(conn);
            this.updatePoolMetrics();
            resolve(conn);
          });
        });
      }

      console.log('[ConnectionManager.getConnection] Pool is full, waiting for available connection');
      // If pool is full, wait for a connection to become available
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error('[ConnectionManager.getConnection] Connection timeout after', this.connectionTimeout, 'ms');
          connectionErrors.inc({ error_type: 'timeout' });
          reject(new Error('Connection timeout'));
        }, this.connectionTimeout);

        const checkConnection = () => {
          const conn = this.pool.find(c => !c.isExecuting);
          if (conn) {
            clearTimeout(timeout);
            console.log('[ConnectionManager.getConnection] Found available connection after waiting');
            resolve(conn);
          } else {
            setTimeout(checkConnection, 100);
          }
        };

        checkConnection();
      });
    } catch (error) {
      console.error('[ConnectionManager.getConnection] Error details:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async releaseConnection(connection: Connection): Promise<void> {
    const index = this.pool.indexOf(connection);
    if (index !== -1) {
      await new Promise<void>((resolve) => {
        connection.destroy((err?: Error) => {
          if (err) {
            console.error('Error destroying connection:', err);
            connectionErrors.inc({ error_type: 'destroy_error' });
          }
          this.pool.splice(index, 1);
          activeConnections.dec();
          this.updatePoolMetrics();
          resolve();
        });
      });
    }
  }

  async executeQuery<T = Record<string, any>>(
    sql: string,
    params: QueryParams[] = [],
    connection?: Connection
  ): Promise<T[]> {
    const sanitizedSQL = this.sanitizeSQL(sql);
    const start = Date.now();
    const queryId = uuidv4();
    let ownConnection = false;
    let conn: Connection | undefined = connection;

    // Metrics to track
    const metrics: QueryMetrics = {
      queryId,
      executionTime: 0,
      rowCount: 0,
      timestamp: new Date(),
      success: false
    };

    try {
      if (!conn) {
        conn = await this.getConnection();
        ownConnection = true;
      }

      const result = await new Promise<T[]>((resolve, reject) => {
        const options: StatementOptions = {
          sqlText: sanitizedSQL,
          binds: params as any[],
          complete: (err, stmt, rows) => {
            if (err) {
              console.error('Query execution error:', {
                sql: sanitizedSQL.substring(0, 100) + (sanitizedSQL.length > 100 ? '...' : ''),
                error: err.message,
                code: err.code,
                sqlState: err.sqlState
              });
              
              // Track errors in Prometheus
              queryErrors.inc({
                error_type: err.code || 'unknown',
                query_source: sanitizedSQL.substring(0, 20)
              });
              
              reject(err);
              return;
            }

            if (!rows) {
              resolve([]);
              return;
            }

            // Type check and transform results
            const typedRows = rows as T[];
            metrics.rowCount = rows.length;
            
            resolve(typedRows);
          }
        };
        
        conn!.execute(options);
      });

      // Track successful query
      metrics.success = true;
      return result;
    } catch (error) {
      throw error;
    } finally {
      const end = Date.now();
      metrics.executionTime = end - start;
      
      // Track metrics
      this.logQueryMetrics(metrics);
      
      // Log slow queries
      if (metrics.executionTime > 300) {
        console.warn(`Slow query detected (${metrics.executionTime}ms): ${sanitizedSQL.substring(0, 100)}...`);
        slowQueries.inc({
          query_type: sanitizedSQL.includes('SELECT') ? 'select' : 'other',
          query_source: sanitizedSQL.substring(0, 20)
        });
      }
      
      // Release connection if we acquired it
      if (ownConnection && conn) {
        await this.releaseConnection(conn);
      }
    }
  }

  async executeBatch<T>(sql: string, params: QueryParams[][]): Promise<T[][]> {
    const connection = await this.getConnection();
    try {
      const results: T[][] = [];
      for (const batchParams of params) {
        const result = await this.executeQuery<T>(sql, batchParams, connection);
        results.push(result);
      }
      return results;
    } finally {
      await this.releaseConnection(connection);
    }
  }

  async executeTransaction<T>(operations: (connection: Connection) => Promise<T>): Promise<T> {
    const connection = await this.getConnection();
    try {
      await this.executeQuery('BEGIN', [], connection);
      const result = await operations(connection);
      await this.executeQuery('COMMIT', [], connection);
      return result;
    } catch (error) {
      await this.executeQuery('ROLLBACK', [], connection);
      throw error;
    } finally {
      await this.releaseConnection(connection);
    }
  }

  private logQueryMetrics(metrics: QueryMetrics): void {
    console.log('[Snowflake Query Metrics]', {
      ...metrics,
      timestamp: metrics.timestamp.toISOString()
    });
  }

  async cleanup(): Promise<void> {
    await Promise.all(
      this.pool.map(connection => this.releaseConnection(connection))
    );
    this.pool = [];
  }
}

// Create and export a single instance
export const connectionManager = new ConnectionManager();

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  try {
    await connectionManager.cleanup();
    console.log('Snowflake connections closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error closing Snowflake connections:', error);
    process.exit(1);
  }
}); 