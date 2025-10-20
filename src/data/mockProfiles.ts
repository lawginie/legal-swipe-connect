export interface LawyerService {
  id: string;
  name: string;
  description: string;
  priceRange: {
    min: number;
    max: number;
  };
  duration: string; // e.g., "1-2 hours", "2-4 weeks"
  category: string;
}

export interface MockProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  specialization?: string; // For lawyers
  legalIssue?: string; // For clients
  experience?: string; // For lawyers
  urgency?: string; // For clients
  rating: number;
  image: string;
  userType: 'lawyer' | 'client';
  verified: boolean;
  languages: string[];
  availability: string;
  distance?: number; // Distance in miles/km from user
  services?: LawyerService[]; // For lawyers
  consultationFee?: number; // For lawyers
}

export const mockLawyers: MockProfile[] = [
  {
    id: 'lawyer-1',
    name: 'Sarah Johnson',
    age: 34,
    location: 'New York, NY',
    bio: 'Experienced corporate lawyer with 10+ years in mergers & acquisitions. Passionate about helping businesses navigate complex legal landscapes.',
    specialization: 'Corporate Law',
    experience: '10+ years',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Spanish'],
    availability: 'Available this week',
    consultationFee: 300,
    services: [
      {
        id: 'corp-1',
        name: 'Business Formation',
        description: 'Complete business entity formation including LLC, Corporation, or Partnership setup',
        priceRange: { min: 1500, max: 3500 },
        duration: '2-4 weeks',
        category: 'Business Setup'
      },
      {
        id: 'corp-2',
        name: 'Contract Review & Drafting',
        description: 'Professional review and drafting of business contracts and agreements',
        priceRange: { min: 500, max: 2000 },
        duration: '3-7 days',
        category: 'Contracts'
      },
      {
        id: 'corp-3',
        name: 'Mergers & Acquisitions',
        description: 'Complete M&A transaction support from due diligence to closing',
        priceRange: { min: 10000, max: 50000 },
        duration: '3-6 months',
        category: 'M&A'
      },
      {
        id: 'corp-4',
        name: 'Corporate Compliance',
        description: 'Ongoing corporate compliance and governance advisory services',
        priceRange: { min: 2000, max: 5000 },
        duration: 'Ongoing',
        category: 'Compliance'
      }
    ]
  },
  {
    id: 'lawyer-2',
    name: 'Michael Chen',
    age: 29,
    location: 'San Francisco, CA',
    bio: 'Tech-savvy intellectual property attorney specializing in software patents and trademark law. Former software engineer turned lawyer.',
    specialization: 'Intellectual Property',
    experience: '5 years',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Mandarin'],
    availability: 'Available next week',
    consultationFee: 250,
    services: [
      {
        id: 'ip-1',
        name: 'Patent Application',
        description: 'Complete patent application filing for inventions and software',
        priceRange: { min: 3000, max: 8000 },
        duration: '4-8 weeks',
        category: 'Patents'
      },
      {
        id: 'ip-2',
        name: 'Trademark Registration',
        description: 'Trademark search, application, and registration services',
        priceRange: { min: 800, max: 2500 },
        duration: '6-12 months',
        category: 'Trademarks'
      },
      {
        id: 'ip-3',
        name: 'Copyright Protection',
        description: 'Copyright registration and protection for creative works',
        priceRange: { min: 400, max: 1200 },
        duration: '2-4 weeks',
        category: 'Copyright'
      },
      {
        id: 'ip-4',
        name: 'IP Licensing Agreement',
        description: 'Draft and negotiate intellectual property licensing agreements',
        priceRange: { min: 1500, max: 4000 },
        duration: '2-6 weeks',
        category: 'Licensing'
      }
    ]
  },
  {
    id: 'lawyer-3',
    name: 'Emily Rodriguez',
    age: 42,
    location: 'Miami, FL',
    bio: 'Dedicated family law attorney with a compassionate approach. Specializing in divorce, custody, and adoption cases.',
    specialization: 'Family Law',
    experience: '15+ years',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Spanish'],
    availability: 'Available today',
    consultationFee: 200,
    services: [
      {
        id: 'fam-1',
        name: 'Divorce Proceedings',
        description: 'Complete divorce representation including asset division and settlements',
        priceRange: { min: 3000, max: 15000 },
        duration: '6-18 months',
        category: 'Divorce'
      },
      {
        id: 'fam-2',
        name: 'Child Custody',
        description: 'Child custody and visitation rights representation',
        priceRange: { min: 2500, max: 8000 },
        duration: '3-12 months',
        category: 'Custody'
      },
      {
        id: 'fam-3',
        name: 'Adoption Services',
        description: 'Legal assistance with adoption proceedings and documentation',
        priceRange: { min: 2000, max: 6000 },
        duration: '6-12 months',
        category: 'Adoption'
      },
      {
        id: 'fam-4',
        name: 'Prenuptial Agreement',
        description: 'Draft and review prenuptial and postnuptial agreements',
        priceRange: { min: 1000, max: 3000 },
        duration: '2-4 weeks',
        category: 'Agreements'
      }
    ]
  },
  {
    id: 'lawyer-4',
    name: 'David Thompson',
    age: 38,
    location: 'Chicago, IL',
    bio: 'Criminal defense attorney with a track record of successful cases. Committed to protecting your rights and ensuring fair representation.',
    specialization: 'Criminal Defense',
    experience: '12 years',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English'],
    availability: 'Available this week',
    consultationFee: 275,
    services: [
      {
        id: 'crim-1',
        name: 'DUI/DWI Defense',
        description: 'Complete defense for driving under the influence charges including license protection',
        priceRange: { min: 2500, max: 8000 },
        duration: '3-8 months',
        category: 'Traffic Crimes'
      },
      {
        id: 'crim-2',
        name: 'Felony Defense',
        description: 'Comprehensive defense for serious felony charges and criminal cases',
        priceRange: { min: 5000, max: 25000 },
        duration: '6-18 months',
        category: 'Felony'
      },
      {
        id: 'crim-3',
        name: 'Drug Crime Defense',
        description: 'Defense against drug possession, distribution, and trafficking charges',
        priceRange: { min: 3000, max: 15000 },
        duration: '4-12 months',
        category: 'Drug Crimes'
      },
      {
        id: 'crim-4',
        name: 'White Collar Crime',
        description: 'Defense for fraud, embezzlement, and other white-collar criminal charges',
        priceRange: { min: 7500, max: 30000 },
        duration: '8-24 months',
        category: 'White Collar'
      }
    ]
  },
  {
    id: 'lawyer-5',
    name: 'Lisa Park',
    age: 31,
    location: 'Seattle, WA',
    bio: 'Environmental law specialist fighting for sustainable practices. Experienced in regulatory compliance and environmental litigation.',
    specialization: 'Environmental Law',
    experience: '7 years',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Korean'],
    availability: 'Available next week',
    consultationFee: 225,
    services: [
      {
        id: 'env-1',
        name: 'Environmental Compliance',
        description: 'Regulatory compliance assessment and guidance for environmental regulations',
        priceRange: { min: 2000, max: 8000 },
        duration: '2-6 months',
        category: 'Compliance'
      },
      {
        id: 'env-2',
        name: 'Environmental Impact Assessment',
        description: 'Comprehensive environmental impact studies for development projects',
        priceRange: { min: 5000, max: 15000 },
        duration: '3-9 months',
        category: 'Assessment'
      },
      {
        id: 'env-3',
        name: 'Pollution Litigation',
        description: 'Legal representation for pollution-related lawsuits and claims',
        priceRange: { min: 7500, max: 25000 },
        duration: '6-18 months',
        category: 'Litigation'
      },
      {
        id: 'env-4',
        name: 'Sustainability Consulting',
        description: 'Legal guidance for sustainable business practices and green initiatives',
        priceRange: { min: 1500, max: 6000 },
        duration: '1-4 months',
        category: 'Consulting'
      }
    ]
  },
  {
    id: 'lawyer-6',
    name: 'Amanda Foster',
    age: 36,
    location: 'Boston, MA',
    bio: 'Compassionate family law attorney specializing in divorce, child custody, adoption, and domestic relations. Dedicated to protecting families during difficult times.',
    specialization: 'Family & Personal',
    experience: '11 years',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English'],
    availability: 'Available this week',
    consultationFee: 200,
    services: [
      {
        id: 'fam-5',
        name: 'Divorce Proceedings',
        description: 'Complete divorce representation including asset division and settlement negotiations',
        priceRange: { min: 3000, max: 12000 },
        duration: '6-18 months',
        category: 'Divorce'
      },
      {
        id: 'fam-6',
        name: 'Child Custody & Support',
        description: 'Child custody arrangements, visitation rights, and support calculations',
        priceRange: { min: 2500, max: 8000 },
        duration: '3-12 months',
        category: 'Child Custody'
      },
      {
        id: 'fam-7',
        name: 'Adoption Services',
        description: 'Legal assistance for domestic and international adoption processes',
        priceRange: { min: 2000, max: 7500 },
        duration: '6-24 months',
        category: 'Adoption'
      },
      {
        id: 'fam-8',
        name: 'Domestic Violence Protection',
        description: 'Restraining orders and legal protection from domestic violence',
        priceRange: { min: 1500, max: 5000 },
        duration: '1-6 months',
        category: 'Protection'
      }
    ]
  },
  {
    id: 'lawyer-7',
    name: 'Marcus Williams',
    age: 44,
    location: 'Phoenix, AZ',
    bio: 'Personal injury attorney with extensive experience in auto accidents, medical malpractice, and workplace injuries. Fighting for maximum compensation for victims.',
    specialization: 'Injury & Compensation',
    experience: '18 years',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Spanish'],
    availability: 'Available today',
    consultationFee: 0,
    services: [
      {
        id: 'inj-1',
        name: 'Auto Accident Claims',
        description: 'Complete representation for car accident injuries and insurance claims',
        priceRange: { min: 0, max: 0 },
        duration: '6-18 months',
        category: 'Auto Accidents'
      },
      {
        id: 'inj-2',
        name: 'Medical Malpractice',
        description: 'Legal action against medical professionals for negligence and malpractice',
        priceRange: { min: 0, max: 0 },
        duration: '12-36 months',
        category: 'Medical Malpractice'
      },
      {
        id: 'inj-3',
        name: 'Workplace Injuries',
        description: 'Workers compensation and workplace injury claims representation',
        priceRange: { min: 0, max: 0 },
        duration: '6-24 months',
        category: 'Workers Comp'
      },
      {
        id: 'inj-4',
        name: 'Slip & Fall Cases',
        description: 'Premises liability and slip and fall accident compensation claims',
        priceRange: { min: 0, max: 0 },
        duration: '4-12 months',
        category: 'Premises Liability'
      }
    ]
  },
  {
    id: 'lawyer-8',
    name: 'Rachel Kim',
    age: 32,
    location: 'Portland, OR',
    bio: 'Real estate and property law specialist handling residential and commercial transactions, landlord-tenant disputes, and zoning issues.',
    specialization: 'Property & Housing',
    experience: '8 years',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Korean'],
    availability: 'Available next week',
    consultationFee: 180,
    services: [
      {
        id: 'prop-1',
        name: 'Real Estate Transactions',
        description: 'Complete legal assistance for buying, selling, and transferring property',
        priceRange: { min: 1500, max: 5000 },
        duration: '1-3 months',
        category: 'Transactions'
      },
      {
        id: 'prop-2',
        name: 'Landlord-Tenant Disputes',
        description: 'Legal representation for rental disputes, evictions, and lease issues',
        priceRange: { min: 1000, max: 4000 },
        duration: '2-8 months',
        category: 'Rental Law'
      },
      {
        id: 'prop-3',
        name: 'Property Development',
        description: 'Zoning, permits, and legal guidance for property development projects',
        priceRange: { min: 3000, max: 12000 },
        duration: '3-12 months',
        category: 'Development'
      },
      {
        id: 'prop-4',
        name: 'Title & Deed Issues',
        description: 'Resolution of property title disputes and deed corrections',
        priceRange: { min: 2000, max: 7500 },
        duration: '2-6 months',
        category: 'Title Issues'
      }
    ]
  },
  {
    id: 'lawyer-9',
    name: 'Thomas Brown',
    age: 40,
    location: 'Detroit, MI',
    bio: 'Employment law attorney protecting workers\' rights. Specializing in wrongful termination, workplace discrimination, and labor disputes.',
    specialization: 'Employment & Labour',
    experience: '14 years',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English'],
    availability: 'Available this week',
    consultationFee: 220,
    services: [
      {
        id: 'emp-1',
        name: 'Wrongful Termination',
        description: 'Legal action for unlawful dismissal and employment contract violations',
        priceRange: { min: 3000, max: 15000 },
        duration: '6-18 months',
        category: 'Termination'
      },
      {
        id: 'emp-2',
        name: 'Workplace Discrimination',
        description: 'Representation for discrimination based on race, gender, age, or disability',
        priceRange: { min: 4000, max: 20000 },
        duration: '8-24 months',
        category: 'Discrimination'
      },
      {
        id: 'emp-3',
        name: 'Wage & Hour Disputes',
        description: 'Recovery of unpaid wages, overtime, and benefits violations',
        priceRange: { min: 2000, max: 8000 },
        duration: '3-12 months',
        category: 'Wage Issues'
      },
      {
        id: 'emp-4',
        name: 'Sexual Harassment',
        description: 'Legal protection and compensation for workplace sexual harassment',
        priceRange: { min: 3500, max: 18000 },
        duration: '6-20 months',
        category: 'Harassment'
      }
    ]
  },
  {
    id: 'lawyer-10',
    name: 'Sophia Martinez',
    age: 35,
    location: 'Dallas, TX',
    bio: 'Consumer protection attorney helping clients with debt relief, credit repair, bankruptcy, and financial disputes. Your advocate against unfair practices.',
    specialization: 'Money, Credit & Consumer',
    experience: '9 years',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Spanish'],
    availability: 'Available today',
    consultationFee: 150,
    services: [
      {
        id: 'cons-1',
        name: 'Bankruptcy Filing',
        description: 'Chapter 7 and Chapter 13 bankruptcy proceedings and debt discharge',
        priceRange: { min: 1500, max: 4000 },
        duration: '3-8 months',
        category: 'Bankruptcy'
      },
      {
        id: 'cons-2',
        name: 'Debt Collection Defense',
        description: 'Protection from aggressive debt collectors and harassment',
        priceRange: { min: 1000, max: 3500 },
        duration: '2-6 months',
        category: 'Debt Defense'
      },
      {
        id: 'cons-3',
        name: 'Credit Repair',
        description: 'Legal assistance to remove inaccurate items from credit reports',
        priceRange: { min: 800, max: 2500 },
        duration: '3-12 months',
        category: 'Credit Repair'
      },
      {
        id: 'cons-4',
        name: 'Consumer Fraud',
        description: 'Legal action against fraudulent business practices and scams',
        priceRange: { min: 2000, max: 8000 },
        duration: '4-15 months',
        category: 'Fraud Protection'
      }
    ]
  },
  {
    id: 'lawyer-11',
    name: 'Alexander Davis',
    age: 38,
    location: 'Atlanta, GA',
    bio: 'Business law attorney specializing in contract negotiations, corporate formation, mergers & acquisitions, and commercial litigation.',
    specialization: 'Business & Contracts',
    experience: '13 years',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English'],
    availability: 'Available this week',
    consultationFee: 350,
    services: [
      {
        id: 'bus-1',
        name: 'Contract Drafting & Review',
        description: 'Professional contract creation, review, and negotiation services',
        priceRange: { min: 1500, max: 8000 },
        duration: '2-6 weeks',
        category: 'Contracts'
      },
      {
        id: 'bus-2',
        name: 'Business Formation',
        description: 'LLC, corporation, and partnership formation with legal documentation',
        priceRange: { min: 2000, max: 6000 },
        duration: '1-3 months',
        category: 'Formation'
      },
      {
        id: 'bus-3',
        name: 'Mergers & Acquisitions',
        description: 'Complete M&A legal services including due diligence and negotiations',
        priceRange: { min: 15000, max: 75000 },
        duration: '6-18 months',
        category: 'M&A'
      },
      {
        id: 'bus-4',
        name: 'Commercial Litigation',
        description: 'Business dispute resolution and commercial lawsuit representation',
        priceRange: { min: 5000, max: 25000 },
        duration: '8-24 months',
        category: 'Litigation'
      }
    ]
  },
  {
    id: 'lawyer-12',
    name: 'Victoria Johnson',
    age: 41,
    location: 'Las Vegas, NV',
    bio: 'Criminal defense and civil litigation attorney with a proven track record. Defending clients in both criminal cases and civil disputes.',
    specialization: 'Criminal & Civil Defence',
    experience: '16 years',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English'],
    availability: 'Available next week',
    consultationFee: 300,
    services: [
      {
        id: 'crim-civ-1',
        name: 'Criminal Defense',
        description: 'Comprehensive criminal defense for misdemeanors and felonies',
        priceRange: { min: 3000, max: 20000 },
        duration: '4-18 months',
        category: 'Criminal Defense'
      },
      {
        id: 'crim-civ-2',
        name: 'Civil Litigation',
        description: 'Civil lawsuit representation for personal and business disputes',
        priceRange: { min: 4000, max: 25000 },
        duration: '6-24 months',
        category: 'Civil Litigation'
      },
      {
        id: 'crim-civ-3',
        name: 'Appeals & Post-Conviction',
        description: 'Appellate court representation and post-conviction relief',
        priceRange: { min: 5000, max: 15000 },
        duration: '8-18 months',
        category: 'Appeals'
      },
      {
        id: 'crim-civ-4',
        name: 'Expungement Services',
        description: 'Criminal record sealing and expungement proceedings',
        priceRange: { min: 1500, max: 4000 },
        duration: '2-6 months',
        category: 'Record Clearing'
      }
    ]
  },
  {
    id: 'lawyer-13',
    name: 'Carlos Rodriguez',
    age: 37,
    location: 'Houston, TX',
    bio: 'Immigration attorney helping families and businesses navigate complex immigration processes. Specializing in visas, green cards, and citizenship applications.',
    specialization: 'Immigration & Citizenship',
    experience: '12 years',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Spanish'],
    availability: 'Available today',
    consultationFee: 200,
    services: [
      {
        id: 'imm-1',
        name: 'Family-Based Immigration',
        description: 'Green card applications for spouses, children, and family members',
        priceRange: { min: 2500, max: 8000 },
        duration: '12-36 months',
        category: 'Family Immigration'
      },
      {
        id: 'imm-2',
        name: 'Work Visas & Employment',
        description: 'H-1B, L-1, and other employment-based visa applications',
        priceRange: { min: 3000, max: 10000 },
        duration: '6-18 months',
        category: 'Work Visas'
      },
      {
        id: 'imm-3',
        name: 'Citizenship & Naturalization',
        description: 'U.S. citizenship applications and naturalization process assistance',
        priceRange: { min: 1500, max: 4000 },
        duration: '8-24 months',
        category: 'Citizenship'
      },
      {
        id: 'imm-4',
        name: 'Deportation Defense',
        description: 'Legal representation in removal proceedings and deportation cases',
        priceRange: { min: 4000, max: 15000 },
        duration: '6-24 months',
        category: 'Deportation Defense'
      }
    ]
  },
  {
    id: 'lawyer-14',
    name: 'Jennifer Chang',
    age: 33,
    location: 'San Jose, CA',
    bio: 'Technology and privacy law specialist focusing on data protection, cybersecurity, online privacy rights, and tech startup legal needs.',
    specialization: 'Tech, Privacy & Online',
    experience: '7 years',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English', 'Mandarin'],
    availability: 'Available this week',
    consultationFee: 275,
    services: [
      {
        id: 'tech-1',
        name: 'Data Privacy Compliance',
        description: 'GDPR, CCPA, and other data protection regulation compliance',
        priceRange: { min: 3000, max: 12000 },
        duration: '2-8 months',
        category: 'Privacy Compliance'
      },
      {
        id: 'tech-2',
        name: 'Cybersecurity Legal',
        description: 'Legal guidance for data breaches, incident response, and security policies',
        priceRange: { min: 4000, max: 15000 },
        duration: '1-6 months',
        category: 'Cybersecurity'
      },
      {
        id: 'tech-3',
        name: 'Tech Startup Legal',
        description: 'Comprehensive legal services for technology startups and entrepreneurs',
        priceRange: { min: 5000, max: 20000 },
        duration: '3-12 months',
        category: 'Startup Legal'
      },
      {
        id: 'tech-4',
        name: 'Online Content & IP',
        description: 'Digital content protection, DMCA, and online intellectual property',
        priceRange: { min: 2000, max: 8000 },
        duration: '2-8 months',
        category: 'Digital IP'
      }
    ]
  },
  {
    id: 'lawyer-15',
    name: 'Robert Taylor',
    age: 45,
    location: 'Nashville, TN',
    bio: 'General practice attorney providing comprehensive legal consultation across multiple areas of law. Your one-stop solution for various legal needs.',
    specialization: 'General Consultation',
    experience: '20+ years',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    userType: 'lawyer',
    verified: true,
    languages: ['English'],
    availability: 'Available next week',
    consultationFee: 175,
    services: [
      {
        id: 'gen-1',
        name: 'Legal Document Review',
        description: 'Professional review and analysis of contracts, agreements, and legal documents',
        priceRange: { min: 500, max: 2500 },
        duration: '1-4 weeks',
        category: 'Document Review'
      },
      {
        id: 'gen-2',
        name: 'Legal Consultation',
        description: 'Comprehensive legal advice across multiple practice areas',
        priceRange: { min: 200, max: 800 },
        duration: '1-2 hours',
        category: 'Consultation'
      },
      {
        id: 'gen-3',
        name: 'Small Claims Assistance',
        description: 'Guidance and representation for small claims court matters',
        priceRange: { min: 800, max: 3000 },
        duration: '2-6 months',
        category: 'Small Claims'
      },
      {
        id: 'gen-4',
        name: 'Legal Research & Analysis',
        description: 'In-depth legal research and case analysis for complex issues',
        priceRange: { min: 1000, max: 5000 },
        duration: '2-8 weeks',
        category: 'Research'
      }
    ]
  }
];

