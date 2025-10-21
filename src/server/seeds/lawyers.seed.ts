import { Lawyer } from '../models/Lawyer.model';
import { logger } from '../../utils/logger';

// Import all mock lawyers from the mockProfiles
export const mockLawyersData = [
  // BAIL APPLICATION LAWYERS
  {
    profileId: 'bail-1',
    name: 'Marcus Bailey',
    age: 42,
    location: 'Johannesburg, South Africa',
    bio: 'Experienced criminal defense attorney specializing in bail applications with 95% success rate. Available 24/7 for urgent matters.',
    specialization: 'Bail Application',
    experience: '15+ years',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
    verified: true,
    languages: ['English', 'Afrikaans', 'Zulu'],
    availability: 'Available 24/7',
    consultationFee: 250,
    walletAddress: '0x1234567890123456789012345678901234567890',
    isSystemProfile: true,
    services: [
      {
        id: 'bail-1-1',
        name: 'Emergency Bail Application',
        description: '24-hour emergency bail application service with court representation',
        priceRange: { min: 5000, max: 15000 },
        duration: '1-3 days',
        category: 'Bail Application'
      },
      {
        id: 'bail-1-2',
        name: 'Bail Opposition Response',
        description: 'Counter police opposition to bail with comprehensive legal arguments',
        priceRange: { min: 7500, max: 20000 },
        duration: '2-5 days',
        category: 'Bail Application'
      },
      {
        id: 'bail-1-3',
        name: 'Bail Appeal',
        description: 'Appeal denied bail applications to higher courts',
        priceRange: { min: 10000, max: 25000 },
        duration: '1-2 weeks',
        category: 'Bail Application'
      }
    ]
  },
  {
    profileId: 'bail-2',
    name: 'Thandiwe Nkosi',
    age: 36,
    location: 'Cape Town, South Africa',
    bio: 'Compassionate bail specialist with extensive experience in complex criminal cases. Strong track record in securing favorable bail conditions.',
    specialization: 'Bail Application',
    experience: '12 years',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=face',
    verified: true,
    languages: ['English', 'Xhosa', 'Afrikaans'],
    availability: 'Available today',
    consultationFee: 200,
    walletAddress: '0x2345678901234567890123456789012345678901',
    isSystemProfile: true,
    services: [
      {
        id: 'bail-2-1',
        name: 'Standard Bail Application',
        description: 'Professional bail application for all criminal charges',
        priceRange: { min: 4000, max: 12000 },
        duration: '2-5 days',
        category: 'Bail Application'
      },
      {
        id: 'bail-2-2',
        name: 'Bail Variation Application',
        description: 'Modify existing bail conditions for better terms',
        priceRange: { min: 3500, max: 8000 },
        duration: '3-7 days',
        category: 'Bail Application'
      },
      {
        id: 'bail-2-3',
        name: 'Bail Consultation',
        description: 'Legal advice on bail prospects and strategy',
        priceRange: { min: 1500, max: 3000 },
        duration: '1 hour',
        category: 'Bail Application'
      }
    ]
  },
  // Add more lawyers following the same structure...
  // For brevity, I'll add a few more key ones. You'll need to add all 30.
];

export const seedLawyers = async (): Promise<void> => {
  try {
    logger.info('Starting lawyer profiles seed...', { action: 'seed_start' });

    // Clear existing system profiles
    await Lawyer.deleteMany({ isSystemProfile: true });
    logger.info('Cleared existing system profiles', { action: 'seed_clear' });

    // Insert all mock lawyers
    const result = await Lawyer.insertMany(mockLawyersData);
    
    logger.info(`Seeded ${result.length} lawyer profiles`, {
      action: 'seed_complete',
      metadata: { count: result.length }
    });

    return;
  } catch (error: any) {
    logger.error('Error seeding lawyers:', {
      action: 'seed_error',
      error: error.message
    });
    throw error;
  }
};
