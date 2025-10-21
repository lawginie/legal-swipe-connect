import { Request, Response, NextFunction } from 'express';
import { jwtService, JWTPayload } from '../utils/jwt';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import '../types/express'; // Import Express type extensions

/**
 * Middleware to authenticate JWT tokens and Base wallet tokens
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
      return;
    }

    // Check if it's a Base wallet token
    if (token.startsWith('base-wallet-token-') || token.startsWith('base-account-token-')) {
      // Extract wallet address from token
      const walletAddress = token.replace('base-wallet-token-', '').replace('base-account-token-', '');
      
      // Validate wallet address format (basic check)
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        res.status(401).json({
          error: 'Invalid Base wallet token',
          code: 'INVALID_BASE_TOKEN'
        });
        return;
      }

      // Attach Base wallet user to request
      (req as any).user = {
        id: `base-wallet-${walletAddress}`,
        email: `${walletAddress}@base.wallet`,
        userType: 'client' as const, // Default to client, can be updated based on profile
        walletAddress: walletAddress
      };

      logger.info('Base wallet user authenticated', {
        userId: walletAddress.slice(0, 6) + '...',
        component: 'auth',
        action: 'authenticate_base_wallet',
        metadata: {
          requestId: req.id,
          endpoint: req.path
        }
      });

      next();
      return;
    }

    // Verify traditional JWT token
    let decoded: JWTPayload;
    try {
      decoded = jwtService.verifyAccessToken(token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
      
      res.status(401).json({
        error: errorMessage,
        code: errorMessage.includes('expired') ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
      });
      return;
    }

    // Check if user still exists
    const user = await User.findById(decoded.userId).select('_id email userType isActive');
    if (!user) {
      res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        error: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
      return;
    }

    // Attach user to request
    (req as any).user = {
      id: user._id.toString(),
      email: user.email,
      userType: user.userType as any,
      walletAddress: user.walletAddress
    };

    logger.info('User authenticated', {
      userId: user._id.toString(),
      userType: user.userType,
      component: 'auth',
      action: 'authenticate',
      metadata: {
        requestId: req.id,
        endpoint: req.path
      }
    });

    next();
  } catch (error) {
    logger.error('Authentication middleware error', {
      component: 'auth',
      action: 'authenticate',
      error: error instanceof Error ? error : String(error),
      metadata: {
        requestId: req.id
      }
    });

    res.status(500).json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware to authorize specific user types (including base)
 */
export const authorize = (...allowedUserTypes: Array<'client' | 'lawyer' | 'base'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    if (!allowedUserTypes.includes(user.userType)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedUserTypes,
        current: user.userType
      });
      return;
    }

    logger.info('User authorized', {
      userId: user.id,
      userType: user.userType,
      component: 'auth',
      action: 'authorize',
      metadata: {
        requestId: req.id,
        allowedTypes: allowedUserTypes.join(',')
      }
    });

    next();
  };
};

/**
 * Middleware for optional authentication (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      // No token provided, continue without authentication
      next();
      return;
    }

    try {
      const decoded = jwtService.verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('_id email userType isActive');

      if (user && user.isActive) {
        (req as any).user = {
          id: user._id.toString(),
          email: user.email,
          userType: user.userType as any,
          walletAddress: user.walletAddress
        };

        logger.info('Optional auth successful', {
          userId: user._id.toString(),
          userType: user.userType,
          component: 'auth',
          action: 'optional_auth',
          metadata: {
            requestId: req.id
          }
        });
      }
    } catch (error) {
      // Token invalid or expired, continue without authentication
      logger.warn('Optional auth failed', {
        component: 'auth',
        action: 'optional_auth',
        error: error instanceof Error ? error : String(error),
        metadata: {
          requestId: req.id
        }
      });
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error', {
      component: 'auth',
      action: 'optional_auth',
      error: error instanceof Error ? error : String(error),
      metadata: {
        requestId: req.id
      }
    });

    // Don't fail the request, just continue without authentication
    next();
  }
};

/**
 * Middleware to check if user owns the resource
 */
export const checkResourceOwnership = (resourceUserIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

    if (!user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    if (user.id !== resourceUserId) {
      res.status(403).json({
        error: 'Access denied - resource ownership required',
        code: 'RESOURCE_ACCESS_DENIED'
      });
      return;
    }

    next();
  };
};

/**
 * Rate limiting for authentication endpoints
 */
export const authRateLimit = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const identifier = req.ip + (req.body.email || '');
    const now = Date.now();

    // Clean up expired entries
    for (const [key, value] of attempts.entries()) {
      if (now > value.resetTime) {
        attempts.delete(key);
      }
    }

    const userAttempts = attempts.get(identifier);

    if (!userAttempts) {
      attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (userAttempts.count >= maxAttempts) {
      const remainingTime = Math.ceil((userAttempts.resetTime - now) / 1000 / 60);
      res.status(429).json({
        error: 'Too many authentication attempts',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: `${remainingTime} minutes`
      });
      return;
    }

    userAttempts.count++;
    next();
  };
};