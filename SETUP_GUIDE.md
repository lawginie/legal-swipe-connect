# 🚀 LegalSwipe - Production-Ready MongoDB Setup Guide

## ✅ What's Been Created

### Database Models (MongoDB)
1. **Lawyer** - All 30 lawyer profiles with services
2. **User** - Client/Lawyer user accounts
3. **Swipe** - Swipe history and preferences
4. **Match** - Matched connections between clients and lawyers
5. **ChatRoom** - Chat conversations with AI responses
6. **Payment** - USDC/ETH payment tracking

### API Endpoints
- `/api/lawyers` - Browse and filter lawyers
- `/api/swipes` - Record swipes and preferences
- `/api/matches` - View matches
- `/api/chats` - Real-time chat with AI lawyer bots
- `/api/payments` - Payment processing and history
- `/api/users` - User management

### Features Implemented
✅ All 30 mock lawyers as system profiles
✅ AI chatbot with context-aware responses
✅ Auto-matching on right swipe
✅ Real-time chat functionality
✅ Payment tracking (USDC/ETH)
✅ Swipe history and filtering
✅ Rate limiting and security
✅ Structured logging

## 📋 Setup Instructions

### Step 1: Install MongoDB

#### Option A: Local Installation
**Windows:**
```bash
# Download from: https://www.mongodb.com/try/download/community
# Install and add to PATH
```

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### Option B: Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Option C: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `.env` with Atlas URI

### Step 2: Configure Environment
```bash
# Copy the .env file (already created)
# Update MONGODB_URI if using Atlas or different host
```

### Step 3: Seed the Database
```bash
npm run seed
```

This will:
- Connect to MongoDB
- Clear existing system profiles
- Insert all 30 lawyer profiles with services
- Set up proper indexes

### Step 4: Start the API Server
```bash
npm run dev:api
```

The API will be available at: `http://localhost:3001`

### Step 5: Start the Frontend
```bash
# In a new terminal
npm run dev
```

The app will be at: `http://localhost:8080`

## 🔧 Development Workflow

### Running Both Servers
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - API
npm run dev:api
```

### Testing the API
```bash
# Health check
curl http://localhost:3001/api/health

# Get all lawyers
curl http://localhost:3001/api/lawyers

# Get lawyers by specialization
curl http://localhost:3001/api/lawyers/specialization/Bail%20Application

# Get specific lawyer
curl http://localhost:3001/api/lawyers/bail-1
```

## 📊 Database Collections

### Lawyers Collection (30 system profiles)
```javascript
{
  profileId: "bail-1",
  name: "Marcus Bailey",
  specialization: "Bail Application",
  rating: 4.9,
  services: [...],
  isSystemProfile: true  // AI chatbot enabled
}
```

### Swipes Collection
```javascript
{
  clientId: "user-123",
  lawyerId: "bail-1",
  swipedRight: true,
  createdAt: "2025-01-..."
}
```

### Matches Collection
```javascript
{
  clientId: "user-123",
  lawyerId: "bail-1",
  chatRoomId: ObjectId("..."),
  createdAt: "2025-01-..."
}
```

### ChatRooms Collection
```javascript
{
  matchId: "match-123",
  clientId: "user-123",
  lawyerId: "bail-1",
  messages: [
    {
      id: "msg-1",
      senderId: "user-123",
      content: "I need help with bail",
      isSystemMessage: false,
      createdAt: "2025-01-..."
    },
    {
      id: "msg-2",
      senderId: "bail-1",
      content: "I can help you with that...",
      isSystemMessage: true,  // AI response
      createdAt: "2025-01-..."
    }
  ]
}
```

## 🤖 AI Chatbot Features

The API automatically generates context-aware responses for system lawyers:

**Triggers:**
- Bail keywords → Bail application info
- Debt keywords → Debt resolution advice
- Maintenance keywords → Child support info
- Cost keywords → Pricing information
- Greetings → Professional introduction

**Response Delay:** 1-2 seconds (natural feel)

## 💰 Payment Integration

### Recording Payments
```javascript
POST /api/payments
{
  "clientId": "user-123",
  "lawyerId": "bail-1",
  "serviceId": "bail-1-1",
  "amount": 5000,
  "currency": "USDC",
  "transactionHash": "0x123...",
  "walletAddress": "0xabc...",
  "paymentMethod": "usdc"
}
```

### Payment Status
- `pending` - Payment initiated
- `completed` - Transaction confirmed
- `failed` - Payment failed
- `refunded` - Payment refunded

## 🔒 Security Features

✅ Rate limiting (100 requests / 15 min)
✅ Helmet.js security headers
✅ CORS configuration
✅ Input validation
✅ JWT authentication ready
✅ Structured logging

## 📈 Production Deployment

### MongoDB Atlas Setup
1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Whitelist your IP or allow all (0.0.0.0/0)
3. Create database user
4. Get connection string
5. Update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/legalswipe?retryWrites=true&w=majority
```

### Environment Variables
```env
NODE_ENV=production
MONGODB_URI=<your-atlas-uri>
JWT_SECRET=<strong-secret-key>
CORS_ORIGIN=https://your-domain.com
PORT=3001
```

### Deployment Checklist
- [ ] Set strong JWT_SECRET
- [ ] Configure production CORS_ORIGIN
- [ ] Run `npm run seed` on production database
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Set NODE_ENV=production
- [ ] Configure proper logging service
- [ ] Set up monitoring (e.g., MongoDB Atlas monitoring)
- [ ] Enable authentication middleware
- [ ] Configure SSL/TLS

## 🧪 Testing

### Manual API Testing
```bash
# Install HTTPie (optional)
brew install httpie

# Test lawyers endpoint
http GET http://localhost:3001/api/lawyers

# Test with filters
http GET "http://localhost:3001/api/lawyers?specialization=Bail Application&minRating=4.5"

# Create swipe
http POST http://localhost:3001/api/swipes clientId=test-123 lawyerId=bail-1 swipedRight:=true

# Get matches
http GET http://localhost:3001/api/matches/test-123
```

## 📚 API Documentation

Full API documentation available in `API_README.md`

## 🆘 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongo --version
mongosh

# Check connection
mongosh "mongodb://localhost:27017/legalswipe"
```

### Port Already in Use
```bash
# Kill process on port 3001
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### Seed Errors
```bash
# Clear database and re-seed
mongosh legalswipe --eval "db.dropDatabase()"
npm run seed
```

## 🎉 You're Ready!

Your production-ready LegalSwipe app now has:
- ✅ Full MongoDB database
- ✅ 30 AI lawyer chatbots
- ✅ Real-time matching system
- ✅ Payment tracking
- ✅ Professional API with all features

Start both servers and enjoy! 🚀
