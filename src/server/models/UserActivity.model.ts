import mongoose, { Schema, Document } from 'mongoose';

export interface IUserActivity extends Document {
  userId: string;
  activityType: 'swipe' | 'match' | 'chat' | 'payment' | 'profile_view' | 'service_view' | 'login' | 'logout';
  targetId?: string; // lawyer ID, match ID, etc.
  metadata?: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
}

const UserActivitySchema = new Schema({
  userId: { type: String, required: true, index: true },
  activityType: { 
    type: String, 
    required: true,
    enum: ['swipe', 'match', 'chat', 'payment', 'profile_view', 'service_view', 'login', 'logout'],
    index: true
  },
  targetId: { type: String },
  metadata: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now, index: true },
  sessionId: { type: String }
}, {
  timestamps: false
});

// Compound indexes for common queries
UserActivitySchema.index({ userId: 1, activityType: 1, timestamp: -1 });
UserActivitySchema.index({ userId: 1, timestamp: -1 });
UserActivitySchema.index({ timestamp: -1 }); // For cleanup/analytics

export const UserActivity = mongoose.model<IUserActivity>('UserActivity', UserActivitySchema);
