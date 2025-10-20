import mongoose from 'mongoose';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Database already connected');
      return;
    }

    try {
      // MongoDB connection options
      const options = {
        dbName: config.mongodb.dbName,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds
        retryWrites: true,
        retryReads: true,
      };

      await mongoose.connect(config.mongodb.uri, options);
      
      this.isConnected = true;
      logger.info('Successfully connected to MongoDB', {
        component: 'database',
        action: 'connect',
        metadata: {
          database: config.mongodb.dbName,
          host: this.getHostFromUri(config.mongodb.uri)
        }
      });

      // Handle connection events
      this.setupEventHandlers();

    } catch (error) {
      logger.error('Failed to connect to MongoDB', {
        component: 'database',
        action: 'connect',
        error: error instanceof Error ? error : String(error)
      });
      throw new Error(`Database connection failed: ${error}`);
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from MongoDB', {
        component: 'database',
        action: 'disconnect'
      });
    } catch (error) {
      logger.error('Error disconnecting from MongoDB', {
        component: 'database',
        action: 'disconnect',
        error: error instanceof Error ? error : String(error)
      });
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: {
      connected: boolean;
      readyState: number;
      host?: string;
      database?: string;
      collections?: number;
    };
  }> {
    try {
      const isHealthy = this.getConnectionStatus();
      const details = {
        connected: this.isConnected,
        readyState: mongoose.connection.readyState,
        host: this.getHostFromUri(config.mongodb.uri),
        database: config.mongodb.dbName,
        collections: isHealthy ? Object.keys(mongoose.connection.collections).length : 0
      };

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        details
      };
    } catch (error) {
      logger.error('Database health check failed', {
        component: 'database',
        action: 'health_check',
        error: error instanceof Error ? error : String(error)
      });
      return {
        status: 'unhealthy',
        details: {
          connected: false,
          readyState: mongoose.connection.readyState
        }
      };
    }
  }

  private setupEventHandlers(): void {
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB', {
        component: 'database',
        action: 'mongoose_connected'
      });
    });

    mongoose.connection.on('error', (error) => {
      logger.error('Mongoose connection error', {
        component: 'database',
        action: 'mongoose_error',
        error: error instanceof Error ? error : String(error)
      });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB', {
        component: 'database',
        action: 'mongoose_disconnected'
      });
      this.isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('Mongoose reconnected to MongoDB', {
        component: 'database',
        action: 'mongoose_reconnected'
      });
      this.isConnected = true;
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  private getHostFromUri(uri: string): string {
    try {
      const url = new URL(uri);
      return url.hostname;
    } catch {
      return 'unknown';
    }
  }
}

export const database = DatabaseConnection.getInstance();