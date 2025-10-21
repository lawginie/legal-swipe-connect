import mongoose, { Schema, Document } from 'mongoose';

export interface ISwipe extends Document {
  clientId: string;
  lawyerId: string;
  swipedRight: boolean;
  createdAt: Date;
}

const SwipeSchema = new Schema({
  clientId: { type: String, required: true, index: true },
  lawyerId: { type: String, required: true, index: true },
  swipedRight: { type: Boolean, required: true }
}, {
  timestamps: true
});

// Compound index to prevent duplicate swipes
SwipeSchema.index({ clientId: 1, lawyerId: 1 }, { unique: true });
SwipeSchema.index({ createdAt: -1 });

export const Swipe = mongoose.model<ISwipe>('Swipe', SwipeSchema);
