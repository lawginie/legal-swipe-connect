import { Router, Request, Response } from 'express';
import { UserProfile } from '../models/UserProfile.model';
import { logger } from '../../utils/logger';

const router = Router();

// GET /api/profile/:userId - Get user profile
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    let profile = await UserProfile.findOne({ userId: req.params.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    logger.error('Error fetching profile:', {
      action: 'profile_fetch_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// POST /api/profile - Create or update profile
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      fullName,
      email,
      phone,
      bio,
      profileImageUrl,
      location,
      dateOfBirth,
      gender,
      languages,
      preferredSpecializations,
      settings
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    let profile = await UserProfile.findOne({ userId });

    if (profile) {
      // Update existing profile
      if (fullName) profile.fullName = fullName;
      if (email) profile.email = email;
      if (phone) profile.phone = phone;
      if (bio !== undefined) profile.bio = bio;
      if (profileImageUrl) profile.profileImageUrl = profileImageUrl;
      if (location) profile.location = location;
      if (dateOfBirth) profile.dateOfBirth = dateOfBirth;
      if (gender) profile.gender = gender;
      if (languages) profile.languages = languages;
      if (preferredSpecializations) profile.preferredSpecializations = preferredSpecializations;
      if (settings) profile.settings = { ...profile.settings, ...settings };

      // Check if profile is complete
      const isComplete = !!(
        profile.fullName &&
        profile.email &&
        profile.location &&
        profile.bio
      );

      if (isComplete && !profile.completedAt) {
        profile.completedAt = new Date();
      }

      await profile.save();

      logger.info('Profile updated', {
        action: 'profile_updated',
        metadata: { userId }
      });
    } else {
      // Create new profile
      profile = await UserProfile.create({
        userId,
        fullName: fullName || 'User',
        email,
        phone,
        bio,
        profileImageUrl,
        location,
        dateOfBirth,
        gender,
        languages: languages || [],
        preferredSpecializations: preferredSpecializations || [],
        settings: settings || {
          notifications: true,
          emailUpdates: true,
          smsUpdates: false,
          marketingConsent: false
        }
      });

      logger.info('Profile created', {
        action: 'profile_created',
        metadata: { userId }
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    logger.error('Error saving profile:', {
      action: 'profile_save_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to save profile'
    });
  }
});

// PATCH /api/profile/:userId/settings - Update profile settings
router.patch('/:userId/settings', async (req: Request, res: Response) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.params.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    profile.settings = { ...profile.settings, ...req.body };
    await profile.save();

    logger.info('Profile settings updated', {
      action: 'profile_settings_updated',
      metadata: { userId: req.params.userId }
    });

    res.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to update settings'
    });
  }
});

// PATCH /api/profile/:userId/verification - Update verification status
router.patch('/:userId/verification', async (req: Request, res: Response) => {
  try {
    const { email, phone, identity } = req.body;

    const profile = await UserProfile.findOne({ userId: req.params.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    if (email !== undefined) profile.verificationStatus.email = email;
    if (phone !== undefined) profile.verificationStatus.phone = phone;
    if (identity !== undefined) profile.verificationStatus.identity = identity;

    await profile.save();

    logger.info('Verification status updated', {
      action: 'verification_updated',
      metadata: { userId: req.params.userId }
    });

    res.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to update verification'
    });
  }
});

export default router;
