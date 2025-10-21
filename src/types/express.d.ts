import { Request } from 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      userType: 'client' | 'lawyer' | 'base';
      walletAddress?: string;
    }
  }
}

export {};
