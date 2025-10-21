import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'client' | 'lawyer' | 'base';
  profilePicture?: string;
  bio?: string;
  location?: {
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  isVerified: boolean;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  lastLoginAt?: Date;
  walletAddress?: string; // Base wallet address
  preferences?: {
    maxDistance: number;
    ageRange: {
      min: number;
      max: number;
    };
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  userType: {
    type: String,
    required: true,
    enum: ['client', 'lawyer', 'base']
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500
  },
  location: {
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  lastLoginAt: {
    type: Date
  },
  preferences: {
    maxDistance: {
      type: Number,
      default: 50 // kilometers
    },
    ageRange: {
      min: { type: Number, default: 18 },
      max: { type: Number, default: 65 }
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  walletAddress: {
    type: String,
    sparse: true // Allows multiple null values
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Index for geospatial queries
UserSchema.index({ 'location.coordinates': '2dsphere' });

// Index for user type and location queries
UserSchema.index({ userType: 1, 'location.city': 1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);