import mongoose, { Document, Schema } from 'mongoose';

export interface ISwipe extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId; // Can be lawyer or service
  targetType: 'lawyer' | 'service';
  action: 'like' | 'dislike' | 'super_like' | 'pass';
  timestamp: Date;
  metadata?: {
    swipeSpeed?: number; // milliseconds
    viewDuration?: number; // milliseconds spent viewing before swipe
    deviceInfo?: {
      platform: string;
      userAgent: string;
    };
    location?: {
      lat: number;
      lng: number;
    };
  };
  isActive: boolean; // For soft deletes
  createdAt: Date;
  updatedAt: Date;
}

const SwipeSchema = new Schema<ISwipe>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  targetType: {
    type: String,
    required: true,
    enum: ['lawyer', 'service']
  },
  action: {
    type: String,
    required: true,
    enum: ['like', 'dislike', 'super_like', 'pass']
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  metadata: {
    swipeSpeed: {
      type: Number,
      min: 0
    },
    viewDuration: {
      type: Number,
      min: 0
    },
    deviceInfo: {
      platform: String,
      userAgent: String
    },
    location: {
      lat: {
        type: Number,
        min: -90,
        max: 90
      },
      lng: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
SwipeSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });
SwipeSchema.index({ userId: 1, action: 1, timestamp: -1 });
SwipeSchema.index({ targetId: 1, targetType: 1, action: 1 });
SwipeSchema.index({ timestamp: -1 });
SwipeSchema.index({ isActive: 1 });

// Index for geospatial queries if location is provided
SwipeSchema.index({ 'metadata.location': '2dsphere' });

export const Swipe = mongoose.model<ISwipe>('Swipe', SwipeSchema);