import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
  userId: string;
  fullName: string;
  email?: string;
  phone?: string;
  bio?: string;
  profileImageUrl?: string;
  location?: string;
  dateOfBirth?: Date;
  gender?: string;
  languages?: string[];
  preferredSpecializations?: string[];
  settings: {
    notifications: boolean;
    emailUpdates: boolean;
    smsUpdates: boolean;
    marketingConsent: boolean;
  };
  verificationStatus: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema({
  userId: { type: String, required: true, unique: true, index: true },
  fullName: { type: String, required: true },
  email: { type: String, sparse: true },
  phone: { type: String, sparse: true },
  bio: { type: String, maxlength: 500 },
  profileImageUrl: { type: String },
  location: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
  languages: [{ type: String }],
  preferredSpecializations: [{ type: String }],
  settings: {
    notifications: { type: Boolean, default: true },
    emailUpdates: { type: Boolean, default: true },
    smsUpdates: { type: Boolean, default: false },
    marketingConsent: { type: Boolean, default: false }
  },
  verificationStatus: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    identity: { type: Boolean, default: false }
  },
  completedAt: { type: Date }
}, {
  timestamps: true
});

UserProfileSchema.index({ userId: 1 });
UserProfileSchema.index({ email: 1 }, { sparse: true });

export const UserProfile = mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
