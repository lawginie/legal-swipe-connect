import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  email?: string;
  fullName: string;
  userType: 'client' | 'lawyer' | 'base';
  walletAddress?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
}

const UserSchema = new Schema({
  userId: { type: String, required: true, unique: true, index: true },
  email: { type: String, sparse: true },
  fullName: { type: String, required: true },
  userType: { type: String, enum: ['client', 'lawyer', 'base'], required: true },
  walletAddress: { type: String, sparse: true, index: true },
  profileImageUrl: { type: String },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true
});

UserSchema.index({ walletAddress: 1 });
UserSchema.index({ userType: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
