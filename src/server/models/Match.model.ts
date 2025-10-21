import mongoose, { Schema, Document } from 'mongoose';

export interface IMatch extends Document {
  clientId: string;
  lawyerId: string;
  chatRoomId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema({
  clientId: { type: String, required: true, index: true },
  lawyerId: { type: String, required: true, index: true },
  chatRoomId: { type: Schema.Types.ObjectId, ref: 'ChatRoom' }
}, {
  timestamps: true
});

// Compound index to prevent duplicate matches
MatchSchema.index({ clientId: 1, lawyerId: 1 }, { unique: true });

export const Match = mongoose.model<IMatch>('Match', MatchSchema);
