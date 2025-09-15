import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      message: 'Access token required',
      code: 'TOKEN_REQUIRED'
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ 
        message: 'Server configuration error',
        code: 'CONFIG_ERROR'
      });
    }
    const decoded = jwt.verify(token, secret) as any;
    const user = await storage.getUser(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid token - user not found',
        code: 'INVALID_TOKEN'
      });
    }

    req.user = {
      id: user.id,
      email: user.email
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ 
      message: 'Invalid or expired token',
      code: 'TOKEN_INVALID'
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ 
        message: 'Server configuration error',
        code: 'CONFIG_ERROR'
      });
    }
    const decoded = jwt.verify(token, secret) as any;
      const user = await storage.getUser(decoded.userId);
      
      if (user) {
        req.user = {
          id: user.id,
          email: user.email
        };
      }
    } catch (error) {
      // Ignore token errors for optional auth
    }
  }

  next();
};
