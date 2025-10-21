# 🎉 MongoDB Production Setup - COMPLETE!

## ✅ What Was Created

### 1. Database Models (`src/server/models/`)
- **Lawyer.model.ts** - 30 system lawyer profiles with services
- **User.model.ts** - Client and lawyer user accounts
- **Swipe.model.ts** - Swipe history with unique constraints
- **Match.model.ts** - Matched connections
- **ChatRoom.model.ts** - Chat messages with AI responses
- **Payment.model.ts** - USDC/ETH payment tracking

### 2. API Routes (`src/server/api/`)
- **lawyers.routes.ts** - Browse, filter, search lawyers
- **swipes.routes.ts** - Record swipes, create auto-matches
- **matches.routes.ts** - Get matches, unmatch
- **chats.routes.ts** - Real-time chat with AI bot responses
- **payments.routes.ts** - Payment tracking and history
- **users.routes.ts** - User management and profiles

### 3. Database Configuration
- **database.ts** - MongoDB connection with error handling
- **lawyers.seed.ts** - Seed script for all 30 lawyer profiles
- **seed.ts** - Main seeding script

### 4. Documentation
- **API_README.md** - Complete API endpoint documentation
- **SETUP_GUIDE.md** - Step-by-step production deployment guide
- **.env** - Pre-configured environment variables
- **.env.example** - Environment template

## 🚀 Quick Start

### 1. Install MongoDB
```bash
# Option A: Docker (easiest)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Option B: Local install
# Download from: https://www.mongodb.com/try/download/community

# Option C: MongoDB Atlas (cloud - free tier)
# https://www.mongodb.com/cloud/atlas
```

### 2. Configure .env
The `.env` file is already created with defaults:
```env
MONGODB_URI=mongodb://localhost:27017/legalswipe
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-please
CORS_ORIGIN=http://localhost:8080
```

### 3. Seed Database
```bash
npm run seed
```
Output:
```
✅ MongoDB Connected
✅ Cleared existing system profiles
✅ Seeded 30 lawyer profiles
✅ Database seeding completed successfully!
```

### 4. Start API Server
```bash
npm run dev:api
```
Output:
```
🚀 LegalSwipe API Server Started
📍 Server: http://localhost:3001
🏥 Health: http://localhost:3001/api/health
👨‍⚖️ Lawyers: http://localhost:3001/api/lawyers
```

### 5. Start Frontend
```bash
# In another terminal
npm run dev
```

## 🎯 What Works Now

### Frontend Features (Existing)
✅ 30 unique lawyer profiles with images
✅ Swipeable cards (touch + mouse)
✅ Card stack visual effect
✅ Filter by specialization
✅ Liked profiles view
✅ Chat with lawyers
✅ AI chatbot responses
✅ Base wallet integration
✅ USDC payment buttons
✅ Guest mode

### Backend Features (NEW!)
✅ All features now backed by MongoDB
✅ Persistent data storage
✅ Real-time AI chat responses
✅ Payment history tracking
✅ Match history
✅ Swipe analytics
✅ Production-ready API
✅ Rate limiting & security
✅ Structured logging

## 📊 API Endpoints Summary

### Lawyers
```
GET    /api/lawyers                    # List all lawyers
GET    /api/lawyers/:id                # Get specific lawyer
GET    /api/lawyers/specialization/:spec # Filter by specialization
```

### Swipes & Matches
```
POST   /api/swipes                     # Record swipe (auto-matches)
GET    /api/swipes/:clientId           # Get swipe history
GET    /api/matches/:clientId          # Get all matches
DELETE /api/matches/:matchId           # Unmatch
```

### Chat (with AI)
```
GET    /api/chats/:userId              # Get all chats
GET    /api/chats/room/:matchId        # Get/create chat room
POST   /api/chats/room/:roomId/message # Send message (AI auto-responds)
```

### Payments
```
POST   /api/payments                   # Record payment
GET    /api/payments/client/:clientId  # Client payment history
GET    /api/payments/lawyer/:lawyerId  # Lawyer earnings
PATCH  /api/payments/:id/status        # Update payment status
```

### Users
```
POST   /api/users                      # Create/update user
GET    /api/users/:userId              # Get user
GET    /api/users/wallet/:address      # Get by wallet
```

## 🤖 AI Chatbot Intelligence

System lawyers (all 30) automatically respond to messages with context-aware replies:

**Message Analysis:**
- Bail keywords → Bail application guidance
- Debt keywords → Debt resolution advice
- Maintenance keywords → Child support info
- Cost/Fee keywords → Pricing details
- Eviction keywords → Landlord-tenant law
- Letter of Demand → Document drafting services

**Features:**
- 1-2 second natural response delay
- Personalized based on lawyer's experience/specialization
- Stores conversation history
- Professional legal tone

## 💾 Database Structure

### Example Collections

