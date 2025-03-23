import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { db } from '../config/database/index.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Validate required environment variables on boot
function validateEnvironmentVariables(): void {
  if (!JWT_SECRET) {
    throw new Error(
      'Missing JWT_SECRET environment variable. ' +
      'Please check your .env file and ensure it is set.'
    );
  }
}

// Run validation immediately
validateEnvironmentVariables();

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// After validation, we can safely assert this value is defined
const validatedJWT_SECRET = JWT_SECRET as string;

// Find the interface definition for User and update it to include createdAt and lastLoginAt
interface User {
  id: string;
  email: string;
  createdAt?: string; // Make these optional to avoid TypeScript errors
  lastLoginAt?: string;
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Validate email format
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ 
      error: 'Invalid email format',
      message: 'Please enter a valid email address (e.g., user@example.com)'
    });
  }

  // Validate password length
  if (password.length < 8) {
    return res.status(400).json({ 
      error: 'Invalid password',
      message: 'Password must be at least 8 characters long'
    });
  }
  
  try {
    const result = await db.authenticateUser({ email, password });
    return res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error && error.message === 'Invalid credentials') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Invalid token format',
      message: 'Please provide a valid Bearer token'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the current token
    const decoded = jwt.verify(token, validatedJWT_SECRET) as { id: string; email: string };
    
    // Get user to ensure they still exist
    const user = await db.getUserByEmail(decoded.email);
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        message: 'User account no longer exists'
      });
    }

    // Generate new token with fresh expiry
    const newToken = jwt.sign(
      { id: user.id, email: user.email },
      validatedJWT_SECRET,
      { expiresIn: '8h' }
    );

    // Return user info and token
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt || new Date().toISOString(), // Use default values if not present
        lastLoginAt: user.lastLoginAt || new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Please log in again'
      });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Please provide a valid token'
      });
    }
    return res.status(500).json({ error: 'Token refresh failed' });
  }
}; 