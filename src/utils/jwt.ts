import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { logger } from './logger';

export interface JWTPayload {
  userId: string;
  email: string;
  userType: 'client' | 'lawyer';
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class JWTService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string = '15m';
  private readonly refreshTokenExpiry: string = '7d';

  constructor() {
    this.accessTokenSecret = config.jwtSecret;
    this.refreshTokenSecret = config.jwtSecret + '_refresh';
  }

  /**
   * Generate access and refresh token pair
   */
  public generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>): TokenPair {
    try {
      const accessToken = jwt.sign(
        payload,
        this.accessTokenSecret,
        {
          expiresIn: this.accessTokenExpiry,
          issuer: 'legal-swipe-connect',
          audience: 'legal-swipe-connect-users'
        }
      );

      const refreshToken = jwt.sign(
        { userId: payload.userId },
        this.refreshTokenSecret,
        {
          expiresIn: this.refreshTokenExpiry,
          issuer: 'legal-swipe-connect',
          audience: 'legal-swipe-connect-users'
        }
      );

      logger.info('Token pair generated', { 
        userId: payload.userId,
        userType: payload.userType 
      });

      return { accessToken, refreshToken };
    } catch (error) {
      logger.error('Failed to generate token pair', { error, userId: payload.userId });
      throw new Error('Token generation failed');
    }
  }

  /**
   * Generate access token only
   */
  public generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    try {
      return jwt.sign(
        payload,
        this.accessTokenSecret,
        {
          expiresIn: this.accessTokenExpiry,
          issuer: 'legal-swipe-connect',
          audience: 'legal-swipe-connect-users'
        }
      );
    } catch (error) {
      logger.error('Failed to generate access token', { error, userId: payload.userId });
      throw new Error('Access token generation failed');
    }
  }

  /**
   * Verify access token
   */
  public verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'legal-swipe-connect',
        audience: 'legal-swipe-connect-users'
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      } else {
        logger.error('Access token verification failed', { error });
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Verify refresh token
   */
  public verifyRefreshToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'legal-swipe-connect',
        audience: 'legal-swipe-connect-users'
      }) as { userId: string };

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      } else {
        logger.error('Refresh token verification failed', { error });
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  public decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      logger.error('Failed to decode token', { error });
      return null;
    }
  }

  /**
   * Get token expiration time
   */
  public getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      logger.error('Failed to get token expiration', { error });
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  public isTokenExpired(token: string): boolean {
    try {
      const expiration = this.getTokenExpiration(token);
      if (!expiration) return true;
      return expiration.getTime() < Date.now();
    } catch (error) {
      return true;
    }
  }

  /**
   * Extract token from Authorization header
   */
  public extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }
}

export const jwtService = new JWTService();