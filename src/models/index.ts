// Export all models and types
export { User } from './User';
export type { IUser } from './User';
export { Lawyer } from './Lawyer';
export type { ILawyer } from './Lawyer';
export { Service } from './Service';
export type { IService } from './Service';
export { Swipe } from './Swipe';
export type { ISwipe } from './Swipe';
export { Match } from './Match';
export type { IMatch } from './Match';
export { Chat } from './Chat';
export type { IChat, IMessage } from './Chat';

// Model types for TypeScript
export type UserType = 'client' | 'lawyer';
export type SwipeAction = 'like' | 'dislike' | 'super_like' | 'pass';
export type MatchStatus = 'active' | 'expired' | 'blocked' | 'completed' | 'cancelled';
export type ChatStatus = 'active' | 'archived' | 'blocked' | 'deleted';
export type MessageType = 'text' | 'image' | 'document' | 'audio' | 'video' | 'system';
export type ServicePriceType = 'fixed' | 'hourly' | 'consultation' | 'retainer';
export type LocationType = 'remote' | 'in-person' | 'hybrid';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

// Legal specializations enum
export const LEGAL_SPECIALIZATIONS = [
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
] as const;

// Service categories enum
export const SERVICE_CATEGORIES = [
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
] as const;

export type LegalSpecialization = typeof LEGAL_SPECIALIZATIONS[number];
export type ServiceCategory = typeof SERVICE_CATEGORIES[number];