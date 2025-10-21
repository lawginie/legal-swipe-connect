export interface LawyerService {
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

export interface MockProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  specialization?: string;
  legalIssue?: string;
  experience?: string;
  urgency?: string;
  rating: number;
  image: string;
  userType: 'lawyer' | 'client';
  verified: boolean;
  languages: string[];
  availability: string;
  distance?: number;
  services?: LawyerService[];
  consultationFee?: number;
  walletAddress?: string;
}

export const mockLawyers: MockProfile[] = [
  // ========== BAIL APPLICATION LAWYERS (5) ==========
  {
    id: 'bail-1',
    name: 'Marcus Bailey',
    age: 42,
    location: 'Johannesburg, South Africa',
    bio: 'Experienced criminal defense attorney specializing in bail applications with 95% success rate. Available 24/7 for urgent matters.',
    specialization: 'Bail Application',
    experience: '15+ years',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Afrikaans', 'Zulu'],
    availability: 'Available 24/7',
    consultationFee: 250,
    walletAddress: '0x1234567890123456789012345678901234567890',
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
    id: 'bail-2',
    name: 'Thandiwe Nkosi',
    age: 36,
    location: 'Cape Town, South Africa',
    bio: 'Compassionate bail specialist with extensive experience in complex criminal cases. Strong track record in securing favorable bail conditions.',
    specialization: 'Bail Application',
    experience: '12 years',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Xhosa', 'Afrikaans'],
    availability: 'Available today',
    consultationFee: 200,
    walletAddress: '0x2345678901234567890123456789012345678901',
    services: [
      {
        id: 'bail-2-1',
        name: 'Standard Bail Application',
        description: 'Professional bail application for all criminal charges',
        priceRange: { min: 4000, max: 12000 },
        duration: '2-4 days',
        category: 'Bail Application'
      },
      {
        id: 'bail-2-2',
        name: 'Bail Condition Variation',
        description: 'Modify existing bail conditions for better terms',
        priceRange: { min: 3000, max: 8000 },
        duration: '3-7 days',
        category: 'Bail Application'
      },
      {
        id: 'bail-2-3',
        name: 'Bail Surety Arrangement',
        description: 'Arrange bail surety and guarantor documentation',
        priceRange: { min: 2500, max: 6000 },
        duration: '1-2 days',
        category: 'Bail Application'
      }
    ]
  },
  {
    id: 'bail-3',
    name: 'Pieter van der Merwe',
    age: 48,
    location: 'Pretoria, South Africa',
    bio: 'Former prosecutor turned defense attorney. Deep understanding of bail procedures and prosecution strategies. Aggressive bail advocate.',
    specialization: 'Bail Application',
    experience: '20+ years',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['Afrikaans', 'English'],
    availability: 'Available this week',
    consultationFee: 300,
    walletAddress: '0x3456789012345678901234567890123456789012',
    services: [
      {
        id: 'bail-3-1',
        name: 'High-Profile Bail Application',
        description: 'Bail applications for serious charges including Schedule 5 & 6 offenses',
        priceRange: { min: 15000, max: 40000 },
        duration: '1-2 weeks',
        category: 'Bail Application'
      },
      {
        id: 'bail-3-2',
        name: 'Bail Hearing Representation',
        description: 'Full court representation during bail hearings',
        priceRange: { min: 8000, max: 18000 },
        duration: '1-5 days',
        category: 'Bail Application'
      },
      {
        id: 'bail-3-3',
        name: 'Pre-Bail Consultation',
        description: 'Strategic planning session before bail application',
        priceRange: { min: 1500, max: 3000 },
        duration: '2-4 hours',
        category: 'Bail Application'
      }
    ]
  },
  {
    id: 'bail-4',
    name: 'Ayesha Patel',
    age: 34,
    location: 'Durban, South Africa',
    bio: 'Tech-savvy bail specialist offering virtual consultations and rapid response. Known for meticulous preparation and persuasive court presentations.',
    specialization: 'Bail Application',
    experience: '9 years',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Hindi', 'Zulu'],
    availability: 'Available 24/7',
    consultationFee: 180,
    walletAddress: '0x4567890123456789012345678901234567890123',
    services: [
      {
        id: 'bail-4-1',
        name: 'Express Bail Service',
        description: 'Fast-track bail application with priority court scheduling',
        priceRange: { min: 6000, max: 16000 },
        duration: '12-48 hours',
        category: 'Bail Application'
      },
      {
        id: 'bail-4-2',
        name: 'Bail Documentation Package',
        description: 'Complete bail application documentation and affidavits',
        priceRange: { min: 2000, max: 5000 },
        duration: '1-2 days',
        category: 'Bail Application'
      },
      {
        id: 'bail-4-3',
        name: 'Family Support Legal Aid',
        description: 'Bail application assistance for family members of accused',
        priceRange: { min: 3500, max: 9000 },
        duration: '2-5 days',
        category: 'Bail Application'
      }
    ]
  },
  {
    id: 'bail-5',
    name: 'Jonathan Mokoena',
    age: 39,
    location: 'Bloemfontein, South Africa',
    bio: 'Dedicated criminal lawyer with expertise in bail law and human rights. Fighting for fair bail terms and protecting constitutional rights.',
    specialization: 'Bail Application',
    experience: '13 years',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Sesotho', 'Tswana'],
    availability: 'Available this week',
    consultationFee: 220,
    walletAddress: '0x5678901234567890123456789012345678901234',
    services: [
      {
        id: 'bail-5-1',
        name: 'Affordable Bail Application',
        description: 'Cost-effective bail application for minor offenses',
        priceRange: { min: 3000, max: 8000 },
        duration: '2-4 days',
        category: 'Bail Application'
      },
      {
        id: 'bail-5-2',
        name: 'Bail Review Application',
        description: 'Review and challenge unfair bail amounts or conditions',
        priceRange: { min: 4500, max: 11000 },
        duration: '1-2 weeks',
        category: 'Bail Application'
      },
      {
        id: 'bail-5-3',
        name: 'Bail Compliance Monitoring',
        description: 'Ensure ongoing compliance with bail conditions',
        priceRange: { min: 2500, max: 6000 },
        duration: 'Ongoing',
        category: 'Bail Application'
      }
    ]
  },

  // ========== DEBT REVIEW LAWYERS (5) ==========
  {
    id: 'debt-1',
    name: 'Sarah Abrahams',
    age: 38,
    location: 'Cape Town, South Africa',
    bio: 'Certified debt counselor and attorney specializing in National Credit Act matters. Helping clients achieve debt freedom through legal debt review.',
    specialization: 'Debt Review',
    experience: '11 years',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Afrikaans'],
    availability: 'Available today',
    consultationFee: 150,
    walletAddress: '0x6789012345678901234567890123456789012345',
    services: [
      {
        id: 'debt-1-1',
        name: 'Debt Review Application',
        description: 'Complete debt review process under National Credit Act (NCA)',
        priceRange: { min: 3500, max: 8000 },
        duration: '3-6 months',
        category: 'Debt Review'
      },
      {
        id: 'debt-1-2',
        name: 'Debt Restructuring Plan',
        description: 'Negotiate reduced monthly payments with all creditors',
        priceRange: { min: 2500, max: 6000 },
        duration: '2-4 months',
        category: 'Debt Review'
      },
      {
        id: 'debt-1-3',
        name: 'Credit Bureau Clearance',
        description: 'Assistance with credit bureau clearance after debt review',
        priceRange: { min: 1500, max: 3500 },
        duration: '1-2 months',
        category: 'Debt Review'
      }
    ]
  },
  {
    id: 'debt-2',
    name: 'Michael Naidoo',
    age: 44,
    location: 'Durban, South Africa',
    bio: 'Financial attorney with expertise in debt counseling and insolvency. Over 1,000 successful debt review cases completed.',
    specialization: 'Debt Review',
    experience: '16 years',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Zulu', 'Hindi'],
    availability: 'Available this week',
    consultationFee: 180,
    walletAddress: '0x7890123456789012345678901234567890123456',
    services: [
      {
        id: 'debt-2-1',
        name: 'Full Debt Review Service',
        description: 'End-to-end debt review from application to court order',
        priceRange: { min: 4000, max: 9500 },
        duration: '4-8 months',
        category: 'Debt Review'
      },
      {
        id: 'debt-2-2',
        name: 'Debt Consolidation Legal',
        description: 'Legal debt consolidation without new loans',
        priceRange: { min: 3000, max: 7000 },
        duration: '2-5 months',
        category: 'Debt Review'
      },
      {
        id: 'debt-2-3',
        name: 'Creditor Negotiation',
        description: 'Negotiate directly with creditors for better terms',
        priceRange: { min: 2000, max: 5000 },
        duration: '1-3 months',
        category: 'Debt Review'
      }
    ]
  },
  {
    id: 'debt-3',
    name: 'Linda Botha',
    age: 35,
    location: 'Johannesburg, South Africa',
    bio: 'Compassionate debt relief specialist focused on helping families escape debt traps. Registered debt counselor with NCR.',
    specialization: 'Debt Review',
    experience: '10 years',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Afrikaans'],
    availability: 'Available next week',
    consultationFee: 120,
    walletAddress: '0x8901234567890123456789012345678901234567',
    services: [
      {
        id: 'debt-3-1',
        name: 'Affordable Debt Review',
        description: 'Budget-friendly debt review for over-indebted consumers',
        priceRange: { min: 2800, max: 6500 },
        duration: '3-6 months',
        category: 'Debt Review'
      },
      {
        id: 'debt-3-2',
        name: 'Debt Counseling Sessions',
        description: 'Professional debt counseling and financial planning',
        priceRange: { min: 800, max: 2000 },
        duration: '1-2 hours',
        category: 'Debt Review'
      },
      {
        id: 'debt-3-3',
        name: 'Payment Distribution Service',
        description: 'Manage and distribute payments to creditors',
        priceRange: { min: 500, max: 1200 },
        duration: 'Monthly',
        category: 'Debt Review'
      }
    ]
  },
  {
    id: 'debt-4',
    name: 'Thabo Khumalo',
    age: 41,
    location: 'Pretoria, South Africa',
    bio: 'Experienced attorney specializing in consumer credit law and debt review. Strong relationships with major banks and credit providers.',
    specialization: 'Debt Review',
    experience: '14 years',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1590086782792-42dd2350140d?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Sesotho', 'Zulu'],
    availability: 'Available today',
    consultationFee: 160,
    walletAddress: '0x9012345678901234567890123456789012345678',
    services: [
      {
        id: 'debt-4-1',
        name: 'Expedited Debt Review',
        description: 'Fast-track debt review process with priority handling',
        priceRange: { min: 5000, max: 11000 },
        duration: '2-4 months',
        category: 'Debt Review'
      },
      {
        id: 'debt-4-2',
        name: 'Debt Review Court Representation',
        description: 'Magistrate court representation for debt review orders',
        priceRange: { min: 3500, max: 7500 },
        duration: '1-3 months',
        category: 'Debt Review'
      },
      {
        id: 'debt-4-3',
        name: 'Post-Debt Review Assistance',
        description: 'Support after completing debt review program',
        priceRange: { min: 1200, max: 3000 },
        duration: '1-2 months',
        category: 'Debt Review'
      }
    ]
  },
  {
    id: 'debt-5',
    name: 'Zinhle Mthembu',
    age: 32,
    location: 'Port Elizabeth, South Africa',
    bio: 'Young, dynamic debt review attorney with modern approach to debt relief. Specializing in helping millennials overcome financial challenges.',
    specialization: 'Debt Review',
    experience: '7 years',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Xhosa', 'Zulu'],
    availability: 'Available this week',
    consultationFee: 100,
    walletAddress: '0x0123456789012345678901234567890123456789',
    services: [
      {
        id: 'debt-5-1',
        name: 'Student Debt Review',
        description: 'Specialized debt review for student loans and young professionals',
        priceRange: { min: 2500, max: 5500 },
        duration: '3-6 months',
        category: 'Debt Review'
      },
      {
        id: 'debt-5-2',
        name: 'Online Debt Review',
        description: 'Fully digital debt review process with virtual consultations',
        priceRange: { min: 3000, max: 6800 },
        duration: '3-5 months',
        category: 'Debt Review'
      },
      {
        id: 'debt-5-3',
        name: 'Debt-Free Planning',
        description: 'Financial planning to prevent future over-indebtedness',
        priceRange: { min: 900, max: 2500 },
        duration: '2-4 hours',
        category: 'Debt Review'
      }
    ]
  },

  // ========== MAINTENANCE LAWYERS (5) ==========
  {
    id: 'maint-1',
    name: 'Amanda Foster',
    age: 40,
    location: 'Johannesburg, South Africa',
    bio: 'Family law specialist dedicated to securing fair maintenance for children and spouses. Fierce advocate with a compassionate approach.',
    specialization: 'Maintenance',
    experience: '14 years',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Afrikaans'],
    availability: 'Available today',
    consultationFee: 180,
    walletAddress: '0x1122334455667788990011223344556677889900',
    services: [
      {
        id: 'maint-1-1',
        name: 'Child Maintenance Application',
        description: 'Court application for child maintenance orders and enforcement',
        priceRange: { min: 3500, max: 9000 },
        duration: '2-6 months',
        category: 'Maintenance'
      },
      {
        id: 'maint-1-2',
        name: 'Spousal Maintenance Claim',
        description: 'Legal representation for spousal maintenance applications',
        priceRange: { min: 4000, max: 12000 },
        duration: '3-8 months',
        category: 'Maintenance'
      },
      {
        id: 'maint-1-3',
        name: 'Maintenance Variation',
        description: 'Increase or decrease existing maintenance court orders',
        priceRange: { min: 2500, max: 7000 },
        duration: '1-4 months',
        category: 'Maintenance'
      }
    ]
  },
  {
    id: 'maint-2',
    name: 'Nomvula Dlamini',
    age: 36,
    location: 'Durban, South Africa',
    bio: 'Passionate children\'s rights attorney specializing in maintenance law. Fighting to ensure children receive proper financial support.',
    specialization: 'Maintenance',
    experience: '11 years',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Zulu', 'Xhosa'],
    availability: 'Available this week',
    consultationFee: 150,
    walletAddress: '0x2233445566778899001122334455667788990011',
    services: [
      {
        id: 'maint-2-1',
        name: 'Emergency Maintenance',
        description: 'Urgent maintenance applications for immediate relief',
        priceRange: { min: 4500, max: 10000 },
        duration: '1-3 weeks',
        category: 'Maintenance'
      },
      {
        id: 'maint-2-2',
        name: 'Maintenance Enforcement',
        description: 'Enforce non-payment of maintenance through contempt proceedings',
        priceRange: { min: 3000, max: 8000 },
        duration: '2-5 months',
        category: 'Maintenance'
      },
      {
        id: 'maint-2-3',
        name: 'Backdated Maintenance',
        description: 'Claim for arrear maintenance payments',
        priceRange: { min: 3500, max: 9500 },
        duration: '3-7 months',
        category: 'Maintenance'
      }
    ]
  },
  {
    id: 'maint-3',
    name: 'Willem Pretorius',
    age: 45,
    location: 'Cape Town, South Africa',
    bio: 'Experienced family court litigator handling complex maintenance disputes. Known for achieving realistic and enforceable maintenance orders.',
    specialization: 'Maintenance',
    experience: '18 years',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['Afrikaans', 'English'],
    availability: 'Available next week',
    consultationFee: 200,
    walletAddress: '0x3344556677889900112233445566778899001122',
    services: [
      {
        id: 'maint-3-1',
        name: 'Maintenance Investigation',
        description: 'Investigate income and assets for maintenance calculations',
        priceRange: { min: 2000, max: 5000 },
        duration: '1-2 months',
        category: 'Maintenance'
      },
      {
        id: 'maint-3-2',
        name: 'Maintenance Defence',
        description: 'Defend against unreasonable maintenance claims',
        priceRange: { min: 3500, max: 9000 },
        duration: '2-6 months',
        category: 'Maintenance'
      },
      {
        id: 'maint-3-3',
        name: 'Emancipation Application',
        description: 'Apply for termination of maintenance for adult children',
        priceRange: { min: 2500, max: 6500 },
        duration: '2-4 months',
        category: 'Maintenance'
      }
    ]
  },
  {
    id: 'maint-4',
    name: 'Keabetswe Moloi',
    age: 33,
    location: 'Pretoria, South Africa',
    bio: 'Modern family lawyer with focus on mediation and alternative dispute resolution in maintenance matters. Avoiding unnecessary litigation.',
    specialization: 'Maintenance',
    experience: '8 years',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1601455763557-db1bea8a9a5a?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Setswana', 'Sesotho'],
    availability: 'Available today',
    consultationFee: 140,
    walletAddress: '0x4455667788990011223344556677889900112233',
    services: [
      {
        id: 'maint-4-1',
        name: 'Maintenance Mediation',
        description: 'Mediate maintenance agreements without going to court',
        priceRange: { min: 2500, max: 6000 },
        duration: '1-3 months',
        category: 'Maintenance'
      },
      {
        id: 'maint-4-2',
        name: 'Parenting Plan with Maintenance',
        description: 'Draft comprehensive parenting plan including maintenance',
        priceRange: { min: 3000, max: 7500 },
        duration: '2-4 months',
        category: 'Maintenance'
      },
      {
        id: 'maint-4-3',
        name: 'Maintenance Agreement Review',
        description: 'Review and advise on private maintenance agreements',
        priceRange: { min: 1500, max: 3500 },
        duration: '1-2 weeks',
        category: 'Maintenance'
      }
    ]
  },
  {
    id: 'maint-5',
    name: 'Rajesh Govender',
    age: 38,
    location: 'Pietermaritzburg, South Africa',
    bio: 'Detail-oriented maintenance law specialist with expertise in high-net-worth cases and complex financial disclosures.',
    specialization: 'Maintenance',
    experience: '12 years',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Hindi', 'Zulu'],
    availability: 'Available this week',
    consultationFee: 190,
    walletAddress: '0x5566778899001122334455667788990011223344',
    services: [
      {
        id: 'maint-5-1',
        name: 'High-Income Maintenance',
        description: 'Maintenance applications involving high-earning individuals',
        priceRange: { min: 6000, max: 15000 },
        duration: '3-8 months',
        category: 'Maintenance'
      },
      {
        id: 'maint-5-2',
        name: 'Maintenance Calculation Expert',
        description: 'Expert financial analysis for maintenance determination',
        priceRange: { min: 2500, max: 6000 },
        duration: '1-2 months',
        category: 'Maintenance'
      },
      {
        id: 'maint-5-3',
        name: 'International Maintenance',
        description: 'Cross-border maintenance claims and enforcement',
        priceRange: { min: 5000, max: 12000 },
        duration: '4-10 months',
        category: 'Maintenance'
      }
    ]
  },

  // ========== EVICTION LAWYERS (5) ==========
  {
    id: 'evict-1',
    name: 'David Thompson',
    age: 43,
    location: 'Johannesburg, South Africa',
    bio: 'Property law specialist with extensive experience in eviction proceedings. Representing both landlords and tenants in rental disputes.',
    specialization: 'Eviction',
    experience: '16 years',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Afrikaans'],
    availability: 'Available this week',
    consultationFee: 220,
    walletAddress: '0x6677889900112233445566778899001122334455',
    services: [
      {
        id: 'evict-1-1',
        name: 'Tenant Eviction',
        description: 'Legal eviction of non-paying or problematic tenants',
        priceRange: { min: 4500, max: 12000 },
        duration: '2-6 months',
        category: 'Eviction'
      },
      {
        id: 'evict-1-2',
        name: 'Emergency Eviction',
        description: 'Urgent eviction proceedings for serious breaches',
        priceRange: { min: 6000, max: 15000 },
        duration: '2-8 weeks',
        category: 'Eviction'
      },
      {
        id: 'evict-1-3',
        name: 'Eviction Defence',
        description: 'Defend tenants against unlawful eviction proceedings',
        priceRange: { min: 3500, max: 10000 },
        duration: '2-5 months',
        category: 'Eviction'
      }
    ]
  },
  {
    id: 'evict-2',
    name: 'Naledi Maseko',
    age: 37,
    location: 'Cape Town, South Africa',
    bio: 'Tenant rights advocate specializing in PIE Act evictions. Protecting vulnerable tenants from illegal evictions while ensuring fair processes.',
    specialization: 'Eviction',
    experience: '12 years',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Xhosa', 'Zulu'],
    availability: 'Available today',
    consultationFee: 180,
    walletAddress: '0x7788990011223344556677889900112233445566',
    services: [
      {
        id: 'evict-2-1',
        name: 'PIE Act Eviction',
        description: 'Eviction proceedings under Prevention of Illegal Eviction Act',
        priceRange: { min: 5000, max: 14000 },
        duration: '3-8 months',
        category: 'Eviction'
      },
      {
        id: 'evict-2-2',
        name: 'Counter-Eviction Application',
        description: 'Oppose unlawful eviction attempts with court application',
        priceRange: { min: 4000, max: 11000 },
        duration: '2-6 months',
        category: 'Eviction'
      },
      {
        id: 'evict-2-3',
        name: 'Rental Tribunal Representation',
        description: 'Represent clients at Rental Housing Tribunal',
        priceRange: { min: 2500, max: 7000 },
        duration: '1-3 months',
        category: 'Eviction'
      }
    ]
  },
  {
    id: 'evict-3',
    name: 'Johan Kruger',
    age: 50,
    location: 'Pretoria, South Africa',
    bio: 'Senior property litigator handling complex commercial and residential evictions. 25+ years of eviction law experience.',
    specialization: 'Eviction',
    experience: '25+ years',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['Afrikaans', 'English'],
    availability: 'Available next week',
    consultationFee: 250,
    walletAddress: '0x8899001122334455667788990011223344556677',
    services: [
      {
        id: 'evict-3-1',
        name: 'Commercial Property Eviction',
        description: 'Eviction of commercial tenants and business premises',
        priceRange: { min: 7500, max: 20000 },
        duration: '3-9 months',
        category: 'Eviction'
      },
      {
        id: 'evict-3-2',
        name: 'Squatter Eviction',
        description: 'Legal removal of unlawful occupiers from property',
        priceRange: { min: 6000, max: 16000 },
        duration: '4-12 months',
        category: 'Eviction'
      },
      {
        id: 'evict-3-3',
        name: 'Eviction Order Execution',
        description: 'Enforce court-granted eviction orders with sheriff',
        priceRange: { min: 2500, max: 6000 },
        duration: '2-6 weeks',
        category: 'Eviction'
      }
    ]
  },
  {
    id: 'evict-4',
    name: 'Priya Singh',
    age: 34,
    location: 'Durban, South Africa',
    bio: 'Modern property law attorney offering streamlined eviction services. Efficient, cost-effective solutions for landlords and property managers.',
    specialization: 'Eviction',
    experience: '9 years',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Hindi', 'Zulu'],
    availability: 'Available this week',
    consultationFee: 160,
    walletAddress: '0x9900112233445566778899001122334455667788',
    services: [
      {
        id: 'evict-4-1',
        name: 'Fast-Track Eviction',
        description: 'Expedited eviction process for clear-cut cases',
        priceRange: { min: 4000, max: 10000 },
        duration: '1-4 months',
        category: 'Eviction'
      },
      {
        id: 'evict-4-2',
        name: 'Rental Arrears Eviction',
        description: 'Eviction due to non-payment of rent',
        priceRange: { min: 3500, max: 9000 },
        duration: '2-5 months',
        category: 'Eviction'
      },
      {
        id: 'evict-4-3',
        name: 'Lease Breach Eviction',
        description: 'Eviction for violations of lease agreement terms',
        priceRange: { min: 4500, max: 11000 },
        duration: '2-6 months',
        category: 'Eviction'
      }
    ]
  },
  {
    id: 'evict-5',
    name: 'Mandla Ngubane',
    age: 41,
    location: 'East London, South Africa',
    bio: 'Balanced property law expert representing both landlords and tenants. Fair, ethical approach to eviction disputes.',
    specialization: 'Eviction',
    experience: '14 years',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Xhosa', 'Zulu'],
    availability: 'Available today',
    consultationFee: 170,
    walletAddress: '0x0011223344556677889900112233445566778899',
    services: [
      {
        id: 'evict-5-1',
        name: 'Mediated Eviction Settlement',
        description: 'Negotiate eviction settlements to avoid court',
        priceRange: { min: 2500, max: 6500 },
        duration: '1-3 months',
        category: 'Eviction'
      },
      {
        id: 'evict-5-2',
        name: 'Eviction Application Package',
        description: 'Complete eviction documentation and court application',
        priceRange: { min: 3000, max: 8000 },
        duration: '2-5 months',
        category: 'Eviction'
      },
      {
        id: 'evict-5-3',
        name: 'Property Recovery Service',
        description: 'Full service property recovery including damages claim',
        priceRange: { min: 5500, max: 14000 },
        duration: '3-8 months',
        category: 'Eviction'
      }
    ]
  },

  // ========== DEBT COLLECTION LAWYERS (5) ==========
  {
    id: 'collect-1',
    name: 'Gregory Sutton',
    age: 46,
    location: 'Johannesburg, South Africa',
    bio: 'Aggressive debt collection attorney with proven track record of recovering outstanding debts. Legal collection strategies that work.',
    specialization: 'Debt Collection',
    experience: '18 years',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1618438931320-26f72c3c3fcc?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Afrikaans'],
    availability: 'Available this week',
    consultationFee: 200,
    walletAddress: '0xAABBCCDDEEFF00112233445566778899AABBCC',
    services: [
      {
        id: 'collect-1-1',
        name: 'Legal Debt Collection',
        description: 'Professional debt collection through legal channels',
        priceRange: { min: 2500, max: 8000 },
        duration: '1-6 months',
        category: 'Debt Collection'
      },
      {
        id: 'collect-1-2',
        name: 'Summons & Judgment',
        description: 'Obtain court judgment for outstanding debts',
        priceRange: { min: 3500, max: 10000 },
        duration: '2-8 months',
        category: 'Debt Collection'
      },
      {
        id: 'collect-1-3',
        name: 'Debt Recovery Investigation',
        description: 'Trace debtors and investigate assets for recovery',
        priceRange: { min: 2000, max: 6000 },
        duration: '1-3 months',
        category: 'Debt Collection'
      }
    ]
  },
  {
    id: 'collect-2',
    name: 'Tshidi Molete',
    age: 35,
    location: 'Pretoria, South Africa',
    bio: 'Commercial debt collection specialist helping businesses recover outstanding payments. Efficient, professional collection services.',
    specialization: 'Debt Collection',
    experience: '11 years',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1592009309602-1dde752490ae?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Setswana', 'Afrikaans'],
    availability: 'Available today',
    consultationFee: 180,
    walletAddress: '0xBBCCDDEEFF00112233445566778899AABBCCDD',
    services: [
      {
        id: 'collect-2-1',
        name: 'Business Debt Recovery',
        description: 'Recover unpaid invoices and business debts',
        priceRange: { min: 3000, max: 9000 },
        duration: '2-6 months',
        category: 'Debt Collection'
      },
      {
        id: 'collect-2-2',
        name: 'Small Claims Collection',
        description: 'Debt collection through Small Claims Court',
        priceRange: { min: 1500, max: 4000 },
        duration: '1-4 months',
        category: 'Debt Collection'
      },
      {
        id: 'collect-2-3',
        name: 'Attachment & Execution',
        description: 'Attach and sell debtor assets to recover debt',
        priceRange: { min: 2500, max: 7000 },
        duration: '2-5 months',
        category: 'Debt Collection'
      }
    ]
  },
  {
    id: 'collect-3',
    name: 'Andre Venter',
    age: 42,
    location: 'Cape Town, South Africa',
    bio: 'Experienced civil litigation attorney specializing in complex debt recovery. Handling large commercial and consumer debts.',
    specialization: 'Debt Collection',
    experience: '15 years',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['Afrikaans', 'English'],
    availability: 'Available next week',
    consultationFee: 220,
    walletAddress: '0xCCDDEEFF00112233445566778899AABBCCDDEE',
    services: [
      {
        id: 'collect-3-1',
        name: 'High-Value Debt Collection',
        description: 'Collection of large debts over R100,000',
        priceRange: { min: 5000, max: 15000 },
        duration: '3-12 months',
        category: 'Debt Collection'
      },
      {
        id: 'collect-3-2',
        name: 'Liquidation Application',
        description: 'Liquidate companies for debt recovery',
        priceRange: { min: 7500, max: 20000 },
        duration: '4-12 months',
        category: 'Debt Collection'
      },
      {
        id: 'collect-3-3',
        name: 'Garnishee Orders',
        description: 'Attach debtor salaries and bank accounts',
        priceRange: { min: 2000, max: 5500 },
        duration: '1-3 months',
        category: 'Debt Collection'
      }
    ]
  },
  {
    id: 'collect-4',
    name: 'Fatima Essack',
    age: 38,
    location: 'Durban, South Africa',
    bio: 'Ethical debt collection attorney balancing effective recovery with fair treatment. Negotiated settlements before litigation.',
    specialization: 'Debt Collection',
    experience: '13 years',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Afrikaans'],
    availability: 'Available this week',
    consultationFee: 170,
    walletAddress: '0xDDEEFF00112233445566778899AABBCCDDEEFF',
    services: [
      {
        id: 'collect-4-1',
        name: 'Debt Collection Mediation',
        description: 'Mediate payment arrangements before court action',
        priceRange: { min: 1800, max: 5000 },
        duration: '1-3 months',
        category: 'Debt Collection'
      },
      {
        id: 'collect-4-2',
        name: 'Payment Plan Agreement',
        description: 'Negotiate and formalize structured payment plans',
        priceRange: { min: 1500, max: 4000 },
        duration: '2-6 weeks',
        category: 'Debt Collection'
      },
      {
        id: 'collect-4-3',
        name: 'Debt Collection Litigation',
        description: 'Court action for non-negotiable debt matters',
        priceRange: { min: 3500, max: 9500 },
        duration: '2-8 months',
        category: 'Debt Collection'
      }
    ]
  },
  {
    id: 'collect-5',
    name: 'Sipho Radebe',
    age: 39,
    location: 'Bloemfontein, South Africa',
    bio: 'Results-driven debt collection lawyer with creative recovery solutions. Maximizing debt recovery while minimizing legal costs.',
    specialization: 'Debt Collection',
    experience: '12 years',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Sesotho', 'Afrikaans'],
    availability: 'Available today',
    consultationFee: 160,
    walletAddress: '0xEEFF00112233445566778899AABBCCDDEEFF00',
    services: [
      {
        id: 'collect-5-1',
        name: 'Multi-Debtor Collection',
        description: 'Collect multiple debts from several debtors',
        priceRange: { min: 4000, max: 12000 },
        duration: '2-8 months',
        category: 'Debt Collection'
      },
      {
        id: 'collect-5-2',
        name: 'International Debt Recovery',
        description: 'Recover debts across international borders',
        priceRange: { min: 6000, max: 18000 },
        duration: '4-15 months',
        category: 'Debt Collection'
      },
      {
        id: 'collect-5-3',
        name: 'Debt Collection Consulting',
        description: 'Advise on debt collection strategies and policies',
        priceRange: { min: 1200, max: 3500 },
        duration: '1-2 hours',
        category: 'Debt Collection'
      }
    ]
  },

  // ========== LETTER OF DEMAND LAWYERS (5) ==========
  {
    id: 'demand-1',
    name: 'Victoria Barnes',
    age: 37,
    location: 'Johannesburg, South Africa',
    bio: 'Specialist in drafting powerful letters of demand that get results. Over 80% settlement rate before litigation.',
    specialization: 'Letter of Demand',
    experience: '12 years',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Afrikaans'],
    availability: 'Available today',
    consultationFee: 150,
    walletAddress: '0xFF00112233445566778899AABBCCDDEEFF001122',
    services: [
      {
        id: 'demand-1-1',
        name: 'Standard Letter of Demand',
        description: 'Professional letter of demand for outstanding debts',
        priceRange: { min: 800, max: 2500 },
        duration: '1-3 days',
        category: 'Letter of Demand'
      },
      {
        id: 'demand-1-2',
        name: 'Urgent Letter of Demand',
        description: 'Same-day letter of demand for urgent matters',
        priceRange: { min: 1200, max: 3500 },
        duration: '24 hours',
        category: 'Letter of Demand'
      },
      {
        id: 'demand-1-3',
        name: 'Final Demand Before Court',
        description: 'Final demand letter with court action notice',
        priceRange: { min: 1500, max: 4000 },
        duration: '2-5 days',
        category: 'Letter of Demand'
      }
    ]
  },
  {
    id: 'demand-2',
    name: 'Bongani Khumalo',
    age: 33,
    location: 'Pretoria, South Africa',
    bio: 'Modern attorney offering instant digital letters of demand. Quick turnaround with legally enforceable demand letters.',
    specialization: 'Letter of Demand',
    experience: '8 years',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Zulu', 'Afrikaans'],
    availability: 'Available 24/7',
    consultationFee: 120,
    walletAddress: '0x00112233445566778899AABBCCDDEEFF00112233',
    services: [
      {
        id: 'demand-2-1',
        name: 'Express Digital Demand',
        description: 'Digital letter of demand delivered within hours',
        priceRange: { min: 600, max: 1800 },
        duration: '4-12 hours',
        category: 'Letter of Demand'
      },
      {
        id: 'demand-2-2',
        name: 'Registered Demand Letter',
        description: 'Officially registered letter of demand with proof of delivery',
        priceRange: { min: 900, max: 2500 },
        duration: '2-4 days',
        category: 'Letter of Demand'
      },
      {
        id: 'demand-2-3',
        name: 'Demand Series Package',
        description: 'Multiple follow-up demand letters over time',
        priceRange: { min: 2000, max: 5000 },
        duration: '2-6 weeks',
        category: 'Letter of Demand'
      }
    ]
  },
  {
    id: 'demand-3',
    name: 'Elaine Hoffman',
    age: 45,
    location: 'Cape Town, South Africa',
    bio: 'Experienced commercial attorney drafting demand letters for business disputes, contracts, and payment claims.',
    specialization: 'Letter of Demand',
    experience: '17 years',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Afrikaans'],
    availability: 'Available this week',
    consultationFee: 180,
    walletAddress: '0x112233445566778899AABBCCDDEEFF0011223344',
    services: [
      {
        id: 'demand-3-1',
        name: 'Commercial Demand Letter',
        description: 'Business-to-business demand letters for unpaid invoices',
        priceRange: { min: 1200, max: 3500 },
        duration: '2-5 days',
        category: 'Letter of Demand'
      },
      {
        id: 'demand-3-2',
        name: 'Contract Breach Demand',
        description: 'Demand letter for breach of contract claims',
        priceRange: { min: 1500, max: 4500 },
        duration: '3-7 days',
        category: 'Letter of Demand'
      },
      {
        id: 'demand-3-3',
        name: 'Damages Demand Letter',
        description: 'Demand for compensation for damages or losses',
        priceRange: { min: 1300, max: 4000 },
        duration: '2-6 days',
        category: 'Letter of Demand'
      }
    ]
  },
  {
    id: 'demand-4',
    name: 'Ntombi Mbatha',
    age: 31,
    location: 'Durban, South Africa',
    bio: 'Young, dynamic lawyer specializing in consumer protection demand letters. Fighting for fair treatment and refunds.',
    specialization: 'Letter of Demand',
    experience: '6 years',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1598550487031-0c6ce2d3ed41?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Zulu', 'Xhosa'],
    availability: 'Available today',
    consultationFee: 100,
    walletAddress: '0x2233445566778899AABBCCDDEEFF001122334455',
    services: [
      {
        id: 'demand-4-1',
        name: 'Consumer Rights Demand',
        description: 'Demand letters for consumer disputes and refunds',
        priceRange: { min: 700, max: 2000 },
        duration: '1-3 days',
        category: 'Letter of Demand'
      },
      {
        id: 'demand-4-2',
        name: 'Service Provider Demand',
        description: 'Demand letters to service providers for poor service',
        priceRange: { min: 800, max: 2200 },
        duration: '2-4 days',
        category: 'Letter of Demand'
      },
      {
        id: 'demand-4-3',
        name: 'Product Defect Demand',
        description: 'Demand for refund or replacement of defective products',
        priceRange: { min: 750, max: 2100 },
        duration: '1-3 days',
        category: 'Letter of Demand'
      }
    ]
  },
  {
    id: 'demand-5',
    name: 'Herman Liebenberg',
    age: 40,
    location: 'Port Elizabeth, South Africa',
    bio: 'Versatile attorney handling all types of demand letters. Clear, legally sound demands that achieve client objectives.',
    specialization: 'Letter of Demand',
    experience: '14 years',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['Afrikaans', 'English'],
    availability: 'Available this week',
    consultationFee: 140,
    walletAddress: '0x3344556677889900AABBCCDDEEFF00112233445566',
    services: [
      {
        id: 'demand-5-1',
        name: 'Property Dispute Demand',
        description: 'Demand letters for property-related disputes',
        priceRange: { min: 1000, max: 3000 },
        duration: '2-5 days',
        category: 'Letter of Demand'
      },
      {
        id: 'demand-5-2',
        name: 'Employment Demand Letter',
        description: 'Demand for unpaid wages or wrongful termination',
        priceRange: { min: 1100, max: 3200 },
        duration: '2-4 days',
        category: 'Letter of Demand'
      },
      {
        id: 'demand-5-3',
        name: 'Insurance Claim Demand',
        description: 'Demand letter to insurance companies for claim payment',
        priceRange: { min: 1200, max: 3500 },
        duration: '3-6 days',
        category: 'Letter of Demand'
      }
    ]
  }
];

