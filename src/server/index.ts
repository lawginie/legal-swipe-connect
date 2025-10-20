// Load environment variables first, before any other imports
import dotenv from 'dotenv';
dotenv.config();

import { validateEnvironment } from '../config/environment';
import { Server } from './app';
import { logger } from '../utils/logger';

// Validate environment variables after dotenv is configured
validateEnvironment();

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error('Missing required environment variables', { 
    missing: missingEnvVars 
  });
  process.exit(1);
}

// Create and start server
async function startServer() {
  try {
    const server = new Server();
    await server.start();
  } catch (error) {
    logger.error('Failed to start application', { error });
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();