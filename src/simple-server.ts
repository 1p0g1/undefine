// ⛔ Do not use .js extensions in TypeScript imports. See ARCHITECTURE.md

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import wordRoutes from './routes/wordRoutes.js';
import { getDb } from './config/database/db.js';

// Load environment variables
dotenv.config();

// Create the Express app
const app = express();
const port = process.env.PORT || 3001;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', wordRoutes);

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, '../../client/build')));

// Serve index.html for all other routes (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('Connecting to Supabase...');
    await getDb().connect();
    
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`Test the API: http://localhost:${port}/api/test`);
      console.log(`Get a word: http://localhost:${port}/api/word`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer(); 