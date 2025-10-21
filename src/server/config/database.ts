import mongoose from 'mongoose';
import { logger } from '../../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/legalswipe';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`, {
      action: 'database_connected',
      metadata: { host: conn.connection.host, database: conn.connection.name }
    });

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', {
        action: 'database_error',
        error: err.message
      });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected', {
        action: 'database_disconnected'
      });
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination', {
        action: 'database_closed'
      });
      process.exit(0);
    });

  } catch (error: any) {
    logger.error('MongoDB connection failed:', {
      action: 'database_connection_failed',
      error: error.message
    });
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed', {
      action: 'database_closed'
    });
  } catch (error: any) {
    logger.error('Error closing MongoDB connection:', {
      action: 'database_close_error',
      error: error.message
    });
  }
};
