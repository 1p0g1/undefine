import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { connectionManager } from '../config/snowflake.js';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

interface User {
  id: string;
  email: string;
}

export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // During development, we'll allow requests without authentication 
    // to simplify testing and avoid database issues
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] Development mode: bypassing authentication');
      req.user = { 
        id: 'dev-user-id', 
        email: 'dev@example.com' 
      };
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string };

    // Verify user exists in Snowflake
    try {
      const conn = await connectionManager.getConnection();
      const users = await connectionManager.executeQuery<User>(
        'SELECT id, email FROM users WHERE id = ? AND email = ?',
        [decoded.id, decoded.email],
        conn
      );

      if (!users.length) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      req.user = {
        id: decoded.id,
        email: decoded.email
      };
    } catch (dbError) {
      console.error('[Auth] Database error during authentication:', dbError);
      // In production, we would fail, but for development we can proceed
      if (process.env.NODE_ENV !== 'development') {
        return res.status(500).json({ error: 'Authentication service unavailable' });
      }
      
      // For development, continue with the decoded user from token
      console.warn('[Auth] Proceeding with token data without database verification');
      req.user = {
        id: decoded.id,
        email: decoded.email
      };
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}; 