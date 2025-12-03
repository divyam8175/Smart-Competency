import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['candidate', 'recruiter', 'admin'],
      default: 'candidate',
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
