import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

// For initial setup only - DO NOT use in production
export const generatePasswordHash = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    // In a real app, you'd query this from a database
    if (email === ADMIN_EMAIL) {
      // If ADMIN_PASSWORD_HASH is not set, it means we're in development mode
      // and using a default password for testing purposes
      let isPasswordValid = false;
      
      if (ADMIN_PASSWORD_HASH) {
        // Production mode - use hashed password
        isPasswordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
      } else {
        // Development mode - use default password 'admin'
        isPasswordValid = password === 'admin';
        console.warn('WARNING: Using default admin credentials. Set ADMIN_PASSWORD_HASH in production.');
      }
      
      if (isPasswordValid) {
        // Generate JWT token
        const token = jwt.sign(
          { id: '1', email, isAdmin: true },
          JWT_SECRET,
          { expiresIn: '8h' }
        );
        
        return res.json({ 
          token,
          user: { email, isAdmin: true }
        });
      }
    }
    
    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}; 