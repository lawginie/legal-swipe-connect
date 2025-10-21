import { Router, Request, Response } from 'express';
import { Lawyer, Service, User } from '../models';
import { authenticate, authorize } from '../middleware/auth';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

const router = Router();

// Get lawyer profile by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid lawyer ID' });
    }

    const lawyer = await Lawyer.findById(id)
      .populate('userId', 'firstName lastName email profilePicture location isVerified')
      .lean();

    if (!lawyer) {
      return res.status(404).json({ error: 'Lawyer not found' });
    }

    // Get lawyer's services
    const services = await Service.find({ 
      lawyerId: id, 
      isActive: true 
    }).select('-__v').lean();

    res.json({
      lawyer,
      services,
      totalServices: services.length
    });
  } catch (error) {
    logger.error('Error fetching lawyer profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get lawyer's services
router.get('/:id/services', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, category, minPrice, maxPrice } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid lawyer ID' });
    }

    const query: Record<string, string | boolean | object> = { 
      lawyerId: id, 
      isActive: true 
    };

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query['price.amount'] = {};
      if (minPrice) query['price.amount'].$gte = Number(minPrice);
      if (maxPrice) query['price.amount'].$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [services, total] = await Promise.all([
      Service.find(query)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Service.countDocuments(query)
    ]);

    res.json({
      services,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching lawyer services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search lawyers
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      specialization, 
      location, 
      minRating, 
      maxHourlyRate,
      experience,
      language,
      availability,
      query
    } = req.query;

    const searchQuery: Record<string, boolean | string | object | Array<object>> = { isVerifiedLawyer: true };
    
    // Text search
    if (query) {
      searchQuery.$or = [
        { specializations: { $regex: query, $options: 'i' } },
        { practiceAreas: { $regex: query, $options: 'i' } },
        { firmName: { $regex: query, $options: 'i' } }
      ];
    }

    // Filters
    if (specialization) {
      searchQuery.specializations = { $in: [specialization] };
    }

    if (minRating) {
      searchQuery.rating = { $gte: Number(minRating) };
    }

    if (maxHourlyRate) {
      searchQuery.hourlyRate = { $lte: Number(maxHourlyRate) };
    }

    if (experience) {
      searchQuery.yearsOfPractice = { $gte: Number(experience) };
    }

    if (language) {
      searchQuery.languages = { $in: [language] };
    }

    if (availability) {
      searchQuery.availability = availability;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const aggregationPipeline: Record<string, object>[] = [
      { $match: searchQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ];

    // Location-based search
    if (location) {
      const [lat, lng] = location.toString().split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        aggregationPipeline.push({
          $addFields: {
            distance: {
              $sqrt: {
                $add: [
                  { $pow: [{ $subtract: ['$user.location.coordinates.0', lng] }, 2] },
                  { $pow: [{ $subtract: ['$user.location.coordinates.1', lat] }, 2] }
                ]
              }
            }
          }
        });
        aggregationPipeline.push({ $sort: { distance: 1 } });
      }
    } else {
      aggregationPipeline.push({ $sort: { rating: -1, createdAt: -1 } });
    }

    aggregationPipeline.push(
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $project: {
          _id: 1,
          userId: 1,
          barNumber: 1,
          specializations: 1,
          experience: 1,
          hourlyRate: 1,
          rating: 1,
          isVerifiedLawyer: 1,
          consultationFee: 1,
          acceptsNewClients: 1,
          responseTime: 1,
          practiceAreas: 1,
          firmName: 1,
          yearsOfPractice: 1,
          languages: 1,
          availability: 1,
          user: {
            firstName: 1,
            lastName: 1,
            profilePicture: 1,
            location: 1,
            isVerified: 1
          },
          distance: 1
        }
      }
    );

    const [lawyers, total] = await Promise.all([
      Lawyer.aggregate(aggregationPipeline),
      Lawyer.countDocuments(searchQuery)
    ]);

    res.json({
      lawyers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Error searching lawyers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create lawyer profile (authenticated)
router.post('/profile', authenticate, authorize(['lawyer']), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Check if lawyer profile already exists
    const existingLawyer = await Lawyer.findOne({ userId });
    if (existingLawyer) {
      return res.status(400).json({ error: 'Lawyer profile already exists' });
    }

    const lawyerData = {
      userId,
      ...req.body
    };

    const lawyer = new Lawyer(lawyerData);
    await lawyer.save();

    const populatedLawyer = await Lawyer.findById(lawyer._id)
      .populate('userId', 'firstName lastName email profilePicture')
      .lean();

    logger.info(`Lawyer profile created for user ${userId}`);
    res.status(201).json(populatedLawyer);
  } catch (error) {
    logger.error('Error creating lawyer profile:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update lawyer profile (authenticated)
router.put('/profile', authenticate, authorize(['lawyer']), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const lawyer = await Lawyer.findOneAndUpdate(
      { userId },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email profilePicture');

    if (!lawyer) {
      return res.status(404).json({ error: 'Lawyer profile not found' });
    }

    logger.info(`Lawyer profile updated for user ${userId}`);
    res.json(lawyer);
  } catch (error) {
    logger.error('Error updating lawyer profile:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get my lawyer profile (authenticated)
router.get('/profile/me', authenticate, authorize(['lawyer']), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const lawyer = await Lawyer.findOne({ userId })
      .populate('userId', 'firstName lastName email profilePicture location')
      .lean();

    if (!lawyer) {
      return res.status(404).json({ error: 'Lawyer profile not found' });
    }

    // Get lawyer's services
    const services = await Service.find({ lawyerId: lawyer._id }).lean();

    res.json({
      lawyer,
      services,
      totalServices: services.length
    });
  } catch (error) {
    logger.error('Error fetching lawyer profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get lawyer specializations (for filters)
router.get('/meta/specializations', async (req: Request, res: Response) => {
  try {
    const specializations = await Lawyer.distinct('specializations');
    res.json({ specializations: specializations.filter(Boolean) });
  } catch (error) {
    logger.error('Error fetching specializations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get lawyer practice areas (for filters)
router.get('/meta/practice-areas', async (req: Request, res: Response) => {
  try {
    const practiceAreas = await Lawyer.distinct('practiceAreas');
    res.json({ practiceAreas: practiceAreas.filter(Boolean) });
  } catch (error) {
    logger.error('Error fetching practice areas:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;