import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  clientId: string;
  lawyerId: string;
  serviceId: string;
  amount: number;
  currency: string;
  transactionHash?: string;
  walletAddress: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'usdc' | 'eth' | 'card';
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema({
  clientId: { type: String, required: true, index: true },
  lawyerId: { type: String, required: true, index: true },
  serviceId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'USDC' },
  transactionHash: { type: String, sparse: true, index: true },
  walletAddress: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending',
    index: true
  },
  paymentMethod: { 
    type: String, 
    enum: ['usdc', 'eth', 'card'], 
    required: true 
  }
}, {
  timestamps: true
});

PaymentSchema.index({ clientId: 1, createdAt: -1 });
PaymentSchema.index({ lawyerId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
