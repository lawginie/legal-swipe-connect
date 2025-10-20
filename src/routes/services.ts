import { Router, Request, Response } from 'express';
import { Service, Lawyer } from '../models';
import { authenticate, authorize } from '../middleware/auth';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

const router = Router();

// Get service by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid service ID' });
    }

    const service = await Service.findById(id)
      .populate({
        path: 'lawyerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName profilePicture location isVerified'
        }
      })
      .lean();

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    logger.error('Error fetching service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search services
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      minPrice, 
      maxPrice,
      location,
      query,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const searchQuery: Record<string, boolean | string | object> = { isActive: true };
    
    // Text search
    if (query) {
      searchQuery.$text = { $search: query.toString() };
    }

    // Filters
    if (category) {
      searchQuery.category = category;
    }

    if (featured === 'true') {
      searchQuery.featured = true;
    }

    if (minPrice || maxPrice) {
      searchQuery['price.amount'] = {};
      if (minPrice) searchQuery['price.amount'].$gte = Number(minPrice);
      if (maxPrice) searchQuery['price.amount'].$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    let sortOptions: Record<string, number | object> = {};
    if (query) {
      sortOptions = { score: { $meta: 'textScore' } };
    } else {
      sortOptions[sortBy.toString()] = sortOrder === 'desc' ? -1 : 1;
    }

    const aggregationPipeline: Record<string, object>[] = [
      { $match: searchQuery },
      {
        $lookup: {
          from: 'lawyers',
          localField: 'lawyerId',
          foreignField: '_id',
          as: 'lawyer'
        }
      },
      { $unwind: '$lawyer' },
      {
        $lookup: {
          from: 'users',
          localField: 'lawyer.userId',
          foreignField: '_id',
          as: 'lawyer.user'
        }
      },
      { $unwind: '$lawyer.user' }
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
                  { $pow: [{ $subtract: ['$lawyer.user.location.coordinates.0', lng] }, 2] },
                  { $pow: [{ $subtract: ['$lawyer.user.location.coordinates.1', lat] }, 2] }
                ]
              }
            }
          }
        });
        sortOptions = { distance: 1 };
      }
    }

    aggregationPipeline.push(
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          category: 1,
          price: 1,
          duration: 1,
          deliverables: 1,
          tags: 1,
          featured: 1,
          images: 1,
          rating: 1,
          reviews: 1,
          location: 1,
          createdAt: 1,
          lawyer: {
            _id: 1,
            specializations: 1,
            rating: 1,
            responseTime: 1,
            user: {
              firstName: 1,
              lastName: 1,
              profilePicture: 1,
              location: 1,
              isVerified: 1
            }
          },
          distance: 1
        }
      }
    );

    const [services, total] = await Promise.all([
      Service.aggregate(aggregationPipeline),
      Service.countDocuments(searchQuery)
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
    logger.error('Error searching services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create service (authenticated lawyer)
router.post('/', authenticate, authorize(['lawyer']), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Get lawyer profile
    const lawyer = await Lawyer.findOne({ userId });
    if (!lawyer) {
      return res.status(404).json({ error: 'Lawyer profile not found' });
    }

    const serviceData = {
      lawyerId: lawyer._id,
      ...req.body
    };

    const service = new Service(serviceData);
    await service.save();

    const populatedService = await Service.findById(service._id)
      .populate({
        path: 'lawyerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName profilePicture'
        }
      })
      .lean();

    logger.info(`Service created by lawyer ${lawyer._id}`);
    res.status(201).json(populatedService);
  } catch (error) {
    logger.error('Error creating service:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update service (authenticated lawyer)
router.put('/:id', authenticate, authorize(['lawyer']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid service ID' });
    }

    // Get lawyer profile
    const lawyer = await Lawyer.findOne({ userId });
    if (!lawyer) {
      return res.status(404).json({ error: 'Lawyer profile not found' });
    }

    const service = await Service.findOneAndUpdate(
      { _id: id, lawyerId: lawyer._id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate({
      path: 'lawyerId',
      populate: {
        path: 'userId',
        select: 'firstName lastName profilePicture'
      }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found or unauthorized' });
    }

    logger.info(`Service ${id} updated by lawyer ${lawyer._id}`);
    res.json(service);
  } catch (error) {
    logger.error('Error updating service:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete service (authenticated lawyer)
router.delete('/:id', authenticate, authorize(['lawyer']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid service ID' });
    }

    // Get lawyer profile
    const lawyer = await Lawyer.findOne({ userId });
    if (!lawyer) {
      return res.status(404).json({ error: 'Lawyer profile not found' });
    }

    const service = await Service.findOneAndDelete({ 
      _id: id, 
      lawyerId: lawyer._id 
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found or unauthorized' });
    }

    logger.info(`Service ${id} deleted by lawyer ${lawyer._id}`);
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    logger.error('Error deleting service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get my services (authenticated lawyer)
router.get('/my/services', authenticate, authorize(['lawyer']), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10, status } = req.query;
    
    // Get lawyer profile
    const lawyer = await Lawyer.findOne({ userId });
    if (!lawyer) {
      return res.status(404).json({ error: 'Lawyer profile not found' });
    }

    const query: Record<string, string | boolean | object> = { lawyerId: lawyer._id };
    
    if (status) {
      query.isActive = status === 'active';
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
    logger.error('Error fetching my services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle service status (authenticated lawyer)
router.patch('/:id/toggle-status', authenticate, authorize(['lawyer']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid service ID' });
    }

    // Get lawyer profile
    const lawyer = await Lawyer.findOne({ userId });
    if (!lawyer) {
      return res.status(404).json({ error: 'Lawyer profile not found' });
    }

    const service = await Service.findOne({ _id: id, lawyerId: lawyer._id });
    if (!service) {
      return res.status(404).json({ error: 'Service not found or unauthorized' });
    }

    service.isActive = !service.isActive;
    await service.save();

    logger.info(`Service ${id} status toggled by lawyer ${lawyer._id}`);
    res.json({ 
      message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: service.isActive
    });
  } catch (error) {
    logger.error('Error toggling service status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get service categories (for filters)
router.get('/meta/categories', async (req: Request, res: Response) => {
  try {
    const categories = await Service.distinct('category');
    res.json({ categories: categories.filter(Boolean) });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get featured services
router.get('/featured/list', async (req: Request, res: Response) => {
  try {
    const { limit = 6 } = req.query;
    
    const services = await Service.find({ 
      isActive: true, 
      featured: true 
    })
      .populate({
        path: 'lawyerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName profilePicture location isVerified'
        }
      })
      .select('-__v')
      .sort({ rating: -1, createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.json({ services });
  } catch (error) {
    logger.error('Error fetching featured services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;