import mongoose, { Document, Schema } from 'mongoose';

// Message interface
export interface IMessage {
  _id: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'system';
  sentAt: Date;
  readBy: {
    userId: mongoose.Types.ObjectId;
    readAt: Date;
  }[];
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  replyTo?: mongoose.Types.ObjectId;
  reactions?: {
    userId: mongoose.Types.ObjectId;
    emoji: string;
    timestamp: Date;
  }[];
  isEdited?: boolean;
  editedAt?: Date;
  originalContent?: string;
}

// Chat interface
export interface IChat extends Document {
  _id: mongoose.Types.ObjectId;
  matchId: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  messages: IMessage[];
  lastActivity: Date;
  isActive: boolean;
  settings: {
    notifications: boolean;
    encryption: boolean;
    autoDelete: boolean;
  };
  metadata: {
    totalMessages: number;
    lastMessage?: {
      content: string;
      sentAt: Date;
      senderId: mongoose.Types.ObjectId;
    };
    typingUsers: {
      userId: mongoose.Types.ObjectId;
      startedAt: Date;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Message schema
const MessageSchema = new Schema<IMessage>({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'image', 'document', 'audio', 'video', 'system'],
    default: 'text'
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  readBy: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    emoji: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  originalContent: String
});

// Chat schema
const ChatSchema = new Schema<IChat>({
  matchId: {
    type: Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [MessageSchema],
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    encryption: {
      type: Boolean,
      default: false
    },
    autoDelete: {
      type: Boolean,
      default: false
    }
  },
  metadata: {
    totalMessages: {
      type: Number,
      default: 0
    },
    lastMessage: {
      content: String,
      sentAt: Date,
      senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    typingUsers: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      startedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true
});

// Indexes
ChatSchema.index({ matchId: 1 });
ChatSchema.index({ participants: 1 });
ChatSchema.index({ lastActivity: -1 });
ChatSchema.index({ 'participants': 1, 'lastActivity': -1 });
ChatSchema.index({ 'participants': 1, 'isActive': 1 });
ChatSchema.index({ 'messages.sentAt': -1 });
ChatSchema.index({ 'messages.senderId': 1 });

// Middleware
ChatSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.metadata.totalMessages = this.messages.length;
    
    if (this.messages.length > 0) {
      const lastMessage = this.messages[this.messages.length - 1];
      this.metadata.lastMessage = {
        content: lastMessage.content,
        sentAt: lastMessage.sentAt,
        senderId: lastMessage.senderId
      };
    }
  }
  next();
});

// Export model
export const Chat = mongoose.model<IChat>('Chat', ChatSchema);