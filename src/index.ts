// ⛔ Do not use .js extensions in TypeScript imports. See ARCHITECTURE.md

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import path from 'path';
import { initDb } from './config/database/db.js';
import getPort from 'get-port';
import fs from 'fs';
import { leaderboardRouter } from './routes/leaderboard.js';
import wordRouter from './routes/wordRoutes.js';
import { gameRouter } from './routes/game.js';
import morgan from 'morgan';
import http from 'http';
import validateAndExit from './utils/validateEnv.js';

// Load environment variables first - MUST happen before any other imports
const nodeEnv = process.env.NODE_ENV || 'development';
const envPath = path.resolve(process.cwd(), `.env.${nodeEnv}`);
console.log(`Loading ${nodeEnv} environment from: ${envPath}`);
config({ path: envPath });

// Fallback to default .env if needed
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.log('Fallback to default .env file');
  config();
}

// Log loaded environment variables (without sensitive values)
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  DB_PROVIDER: process.env.DB_PROVIDER,
  SUPABASE_URL: process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'
});

// Validate environment variables
validateAndExit(nodeEnv === 'production'); // Only exit on failure in production

// Production safety guards - check critical environment variables
if (process.env.NODE_ENV === 'production') {
  const missingVars = [];
  
  if (!process.env.SUPABASE_URL) missingVars.push('SUPABASE_URL');
  if (!process.env.SUPABASE_ANON_KEY) missingVars.push('SUPABASE_ANON_KEY');
  if (!process.env.JWT_SECRET) missingVars.push('JWT_SECRET');
  
  if (missingVars.length > 0) {
    console.warn(`⚠️ PRODUCTION WARNING: Missing critical environment variables: ${missingVars.join(', ')}`);
    console.warn('⚠️ Application may not function correctly in production!');
  }
  
  if (process.env.DB_PROVIDER === 'mock') {
    console.warn('⚠️ PRODUCTION WARNING: Using mock database in production environment!');
    console.warn('⚠️ This is not recommended for production use.');
  }
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api', wordRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/game', gameRouter);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.resolve(__dirname, '../client/dist');
  app.use(express.static(clientPath));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// Initialize database
const initializeDatabase = async () => {
  try {
    await initDb();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
};

async function findAvailablePort(start = 3001): Promise<number> {
  // In production, use the PORT environment variable
  if (process.env.NODE_ENV === 'production') {
    return Number(process.env.PORT) || 3001;
  }

  const tryPort = (port: number): Promise<number> =>
    new Promise((resolve) => {
      const server = http.createServer();
      server.listen(port, () => server.close(() => resolve(port)));
      server.on('error', () => resolve(tryPort(port + 1)));
    });

  return await tryPort(start);
}

// Start server with proper initialization
const startServer = async () => {
  try {
    // Initialize database first
    await initializeDatabase();
    
    const port = await findAvailablePort();

    // Write port to file for client reference (only in development)
    if (process.env.NODE_ENV !== 'production') {
      fs.writeFileSync('.api_port', port.toString());
    }
    
    // Start server
    app.listen(port, () => {
      console.log('\n✨ Server initialization complete!');
      console.log(`🚀 API server: http://localhost:${port}`);
      console.log(`🔍 Test endpoint: http://localhost:${port}/api/word`);
      
      if (process.env.NODE_ENV === 'production') {
        console.log(`📝 Running in production mode`);
      } else {
        console.log(`🌐 CORS enabled for localhost development`);
        console.log(`📝 Port written to .api_port file`);
      }
      
      console.log(`\n💡 Press Ctrl+C to stop the server\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

// Start server
startServer(); 