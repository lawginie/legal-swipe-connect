import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { Lawyer } from '../models/Lawyer';
import { jwtService } from '../utils/jwt';
import { authenticate, authRateLimit } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true };
};

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post('/register', authRateLimit(3, 15 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      userType,
      phoneNumber,
      dateOfBirth,
      location
    } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !userType) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['email', 'password', 'firstName', 'lastName', 'userType']
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: passwordValidation.message
      });
    }

    if (!['client', 'lawyer'].includes(userType)) {
      return res.status(400).json({
        error: 'Invalid user type. Must be either "client" or "lawyer"'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email already exists'
      });
    }

    // Create user
    const userData: Partial<IUser> = {
      email: email.toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      userType,
      phoneNumber: phoneNumber?.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      location: location ? {
        address: location.address?.trim(),
        city: location.city?.trim(),
        state: location.state?.trim(),
        country: location.country?.trim(),
        zipCode: location.zipCode?.trim(),
        coordinates: location.coordinates ? {
          type: 'Point',
          coordinates: [location.coordinates.longitude, location.coordinates.latitude]
        } : undefined
      } : undefined,
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        privacy: {
          showLocation: true,
          showAge: true,
          showPhone: false
        }
      }
    };

    const user = new User(userData);
    await user.save();

    // If user is a lawyer, create lawyer profile
    if (userType === 'lawyer') {
      const lawyerProfile = new Lawyer({
        userId: user._id,
        specializations: [],
        experience: 0,
        education: [],
        certifications: [],
        languages: ['English'],
        hourlyRate: 0,
        availability: {
          monday: { available: false, hours: [] },
          tuesday: { available: false, hours: [] },
          wednesday: { available: false, hours: [] },
          thursday: { available: false, hours: [] },
          friday: { available: false, hours: [] },
          saturday: { available: false, hours: [] },
          sunday: { available: false, hours: [] }
        },
        practiceAreas: [],
        isVerifiedLawyer: false,
        acceptsNewClients: true
      });
      await lawyerProfile.save();
    }

    // Generate tokens
    const tokens = jwtService.generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      userType: user.userType
    });

    logger.info('User registered successfully', {
      userId: user._id.toString(),
      userType: user.userType,
      component: 'auth',
      action: 'register',
      metadata: {
        email: user.email
      }
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      },
      tokens
    });

  } catch (error) {
    logger.error('Registration failed', {
      component: 'auth',
      action: 'register',
      error: error instanceof Error ? error : String(error),
      metadata: {
        requestId: req.id
      }
    });

    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
});

/**
 * POST /api/v1/auth/login
 * User login
 */
router.post('/login', authRateLimit(5, 15 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const tokens = jwtService.generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      userType: user.userType
    });

    logger.info('User logged in successfully', {
      userId: user._id.toString(),
      userType: user.userType,
      component: 'auth',
      action: 'login',
      metadata: {
        email: user.email
      }
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified,
        profilePicture: user.profilePicture,
        lastLoginAt: user.lastLoginAt
      },
      tokens
    });

  } catch (error) {
    logger.error('Login failed', {
      component: 'auth',
      action: 'login',
      error: error instanceof Error ? error : String(error),
      metadata: {
        requestId: req.id
      }
    });

    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token is required'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwtService.verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        error: 'Invalid or expired refresh token'
      });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'User not found or account deactivated'
      });
    }

    // Generate new tokens
    const tokens = jwtService.generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      userType: user.userType
    });

    logger.info('Token refreshed successfully', {
      userId: user._id,
      userType: user.userType
    });

    res.json({
      message: 'Token refreshed successfully',
      tokens
    });

  } catch (error) {
    logger.error('Token refresh failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestId: req.id
    });

    res.status(500).json({
      error: 'Token refresh failed'
    });
  }
});

/**
 * POST /api/v1/auth/logout
 * User logout (invalidate tokens)
 */
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    // In a production app, you might want to maintain a blacklist of tokens
    // For now, we'll just log the logout event
    
    logger.info('User logged out', {
      userId: req.user?.id,
      userType: req.user?.userType
    });

    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId: req.id
    });

    res.status(500).json({
      error: 'Logout failed'
    });
  }
});

/**
 * GET /api/v1/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id)
      .populate('location')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Get lawyer profile if user is a lawyer
    let lawyerProfile = null;
    if (user.userType === 'lawyer') {
      lawyerProfile = await Lawyer.findOne({ userId: user._id });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        profilePicture: user.profilePicture,
        bio: user.bio,
        location: user.location,
        preferences: user.preferences,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      ...(lawyerProfile && { lawyerProfile })
    });

  } catch (error) {
    logger.error('Failed to get user profile', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id,
      requestId: req.id
    });

    res.status(500).json({
      error: 'Failed to get user profile'
    });
  }
});

/**
 * POST /api/v1/auth/change-password
 * Change user password
 */
router.post('/change-password', authenticate, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required'
      });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: passwordValidation.message
      });
    }

    // Find user with password
    const user = await User.findById(req.user?.id).select('+password');
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info('Password changed successfully', {
      userId: user._id,
      userType: user.userType
    });

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Password change failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id,
      requestId: req.id
    });

    res.status(500).json({
      error: 'Password change failed'
    });
  }
});

export default router;