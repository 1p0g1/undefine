import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define and export the AuthRequest interface
export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email?: string;
  };
}

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // For development, allow all requests
    if (process.env.NODE_ENV === 'development') {
      req.user = {
        id: 'dev-user',
        username: 'developer'
      };
      return next();
    }

    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key') as {
      id: string;
      username: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}; 