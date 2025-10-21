import { Router, Request, Response } from 'express';
import { Payment } from '../models/Payment.model';
import { logger } from '../../utils/logger';

const router = Router();

// POST /api/payments - Record a payment
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      clientId,
      lawyerId,
      serviceId,
      amount,
      currency,
      transactionHash,
      walletAddress,
      paymentMethod
    } = req.body;

    if (!clientId || !lawyerId || !serviceId || !amount || !walletAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const payment = await Payment.create({
      clientId,
      lawyerId,
      serviceId,
      amount,
      currency: currency || 'USDC',
      transactionHash,
      walletAddress,
      paymentMethod,
      status: transactionHash ? 'completed' : 'pending'
    });

    logger.info('Payment recorded', {
      action: 'payment_recorded',
      metadata: { 
        clientId, 
        lawyerId, 
        amount, 
        currency,
        status: payment.status 
      }
    });

    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error: any) {
    logger.error('Error recording payment:', {
      action: 'payment_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to record payment'
    });
  }
});

// GET /api/payments/client/:clientId - Get client's payment history
router.get('/client/:clientId', async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find({
      clientId: req.params.clientId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: payments
    });
  } catch (error: any) {
    logger.error('Error fetching client payments:', {
      action: 'client_payments_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments'
    });
  }
});

// GET /api/payments/lawyer/:lawyerId - Get lawyer's payment history
router.get('/lawyer/:lawyerId', async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find({
      lawyerId: req.params.lawyerId,
      status: 'completed'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: payments
    });
  } catch (error: any) {
    logger.error('Error fetching lawyer payments:', {
      action: 'lawyer_payments_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments'
    });
  }
});

// PATCH /api/payments/:id/status - Update payment status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, transactionHash } = req.body;

    if (!['pending', 'completed', 'failed', 'refunded'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const updateData: any = { status };
    if (transactionHash) {
      updateData.transactionHash = transactionHash;
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    logger.info('Payment status updated', {
      action: 'payment_status_updated',
      metadata: { paymentId: req.params.id, status }
    });

    res.json({
      success: true,
      data: payment
    });
  } catch (error: any) {
    logger.error('Error updating payment status:', {
      action: 'payment_update_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to update payment'
    });
  }
});

export default router;