export const mockClients: MockProfile[] = [
  {
    id: 'client-1',
    name: 'Robert Wilson',
    age: 45,
    location: 'Austin, TX',
    bio: 'Small business owner seeking legal advice for contract negotiations and business expansion. Looking for experienced corporate counsel.',
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
    location: 'Los Angeles, CA',
    bio: 'Going through a difficult divorce and need compassionate legal representation for custody arrangements and asset division.',
    legalIssue: 'Divorce & Custody',
    urgency: 'Urgent - This week',
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
    userType: 'client',
    verified: true,
    languages: ['English', 'Spanish'],
    availability: 'Evenings preferred'
  },
  {
    id: 'client-3',
    name: 'Alex Kumar',
    age: 28,
    location: 'Boston, MA',
    bio: 'Software developer with a patent application that needs legal review. Looking for IP attorney with tech background.',
    legalIssue: 'Patent Application',
    urgency: 'Within 1 month',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
    userType: 'client',
    verified: true,
    languages: ['English', 'Hindi'],
    availability: 'Weekends preferred'
  },
  {
    id: 'client-4',
    name: 'Maria Gonzalez',
    age: 52,
    location: 'Phoenix, AZ',
    bio: 'Facing criminal charges and need experienced defense attorney. Looking for someone who speaks Spanish and understands my situation.',
    legalIssue: 'Criminal Defense',
    urgency: 'Urgent - ASAP',
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face',
    userType: 'client',
    verified: false,
    languages: ['Spanish', 'English'],
    availability: 'Any time'
  },
  {
    id: 'client-5',
    name: 'James Anderson',
    age: 39,
    location: 'Denver, CO',
    bio: 'Environmental consultant needing legal advice on regulatory compliance issues. Looking for lawyer with environmental law expertise.',
    legalIssue: 'Environmental Compliance',
    urgency: 'Within 3 weeks',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    userType: 'client',
    verified: true,
    languages: ['English'],
    availability: 'Business hours'
  }
];

export const getAllMockProfiles = (): MockProfile[] => {
  return [...mockLawyers, ...mockClients];
};

export const getMockProfilesByType = (userType: 'lawyer' | 'client'): MockProfile[] => {
  return userType === 'lawyer' ? mockLawyers : mockClients;
};