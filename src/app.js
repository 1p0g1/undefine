// ⛔ Do not use .js extensions in TypeScript imports. See ARCHITECTURE.md
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from 'dotenv';
import healthRouter from './routes/health.js';
// Load environment variables
config();
// Create Express app
const app = express();
// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
// Routes
app.use('/api/health', healthRouter);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
export default app;
