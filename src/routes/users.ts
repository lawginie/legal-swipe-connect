import express, { Request, Response } from 'express';
import { User } from '../models/User';
import { Lawyer } from '../models/Lawyer';
import { authenticate, authorize, checkResourceOwnership } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * GET /api/v1/users/:userId
 * Get user profile by ID
 */
router.get('/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password')
      .populate('location');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(404).json({
        error: 'User account is deactivated'
      });
    }

    // Get lawyer profile if user is a lawyer
    let lawyerProfile = null;
    if (user.userType === 'lawyer') {
      lawyerProfile = await Lawyer.findOne({ userId: user._id });
    }

    // Return limited info for other users, full info for own profile
    const isOwnProfile = req.user?.id === userId;
    
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      profilePicture: user.profilePicture,
      bio: user.bio,
      createdAt: user.createdAt,
      ...(isOwnProfile && {
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        location: user.location,
        preferences: user.preferences,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        lastLoginAt: user.lastLoginAt,
        updatedAt: user.updatedAt
      }),
      ...(user.preferences?.privacy?.showLocation && user.location && {
        location: {
          city: user.location.city,
          state: user.location.state,
          country: user.location.country
        }
      }),
      ...(user.preferences?.privacy?.showAge && user.dateOfBirth && {
        age: Math.floor((Date.now() - user.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      })
    };

    res.json({
      user: userResponse,
      ...(lawyerProfile && { lawyerProfile })
    });

  } catch (error) {
    logger.error('Failed to get user profile', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.params.userId,
      requestId: req.id
    });

    res.status(500).json({
      error: 'Failed to get user profile'
    });
  }
});

/**
 * PUT /api/v1/users/:userId
 * Update user profile
 */
router.put('/:userId', authenticate, checkResourceOwnership('userId'), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated via this endpoint
    delete updates.email;
    delete updates.password;
    delete updates.userType;
    delete updates.isEmailVerified;
    delete updates.isPhoneVerified;
    delete updates.isActive;
    delete updates.createdAt;
    delete updates.updatedAt;

    // Validate and sanitize updates
    const allowedUpdates = [
      'firstName',
      'lastName',
      'phoneNumber',
      'dateOfBirth',
      'profilePicture',
      'bio',
      'location',
      'preferences'
    ];

    const updateData: Record<string, string | Date | object | undefined> = {};
    
    for (const field of allowedUpdates) {
      if (updates[field] !== undefined) {
        if (field === 'firstName' || field === 'lastName') {
          updateData[field] = updates[field]?.trim();
        } else if (field === 'phoneNumber') {
          updateData[field] = updates[field]?.trim();
        } else if (field === 'dateOfBirth') {
          updateData[field] = new Date(updates[field]);
        } else if (field === 'bio') {
          updateData[field] = updates[field]?.trim().substring(0, 500); // Limit bio length
        } else if (field === 'location') {
          updateData[field] = {
            address: updates[field].address?.trim(),
            city: updates[field].city?.trim(),
            state: updates[field].state?.trim(),
            country: updates[field].country?.trim(),
            zipCode: updates[field].zipCode?.trim(),
            coordinates: updates[field].coordinates ? {
              type: 'Point',
              coordinates: [
                updates[field].coordinates.longitude,
                updates[field].coordinates.latitude
              ]
            } : undefined
          };
        } else {
          updateData[field] = updates[field];
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    logger.info('User profile updated', {
      userId: user._id,
      updatedFields: Object.keys(updateData)
    });

    res.json({
      message: 'Profile updated successfully',
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
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    logger.error('Failed to update user profile', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.params.userId,
      requestId: req.id
    });

    res.status(500).json({
      error: 'Failed to update profile'
    });
  }
});

/**
 * DELETE /api/v1/users/:userId
 * Deactivate user account
 */
router.delete('/:userId', authenticate, checkResourceOwnership('userId'), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    logger.info('User account deactivated', {
      userId: user._id,
      userType: user.userType
    });

    res.json({
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    logger.error('Failed to deactivate user account', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.params.userId,
      requestId: req.id
    });

    res.status(500).json({
      error: 'Failed to deactivate account'
    });
  }
});

/**
 * POST /api/v1/users/:userId/upload-avatar
 * Upload user profile picture
 */
router.post('/:userId/upload-avatar', authenticate, checkResourceOwnership('userId'), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        error: 'Image URL is required'
      });
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      return res.status(400).json({
        error: 'Invalid image URL format'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: imageUrl },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    logger.info('Profile picture updated', {
      userId: user._id,
      imageUrl
    });

    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture
    });

  } catch (error) {
    logger.error('Failed to update profile picture', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.params.userId,
      requestId: req.id
    });

    res.status(500).json({
      error: 'Failed to update profile picture'
    });
  }
});

/**
 * GET /api/v1/users/search
 * Search users (for admin or matching purposes)
 */
router.get('/search', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      query,
      userType,
      location,
      page = 1,
      limit = 20
    } = req.query;

    const searchCriteria: Record<string, boolean | object | string> = {
      isActive: true
    };

    // Add search filters
    if (query) {
      searchCriteria.$or = [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ];
    }

    if (userType && ['client', 'lawyer'].includes(userType as string)) {
      searchCriteria.userType = userType;
    }

    if (location) {
      searchCriteria['location.city'] = { $regex: location, $options: 'i' };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(searchCriteria)
      .select('firstName lastName userType profilePicture bio location createdAt')
      .limit(limitNum)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(searchCriteria);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    logger.error('User search failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId: req.id
    });

    res.status(500).json({
      error: 'Search failed'
    });
  }
});

export default router;