import mongoose, { Schema, Document } from 'mongoose';

export interface ILawyerService {
  id: string;
  name: string;
  description: string;
  priceRange: {
    min: number;
    max: number;
  };
  duration: string;
  category: string;
}

export interface ILawyer extends Document {
  profileId: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  specialization: string;
  experience: string;
  rating: number;
  image: string;
  verified: boolean;
  languages: string[];
  availability: string;
  consultationFee: number;
  walletAddress?: string;
  services: ILawyerService[];
  createdAt: Date;
  updatedAt: Date;
  isSystemProfile: boolean;
}

const LawyerServiceSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  priceRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  duration: { type: String, required: true },
  category: { type: String, required: true }
});

const LawyerSchema = new Schema({
  profileId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  location: { type: String, required: true },
  bio: { type: String, required: true },
  specialization: { type: String, required: true, index: true },
  experience: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  image: { type: String, required: true },
  verified: { type: Boolean, default: false },
  languages: [{ type: String }],
  availability: { type: String, required: true },
  consultationFee: { type: Number, required: true },
  walletAddress: { type: String },
  services: [LawyerServiceSchema],
  isSystemProfile: { type: Boolean, default: false },
}, { 
  timestamps: true 
});

// Indexes for better query performance
LawyerSchema.index({ specialization: 1, rating: -1 });
LawyerSchema.index({ location: 1 });
LawyerSchema.index({ isSystemProfile: 1 });

export const Lawyer = mongoose.model<ILawyer>('Lawyer', LawyerSchema);
