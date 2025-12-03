import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { UserRole } from '../models/User';

const formatError = (reason: string) => ({ message: 'Not authorized', reason });

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.warn('[auth] Missing Authorization header');
      res.status(401).json(formatError('missing_header'));
      return;
    }

    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match || !match[1]) {
      console.warn('[auth] Malformed Authorization header', authHeader);
      res.status(401).json(formatError('bad_format'));
      return;
    }

    const token = match[1].trim();
    if (!token) {
      console.warn('[auth] Bearer token empty');
      res.status(401).json(formatError('empty_token'));
      return;
    }

    const secretEnv = process.env.JWT_SECRET;
    if (!secretEnv) {
      throw new Error('JWT secret not configured');
    }

    const secret: Secret = secretEnv;
    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded?.id || !decoded?.role) {
      console.warn('[auth] Token payload missing id/role');
      res.status(401).json(formatError('invalid_payload'));
      return;
    }

    req.user = { id: String(decoded.id), role: decoded.role as UserRole };

    next();
  } catch (error) {
    console.error('[auth] Verification failed', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      console.warn('[auth] requireRoles invoked without authenticated user');
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      console.warn('[auth] Role blocked', { required: allowedRoles, actual: req.user.role });
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    next();
  };
};
