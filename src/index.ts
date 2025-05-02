// ⛔ Do not use .js extensions in TypeScript imports. See ARCHITECTURE.md

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './config/database/db.js';
import fs from 'fs';
import { leaderboardRouter } from './routes/leaderboard.js';
import wordRouter from './routes/wordRoutes.js';
import { gameRouter } from './routes/game.js';
import morgan from 'morgan';
import http from 'http';
import validateAndExit from './utils/validateEnv.js';
import compression from 'compression';
import helmet from 'helmet';

// Create ESM compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use(compression());
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.supabase.co"]
    }
  }
}));
app.use(morgan('dev'));
app.use(express.json());

// Cache control middleware
const setCustomCacheControl = (res: express.Response, path: string) => {
  // HTML files should not be cached
  if (path.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return;
  }
  
  // Assets with content hash in filename can be cached indefinitely
  if (path.match(/\.[0-9a-f]{8}\.(js|css|png|jpg|jpeg|gif|webp|svg|woff2?)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return;
  }
  
  // Default cache control for other assets
  res.setHeader('Cache-Control', 'public, max-age=3600');
};

// API Routes - must come before static file serving
app.use('/api', wordRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/game', gameRouter);

// Health check endpoint for Render
app.get('/health', (req, res) => {
  // Return basic health information
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    node_version: process.version,
    uptime: process.uptime(),
    db_provider: process.env.DB_PROVIDER,
    supabase_configured: !!process.env.SUPABASE_URL
  });
});

// Serve static files with custom cache control
app.use(express.static(path.join(__dirname, '../client/dist'), {
  setHeaders: setCustomCacheControl
}));

// Handle client-side routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve index.html for all other routes to support client-side routing
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

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

// Dynamic port allocation
const startServer = async () => {
  try {
    // Initialize database first
    await initializeDatabase();
    
    const port = parseInt(process.env.PORT || '3001', 10);

    // Write port to file for client reference (only in development)
    if (process.env.NODE_ENV !== 'production') {
      fs.writeFileSync('.api_port', port.toString());
    }
    
    // Start server
    const server = app.listen(port, '0.0.0.0', () => {
      console.log('\n✨ Server initialization complete!');
      console.log(`🚀 Server: Listening on port ${port}`);
      console.log(`🔍 API endpoint: http://localhost:${port}/api/word`);
      console.log(`🌐 Frontend: http://localhost:${port}/`);
      
      if (process.env.NODE_ENV === 'production') {
        console.log(`📝 Running in production mode`);
        console.log(`🔑 Environment check: Supabase URL ${process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing'}`);
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

// Export all types from core
export * from './types/core';

// Export game utilities and types
export * from './utils/game';

// Export word utilities and types
export * from './utils/word'; 