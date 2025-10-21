import mongoose, { Document, Schema } from 'mongoose';

export interface IMatch extends Document {
  _id: string;
  clientId: mongoose.Types.ObjectId;
  lawyerId: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId; // Optional if match is for a specific service
  status: 'active' | 'expired' | 'blocked' | 'completed' | 'cancelled';
  matchedAt: Date;
  expiresAt?: Date;
  lastActivity: Date;
  chatId?: mongoose.Types.ObjectId;
  
  // Match quality metrics
  compatibility: {
    score: number; // 0-100
    factors: {
      location: number;
      specialization: number;
      price: number;
      rating: number;
      availability: number;
    };
  };
  
  // Interaction tracking
  interactions: {
    clientViewed: boolean;
    lawyerViewed: boolean;
    clientMessaged: boolean;
    lawyerMessaged: boolean;
    consultationScheduled: boolean;
    serviceBooked: boolean;
  };
  
  // Booking information
  booking?: {
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    scheduledAt?: Date;
    duration?: number; // in minutes
    type: 'consultation' | 'service' | 'meeting';
    notes?: string;
    paymentStatus?: 'pending' | 'paid' | 'refunded';
    amount?: number;
    currency?: string;
  };
  
  // Feedback and ratings
  feedback?: {
    clientRating?: number;
    lawyerRating?: number;
    clientReview?: string;
    lawyerReview?: string;
    reviewedAt?: Date;
  };
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lawyerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service'
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'expired', 'blocked', 'completed', 'cancelled'],
    default: 'active'
  },
  matchedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Matches expire after 30 days by default
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat'
  },
  compatibility: {
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    factors: {
      location: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      specialization: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      price: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      rating: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      availability: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    }
  },
  interactions: {
    clientViewed: {
      type: Boolean,
      default: false
    },
    lawyerViewed: {
      type: Boolean,
      default: false
    },
    clientMessaged: {
      type: Boolean,
      default: false
    },
    lawyerMessaged: {
      type: Boolean,
      default: false
    },
    consultationScheduled: {
      type: Boolean,
      default: false
    },
    serviceBooked: {
      type: Boolean,
      default: false
    }
  },
  booking: {
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled']
    },
    scheduledAt: Date,
    duration: {
      type: Number,
      min: 15 // minimum 15 minutes
    },
    type: {
      type: String,
      enum: ['consultation', 'service', 'meeting']
    },
    notes: {
      type: String,
      maxlength: 1000
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded']
    },
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  feedback: {
    clientRating: {
      type: Number,
      min: 1,
      max: 5
    },
    lawyerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    clientReview: {
      type: String,
      maxlength: 1000
    },
    lawyerReview: {
      type: String,
      maxlength: 1000
    },
    reviewedAt: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
MatchSchema.index({ clientId: 1, status: 1, matchedAt: -1 });
MatchSchema.index({ lawyerId: 1, status: 1, matchedAt: -1 });
MatchSchema.index({ clientId: 1, lawyerId: 1 }, { unique: true });
MatchSchema.index({ status: 1, expiresAt: 1 });
MatchSchema.index({ 'compatibility.score': -1 });
MatchSchema.index({ lastActivity: -1 });
MatchSchema.index({ isActive: 1 });

// Compound index for service-specific matches
MatchSchema.index({ serviceId: 1, status: 1 });

export const Match = mongoose.model<IMatch>('Match', MatchSchema);