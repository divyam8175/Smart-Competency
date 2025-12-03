import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

export const generateToken = (user: IUser): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    secret,
    { expiresIn: '7d' }
  );
};