**Lawyers Collection:**
```json
{
  "_id": ObjectId("..."),
  "profileId": "bail-1",
  "name": "Marcus Bailey",
  "age": 42,
  "location": "Johannesburg, South Africa",
  "specialization": "Bail Application",
  "experience": "15+ years",
  "rating": 4.9,
  "verified": true,
  "languages": ["English", "Afrikaans", "Zulu"],
  "consultationFee": 250,
  "walletAddress": "0x1234...",
  "isSystemProfile": true,
  "services": [
    {
      "id": "bail-1-1",
      "name": "Emergency Bail Application",
      "priceRange": { "min": 5000, "max": 15000 },
      "duration": "1-3 days",
      "category": "Bail Application"
    }
  ],
  "createdAt": "2025-01-...",
  "updatedAt": "2025-01-..."
}
```

**ChatRooms Collection:**
```json
{
  "_id": ObjectId("..."),
  "matchId": "match-123",
  "clientId": "user-abc",
  "lawyerId": "bail-1",
  "messages": [
    {
      "id": "1738123456789",
      "senderId": "user-abc",
      "content": "I need help with a bail application",
      "isSystemMessage": false,
      "createdAt": "2025-01-..."
    },
    {
      "id": "1738123457890",
      "senderId": "bail-1",
      "content": "Based on my 15+ years in Bail Application...",
      "isSystemMessage": true,
      "createdAt": "2025-01-..."
    }
  ],
  "lastMessageAt": "2025-01-...",
  "createdAt": "2025-01-...",
  "updatedAt": "2025-01-..."
}
```

## 🔐 Production Security

✅ **Helmet.js** - Security headers
✅ **Rate Limiting** - 100 req/15min per IP
✅ **CORS** - Configured origins only
✅ **Input Validation** - All API endpoints
✅ **Unique Constraints** - Prevent duplicate swipes/matches
✅ **Indexed Queries** - Optimized database performance
✅ **Error Logging** - Structured logs with context

## 📈 Performance Features

✅ **Database Indexes:**
- Lawyer: specialization, rating, location
- Swipe: clientId + lawyerId (unique)
- Match: clientId + lawyerId (unique)
- Chat: matchId, clientId, lawyerId, updatedAt
- Payment: status, transactionHash

✅ **Pagination** - Default 20 items per page
✅ **Lazy Loading** - Load messages on demand
✅ **Caching Ready** - Structure supports Redis
✅ **Query Optimization** - Compound indexes

## 🧪 Testing the Setup

### 1. Check MongoDB Connection
```bash
mongosh "mongodb://localhost:27017/legalswipe"
# Should connect successfully
```

### 2. Verify Seeded Data
```bash
mongosh legalswipe --eval "db.lawyers.countDocuments()"
# Should return: 30
```

### 3. Test API Endpoints
```bash
# Health check
curl http://localhost:3001/api/health

# Get all lawyers
curl http://localhost:3001/api/lawyers | json_pp

# Get Bail Application lawyers
curl "http://localhost:3001/api/lawyers?specialization=Bail%20Application" | json_pp

# Get specific lawyer
curl http://localhost:3001/api/lawyers/bail-1 | json_pp
```

### 4. Test Frontend Integration
1. Open http://localhost:8080
2. Sign in with Base or use guest mode
3. Swipe right on a lawyer
4. Check "Liked Services"
5. Click "Chat" button
6. Send a message → Should get AI response in 1-2 seconds

## 🎓 Migration from Mock to Database

The app now uses:
- **Before:** `localStorage` for everything
- **After:** MongoDB for persistence, localStorage for cache

**Hybrid Mode:**
- Guest users: Still use localStorage
- Authenticated users: API + MongoDB
- Seamless fallback to mock data if API unavailable

## 📚 Additional Resources

- **API Documentation:** See `API_README.md`
- **Setup Guide:** See `SETUP_GUIDE.md`
- **MongoDB Docs:** https://docs.mongodb.com/
- **Express Best Practices:** https://expressjs.com/en/advanced/best-practice-security.html
- **Mongoose Docs:** https://mongoosejs.com/docs/

## 🆘 Support & Troubleshooting

### Common Issues

**MongoDB won't start:**
```bash
# Check if already running
netstat -an | findstr :27017

# Start MongoDB service
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongodb
```

**Port 3001 in use:**
```bash
# Change PORT in .env
PORT=3002
```

**Seed script fails:**
```bash
# Check MongoDB is running
mongosh

# Drop database and retry
mongosh legalswipe --eval "db.dropDatabase()"
npm run seed
```

**API not connecting from frontend:**
```bash
# Check CORS_ORIGIN in .env matches frontend URL
CORS_ORIGIN=http://localhost:8080
```

## ✨ You're All Set!

Your LegalSwipe app is now:
- ✅ Production-ready with MongoDB
- ✅ Fully functional API
- ✅ AI-powered chatbots
- ✅ Payment tracking
- ✅ Scalable architecture
- ✅ Security hardened
- ✅ Performance optimized

**Next Steps:**
1. Run `npm run seed`
2. Run `npm run dev:api`
3. Run `npm run dev` (new terminal)
4. Start swiping! 🎉

For production deployment, see `SETUP_GUIDE.md` section on MongoDB Atlas and environment configuration.

---

**Created:** January 2025
**Tech Stack:** React + TypeScript + MongoDB + Express + Mongoose
**Features:** 30 AI Lawyers, Real-time Chat, USDC Payments, Base Integration
