import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
  isSystemMessage: boolean;
}

export interface IChatRoom extends Document {
  matchId: string;
  clientId: string;
  lawyerId: string;
  messages: IMessage[];
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema({
  id: { type: String, required: true },
  senderId: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isSystemMessage: { type: Boolean, default: false }
});

const ChatRoomSchema = new Schema({
  matchId: { type: String, required: true, unique: true, index: true },
  clientId: { type: String, required: true, index: true },
  lawyerId: { type: String, required: true, index: true },
  messages: [MessageSchema],
  lastMessageAt: { type: Date }
}, {
  timestamps: true
});

ChatRoomSchema.index({ clientId: 1, updatedAt: -1 });
ChatRoomSchema.index({ lawyerId: 1, updatedAt: -1 });

export const ChatRoom = mongoose.model<IChatRoom>('ChatRoom', ChatRoomSchema);
