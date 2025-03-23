declare module 'snowflake-sdk' {
  export interface StatementOptions {
    sqlText: string;
    binds?: any[];
    requestId?: string;
    complete?: (err: SnowflakeError | undefined, stmt: Statement, rows: any[] | undefined) => void;
    streamResult?: boolean;
    fetchAsString?: string[];
  }

  export interface Statement {
    getSqlText(): string;
    getColumns(): Column[];
    getNumRows(): number;
    getSessionState(): any;
    getStatementId(): string;
    getRequestId(): string;
    getRows(): any[];
  }

  export interface Column {
    name: string;
    type: string;
    nullable: boolean;
    precision: number;
    scale: number;
    length: number;
  }

  export interface SnowflakeError extends Error {
    cause?: Error;
    code?: string;
    sqlState?: string;
    data?: any;
  }

  export interface RowStatement extends Statement {}

  export interface ConnectionOptions {
    account: string;
    username: string;
    password: string;
    database?: string;
    schema?: string;
    warehouse?: string;
    role?: string;
    clientSessionKeepAlive?: boolean;
    clientSessionKeepAliveHeartbeatFrequency?: number;
    jsTreatIntegerAsBigInt?: boolean;
    application?: string;
    authenticator?: string;
    insecureConnect?: boolean;
    keepAlive?: boolean;
    logLevel?: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';
    region?: string;
    token?: string;
    validateDefaultParameters?: boolean;
  }

  export interface Connection {
    execute(options: StatementOptions): Statement;
    connect(callback: (err: SnowflakeError | undefined, conn: Connection) => void): void;
    destroy(callback?: (err: SnowflakeError | undefined, conn: Connection) => void): void;
    isUp(): boolean;
    isExecuting?: boolean;
  }

  export function createConnection(options: ConnectionOptions): Connection;
} 