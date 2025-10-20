import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  _id: string;
  lawyerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  price: {
    type: 'fixed' | 'hourly' | 'consultation' | 'retainer';
    amount: number;
    currency: string;
    billingCycle?: 'one-time' | 'monthly' | 'quarterly' | 'annually';
  };
  duration: {
    estimated: number; // in hours
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  deliverables: string[];
  requirements: string[];
  tags: string[];
  isActive: boolean;
  featured: boolean;
  images?: string[];
  documents?: {
    name: string;
    url: string;
    type: string;
  }[];
  availability: {
    immediate: boolean;
    estimatedStartDate?: Date;
    maxClients: number;
    currentClients: number;
  };
  rating: {
    average: number;
    count: number;
  };
  reviews: mongoose.Types.ObjectId[];
  faqs: {
    question: string;
    answer: string;
  }[];
  location: {
    type: 'remote' | 'in-person' | 'hybrid';
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>({
  lawyerId: {
    type: Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Criminal Defense',
      'Personal Injury',
      'Family Law',
      'Business Law',
      'Real Estate',
      'Immigration',
      'Employment Law',
      'Intellectual Property',
      'Estate Planning',
      'Tax Law',
      'Bankruptcy',
      'Civil Litigation',
      'Contract Review',
      'Legal Consultation',
      'Document Preparation',
      'Mediation',
      'Arbitration',
      'Compliance',
      'Regulatory Affairs',
      'Other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  price: {
    type: {
      type: String,
      required: true,
      enum: ['fixed', 'hourly', 'consultation', 'retainer']
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    },
    billingCycle: {
      type: String,
      enum: ['one-time', 'monthly', 'quarterly', 'annually']
    }
  },
  duration: {
    estimated: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      enum: ['hours', 'days', 'weeks', 'months']
    }
  },
  deliverables: [{
    type: String,
    required: true,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  images: [{
    type: String
  }],
  documents: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  }],
  availability: {
    immediate: {
      type: Boolean,
      default: true
    },
    estimatedStartDate: Date,
    maxClients: {
      type: Number,
      default: 10,
      min: 1
    },
    currentClients: {
      type: Number,
      default: 0,
      min: 0
    }
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
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }],
  faqs: [{
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    }
  }],
  location: {
    type: {
      type: String,
      required: true,
      enum: ['remote', 'in-person', 'hybrid']
    },
    address: String,
    city: String,
    state: String,
    country: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
ServiceSchema.index({ lawyerId: 1 });
ServiceSchema.index({ category: 1, subcategory: 1 });
ServiceSchema.index({ 'price.amount': 1 });
ServiceSchema.index({ 'rating.average': -1 });
ServiceSchema.index({ isActive: 1, featured: -1 });
ServiceSchema.index({ tags: 1 });
ServiceSchema.index({ 'location.type': 1 });

// Text index for search functionality
ServiceSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

export const Service = mongoose.model<IService>('Service', ServiceSchema);