import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    email: string;
    isAdmin: boolean;
  };
} 