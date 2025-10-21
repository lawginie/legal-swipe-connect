import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  userId: string;
  sessionId: string;
  walletAddress: string;
  signature?: string;
  message?: string;
  token: string;
  loginTime: Date;
  lastActivity: Date;
  expiresAt: Date;
  deviceInfo?: {
    userAgent?: string;
    ip?: string;
    platform?: string;
  };
  isActive: boolean;
}

const SessionSchema = new Schema({
  userId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, unique: true, index: true },
  walletAddress: { type: String, required: true, index: true },
  signature: { type: String },
  message: { type: String },
  token: { type: String, required: true },
  loginTime: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  deviceInfo: {
    userAgent: { type: String },
    ip: { type: String },
    platform: { type: String }
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Indexes for performance
SessionSchema.index({ userId: 1, isActive: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
SessionSchema.index({ sessionId: 1, isActive: 1 });

export const Session = mongoose.model<ISession>('Session', SessionSchema);
