# LegalSwipe API Documentation

## MongoDB Setup

### Prerequisites
- MongoDB installed locally OR
- MongoDB Atlas account (cloud)

### Local MongoDB Setup
```bash
# Windows: Download and install from https://www.mongodb.com/try/download/community
# Or use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Configuration
1. Copy `.env.example` to `.env`
2. Update `MONGODB_URI` with your MongoDB connection string
3. Generate a strong JWT secret

## API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Health Check
```
GET /health
GET /api/health
```

### Lawyers
```
GET /api/lawyers
  Query params: ?specialization=Bail Application&location=Johannesburg&minRating=4.5&page=1&limit=20

GET /api/lawyers/:id
  Get specific lawyer by profileId

GET /api/lawyers/specialization/:spec
  Get all lawyers by specialization
```

### Users
```
POST /api/users
  Body: { userId, email, fullName, userType, walletAddress, profileImageUrl }

GET /api/users/:userId
  Get user by ID

GET /api/users/wallet/:address
  Get user by wallet address
```

### Swipes
```
POST /api/swipes
  Body: { clientId, lawyerId, swipedRight }

GET /api/swipes/:clientId
  Get all swipes for a client
```

### Matches
```
GET /api/matches/:clientId
  Get all matches for a client (includes lawyer details)

DELETE /api/matches/:matchId
  Unmatch
```

### Chats
```
GET /api/chats/:userId
  Get all chat rooms for a user

GET /api/chats/room/:matchId
  Get or create chat room for a match

POST /api/chats/room/:roomId/message
  Body: { senderId, content }
  Send a message (AI auto-response for system lawyers)
```

### Payments
```
POST /api/payments
  Body: { clientId, lawyerId, serviceId, amount, currency, transactionHash, walletAddress, paymentMethod }

GET /api/payments/client/:clientId
  Get client's payment history

GET /api/payments/lawyer/:lawyerId
  Get lawyer's payment history

PATCH /api/payments/:id/status
  Body: { status, transactionHash }
  Update payment status
```

## Running the API

### Install Dependencies
```bash
npm install
```

### Seed Database
```bash
npm run seed
```

### Start Development Server
```bash
npm run dev:api
```

### Start Both Frontend and API
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run dev:api
```

## Database Models

### Lawyer
- profileId (unique)
- name, age, location, bio
- specialization, experience, rating
- image, verified, languages
- availability, consultationFee
- walletAddress (optional)
- services[] (embedded)
- isSystemProfile (boolean)

### User
- userId (unique)
- email, fullName, userType
- walletAddress, profileImageUrl
- lastActive

### Swipe
- clientId, lawyerId
- swipedRight (boolean)
- unique compound index

### Match
- clientId, lawyerId
- chatRoomId (ref)
- unique compound index

### ChatRoom
- matchId (unique)
- clientId, lawyerId
- messages[] (embedded)
- lastMessageAt

### Payment
- clientId, lawyerId, serviceId
- amount, currency, transactionHash
- walletAddress, status, paymentMethod

## Features

### AI Chatbot
- Automatic responses for system lawyer profiles
- Context-aware responses based on message content
- Simulates natural conversation delays (1-2 seconds)

### Auto-Matching
- Right swipes automatically create matches with system profiles
- Real-time chat rooms created on first match

### Payment Tracking
- USDC/ETH payment recording
- Transaction hash verification
- Payment status updates

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/legalswipe
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:8080
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use MongoDB Atlas for cloud database
3. Configure CORS_ORIGIN to your production domain
4. Enable authentication middleware
5. Set up proper error monitoring
6. Configure rate limiting appropriately