export const mockClients: MockProfile[] = [
  {
    id: 'client-1',
    name: 'Robert Wilson',
    age: 45,
    location: 'Johannesburg, South Africa',
    bio: 'Small business owner seeking legal advice for contract negotiations and business expansion.',
    legalIssue: 'Business Contracts',
    urgency: 'Within 2 weeks',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
    userType: 'client',
    verified: true,
    languages: ['English'],
    availability: 'Flexible schedule'
  },
  {
    id: 'client-2',
    name: 'Jennifer Martinez',
    age: 33,
    location: 'Cape Town, South Africa',
    bio: 'Need assistance with maintenance application for my children.',
    legalIssue: 'Maintenance',
    urgency: 'Urgent - This week',
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
    userType: 'client',
    verified: true,
    languages: ['English', 'Afrikaans'],
    availability: 'Evenings preferred'
  }
];

export const getAllMockProfiles = (): MockProfile[] => {
  return [...mockLawyers, ...mockClients];
};

export const getMockProfilesByType = (userType: 'lawyer' | 'client'): MockProfile[] => {
  return userType === 'lawyer' ? mockLawyers : mockClients;
};

// Debug: Log on module load
console.log('📚 Mock Profiles Module Loaded');
console.log('👨‍⚖️ Total Lawyers:', mockLawyers.length);
console.log('👥 Total Clients:', mockClients.length);
