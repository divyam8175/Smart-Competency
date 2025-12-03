import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { UserRole } from '../models/User';

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if(authHeader){
      console.log("authHeader to aa rha hai");
    }

    if (!authHeader) {
      res.status(401).json({ message: 'Not authorized'}); 
      return;
    }

  const token = authHeader.split(' ')[1]?.trim();
  console.log(token);

if (!token) {
  res.status(401).json({ message: 'Not authorized' });
  return;
}

    const secretEnv = process.env.JWT_SECRET;

    if (!secretEnv) {
      throw new Error('JWT secret not configured');
    }

    const secret: Secret = secretEnv;
    const decoded = jwt.verify(token, secret) as JwtPayload | string;

    //////////////////////
    
    if(decoded){
      console.log("decode is correct");
    }


    ////////////////////

    if (!decoded || typeof decoded === 'string' || !('id' in decoded) || !('role' in decoded)) {
      res.status(401).json({ message: 'Invalid token payload' });
      return;
    }

    req.user = { id: decoded.id as string, role: decoded.role as UserRole };

    next();

  } catch (error) {
    console.error('Auth error', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    console.log(req);
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    next();
  };
};
