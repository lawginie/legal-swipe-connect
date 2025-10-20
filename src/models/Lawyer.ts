import mongoose, { Document, Schema } from 'mongoose';

export interface ILawyer extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  barNumber: string;
  specializations: string[];
  experience: number; // years of experience
  education: {
    lawSchool: string;
    graduationYear: number;
    degree: string;
  }[];
  certifications: string[];
  languages: string[];
  hourlyRate?: {
    min: number;
    max: number;
    currency: string;
  };
  availability: {
    days: string[]; // ['monday', 'tuesday', etc.]
    hours: {
      start: string; // '09:00'
      end: string;   // '17:00'
    };
    timezone: string;
  };
  practiceAreas: string[];
  firmName?: string;
  firmAddress?: string;
  yearsOfPractice: number;
  rating: {
    average: number;
    count: number;
  };
  isVerifiedLawyer: boolean;
  verificationDocuments: {
    barCertificate?: string;
    licenseNumber?: string;
    verificationStatus: 'pending' | 'approved' | 'rejected';
    verifiedAt?: Date;
  };
  consultationFee?: number;
  acceptsNewClients: boolean;
  responseTime: {
    average: number; // in hours
    lastUpdated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LawyerSchema = new Schema<ILawyer>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  barNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  specializations: [{
    type: String,
    required: true,
    enum: [
      'Criminal Law',
      'Civil Law',
      'Corporate Law',
      'Family Law',
      'Immigration Law',
      'Personal Injury',
      'Real Estate Law',
      'Employment Law',
      'Intellectual Property',
      'Tax Law',
      'Environmental Law',
      'Healthcare Law',
      'Bankruptcy Law',
      'Contract Law',
      'Constitutional Law',
      'International Law',
      'Maritime Law',
      'Entertainment Law',
      'Sports Law',
      'Cyber Law'
    ]
  }],
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  education: [{
    lawSchool: {
      type: String,
      required: true,
      trim: true
    },
    graduationYear: {
      type: Number,
      required: true,
      min: 1950,
      max: new Date().getFullYear()
    },
    degree: {
      type: String,
      required: true,
      trim: true
    }
  }],
  certifications: [{
    type: String,
    trim: true
  }],
  languages: [{
    type: String,
    required: true,
    trim: true
  }],
  hourlyRate: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    }
  },
  availability: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    hours: {
      start: {
        type: String,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      end: {
        type: String,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  practiceAreas: [{
    type: String,
    required: true
  }],
  firmName: {
    type: String,
    trim: true
  },
  firmAddress: {
    type: String,
    trim: true
  },
  yearsOfPractice: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  isVerifiedLawyer: {
    type: Boolean,
    default: false
  },
  verificationDocuments: {
    barCertificate: String,
    licenseNumber: String,
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    verifiedAt: Date
  },
  consultationFee: {
    type: Number,
    min: 0
  },
  acceptsNewClients: {
    type: Boolean,
    default: true
  },
  responseTime: {
    average: {
      type: Number,
      default: 24 // hours
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
LawyerSchema.index({ specializations: 1 });
LawyerSchema.index({ 'hourlyRate.min': 1, 'hourlyRate.max': 1 });
LawyerSchema.index({ 'rating.average': -1 });
LawyerSchema.index({ isVerifiedLawyer: 1 });
LawyerSchema.index({ acceptsNewClients: 1 });

export const Lawyer = mongoose.model<ILawyer>('Lawyer', LawyerSchema);