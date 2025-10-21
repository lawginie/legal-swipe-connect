import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/database';
import { seedLawyers } from '../seeds/lawyers.seed';
import { logger } from '../../utils/logger';

dotenv.config();

async function runSeeds() {
  try {
    logger.info('Starting database seeding...', { action: 'seed_start' });

    // Connect to database
    await connectDB();

    // Run seeds
    await seedLawyers();

    logger.info('Database seeding completed successfully!', { action: 'seed_complete' });

    // Disconnect
    await disconnectDB();
    process.exit(0);
  } catch (error: any) {
    logger.error('Database seeding failed', {
      action: 'seed_failed',
      error: error.message
    });
    await disconnectDB();
    process.exit(1);
  }
}

runSeeds();
