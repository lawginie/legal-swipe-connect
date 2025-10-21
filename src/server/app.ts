import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from '../config/environment';
import { database } from '../database/connection';
import { logger } from '../utils/logger';

// Import route handlers
import authRoutes from './api/auth.routes';
import userRoutes from './api/users.routes';
import lawyerRoutes from './api/lawyers.routes';
import swipeRoutes from './api/swipes.routes';
import matchRoutes from './api/matches.routes';
import chatRoutes from './api/chats.routes';
import paymentRoutes from './api/payments.routes';
import sessionRoutes from './api/sessions.routes';
import profileRoutes from './api/profile.routes';
import activityRoutes from './api/activity.routes';

export class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.api.port;
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? [process.env.CORS_ORIGIN || 'https://your-production-domain.com'] 
        : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8080'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(morgan('combined', {
        stream: {
          write: (message: string) => {
            logger.info(message.trim());
          }
        }
      }));
    }

    // Request ID middleware for tracing
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      req.id = Math.random().toString(36).substring(2, 15);
      res.setHeader('X-Request-ID', req.id);
      next();
    });

    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.info('Incoming request', {
        requestId: req.id,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async (req: Request, res: Response) => {
      try {
        const dbHealth = await database.healthCheck();
        const health = {
          status: 'ok',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'development',
          version: process.env.npm_package_version || '1.0.0',
          database: dbHealth
        };

        const statusCode = dbHealth.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(health);
      } catch (error) {
        logger.error('Health check failed', { error });
        res.status(503).json({
          status: 'error',
          message: 'Service unavailable'
        });
      }
    });

    // API routes
    this.app.use('/api/v1', (req: Request, res: Response, next: NextFunction) => {
      logger.info('API request', {
        requestId: req.id,
        endpoint: req.path,
        method: req.method
      });
      next();
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/lawyers', lawyerRoutes);
    this.app.use('/api/swipes', swipeRoutes);
    this.app.use('/api/matches', matchRoutes);
    this.app.use('/api/chats', chatRoutes);
    this.app.use('/api/payments', paymentRoutes);
    this.app.use('/api/sessions', sessionRoutes);
    this.app.use('/api/profile', profileRoutes);
    this.app.use('/api/activity', activityRoutes);

    // API info endpoint
    this.app.get('/api', (req: Request, res: Response) => {
      res.json({
        message: 'Legal Swipe Connect API',
        version: '1.0.0',
        endpoints: {
          auth: '/api/auth',
          users: '/api/users',
          lawyers: '/api/lawyers',
          swipes: '/api/swipes',
          matches: '/api/matches',
          chats: '/api/chats',
          payments: '/api/payments',
          sessions: '/api/sessions',
          profile: '/api/profile',
          activity: '/api/activity'
        }
      });
    });

    // Note: 404 handling is done by the global error handler

    // Serve static files in production
    if (process.env.NODE_ENV === 'production') {
      this.app.use(express.static('dist'));
      this.app.get('*', (req: Request, res: Response) => {
        res.sendFile('index.html', { root: 'dist' });
      });
    }
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      logger.error('Unhandled error', {
        requestId: req.id,
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method
      });

      // Don't leak error details in production
      const isDevelopment = process.env.NODE_ENV !== 'production';
      
      res.status(500).json({
        error: 'Internal server error',
        requestId: req.id,
        ...(isDevelopment && {
          message: error.message,
          stack: error.stack
        })
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      logger.error('Unhandled promise rejection', { reason, promise });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught exception', { error: error.message, stack: error.stack });
      process.exit(1);
    });
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await database.connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to database, but continuing server startup', { error });
    }
    
    try {
      // Start server
      this.app.listen(this.port, () => {
        logger.info(`Server started successfully`, {
          port: this.port,
          environment: process.env.NODE_ENV || 'development',
          baseUrl: config.api.baseUrl
        });
      });
    } catch (error) {
      logger.error('Failed to start server', { error });
      process.exit(1);
    }
  }

  public getApp(): Application {
    return this.app;
  }
}

// Extend Express Request interface to include custom properties
declare global {
  namespace Express {
    interface Request {
      id: string;
      userId?: string;
      walletAddress?: string;
      authUserType?: string;
      user?: {
        id: string;
        email: string;
        userType: 'client' | 'lawyer';
      };
    }
  }
}

export default Server;