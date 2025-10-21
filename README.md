# Legal Swipe Connect 🏛️⚖️

A revolutionary Tinder-style mobile app connecting clients with lawyers. Swipe right on legal expertise, match with professionals, and access legal services seamlessly with Web3 payments.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)

## 🌟 Features

- 🔐 **Base Account Authentication** - Secure wallet-based authentication
- 💼 **Smart Matching** - Swipe through lawyer profiles based on specialization
- 💬 **AI Chatbot** - Context-aware legal consultations with AI-powered responses
- 💳 **Base Pay Integration** - Pay for legal services with USDC on Base network
- 📊 **Activity Tracking** - Complete user activity and session management
- 🔄 **Real-time Chat** - Instant messaging with matched lawyers
- 📱 **Mobile-First Design** - Optimized for mobile and desktop
- 🎯 **Service Categories** - Bail, Debt Review, Maintenance, Eviction, Letter of Demand, Debt Collection

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3.1 + TypeScript 5.8
- **Build Tool**: Vite 5.4.19
- **UI Library**: Shadcn/ui + Radix UI
- **Styling**: Tailwind CSS 3.4
- **State Management**: React Query (TanStack)
- **Routing**: React Router v6
- **Web3**: Base Account SDK, Ethers.js 6.15
- **Payments**: Base Pay (USDC)

### Backend
- **Runtime**: Node.js + Express 5.1
- **Database**: MongoDB 8.19 + Mongoose
- **Authentication**: JWT (jsonwebtoken 9.0)
- **Security**: Helmet, CORS, Rate Limiting
- **API**: RESTful API (30+ endpoints)

### Database Collections
- Users, Sessions, UserProfiles, UserActivity
- Lawyers, Swipes, Matches, ChatRooms
- Payments, Services

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/lawginie/legal-swipe-connect.git
cd legal-swipe-connect

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Seed the database with 30 lawyers
npm run seed

# Start the API server (Terminal 1)
npm run dev:api

# Start the frontend (Terminal 2)
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:8080
- **API**: http://localhost:3001

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase (Optional - for additional auth)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-key

# MongoDB
MONGODB_URI=mongodb://localhost:27017/legal-swipe-connect
MONGODB_DB_NAME=legal-swipe-connect

# API Configuration
PORT=3001
NODE_ENV=development
JWT_SECRET=your-strong-jwt-secret-here
CORS_ORIGIN=http://localhost:8080

# Frontend
VITE_API_URL=http://localhost:3001/api
```

## 📚 Available Scripts

```bash
npm run dev          # Start frontend development server
npm run dev:api      # Start backend API server
npm run seed         # Populate database with 30 lawyers
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Run ESLint
```

## 🏗️ Project Structure

```
legal-swipe-connect/
├── src/
│   ├── components/        # React components
│   ├── pages/            # Page components (Auth, Discover, Chat, etc.)
│   ├── hooks/            # Custom React hooks (useAuth, etc.)
│   ├── services/         # API client and services
│   ├── server/           # Backend Express server
│   │   ├── api/          # API route handlers
│   │   ├── models/       # MongoDB models
│   │   ├── middleware/   # Authentication middleware
│   │   └── seeds/        # Database seeding scripts
│   ├── data/             # Mock data (30 lawyer profiles)
│   ├── utils/            # Utility functions
│   └── config/           # Configuration files
├── public/               # Static assets
└── docs/                 # Documentation (7 guides)
```

## 🔑 Key Features Explained

### 1. Swipe Matching
- Browse lawyer profiles with intuitive swipe gestures
- Filter by specialization and location
- Card stack interface with visual feedback
- Keyboard support (Arrow Left/Right)

### 2. Authentication Flow
```
User → Connect Base Wallet → Sign Message → JWT Token → MongoDB Session → Start Swiping
```

### 3. AI Chatbot
- Context-aware responses based on lawyer specialization
- Natural language processing
- Stored chat history in MongoDB
- 1-2 second response delay for natural feel

### 4. Payment System
- Pay for legal services with USDC
- Base Pay integration (Chain ID: 8453)
- Transaction tracking in database
- Payment history for users

### 5. Activity Tracking
- Every user action logged (swipes, matches, chats, payments)
- Complete audit trail
- Analytics-ready data structure
- Session management across devices

## 📖 Documentation

Comprehensive documentation available:

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup and deployment guide
- **[API_README.md](./API_README.md)** - API endpoint documentation
- **[BASE_AUTH_INTEGRATION_GUIDE.md](./BASE_AUTH_INTEGRATION_GUIDE.md)** - Authentication implementation
- **[INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md)** - Code examples for components
- **[PRODUCTION_READINESS_REPORT.md](./PRODUCTION_READINESS_REPORT.md)** - Production deployment checklist
- **[CRITICAL_FIXES.md](./CRITICAL_FIXES.md)** - Pre-production security fixes
- **[MONGODB_SETUP_COMPLETE.md](./MONGODB_SETUP_COMPLETE.md)** - Database setup guide

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Render/Heroku)
```bash
# Set environment variables
# Deploy with npm run dev:api
```

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed deployment instructions.

## 🔒 Security Features

- JWT authentication with 7-day expiry
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- CORS protection with whitelist
- MongoDB injection protection
- Session management with TTL indexes
- Automatic logout on wallet disconnect

## 🧪 Testing

```bash
npm run test              # Run all tests
npm run test:coverage     # Generate coverage report
npm run test:watch        # Watch mode
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Lawginie Team** - [GitHub](https://github.com/lawginie)

## 🙏 Acknowledgments

- Base Account SDK for Web3 authentication
- Shadcn/ui for beautiful UI components
- MongoDB for flexible data storage
- Unsplash for lawyer profile images

## 📞 Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/lawginie/legal-swipe-connect/issues)
- Review documentation in the `/docs` folder

## 🗺️ Roadmap

- [ ] Email verification system
- [ ] Push notifications for matches
- [ ] Video consultation feature
- [ ] Multi-language support
- [ ] Lawyer reviews and ratings
- [ ] Advanced analytics dashboard
- [ ] Mobile native apps (iOS/Android)

---

**Built with ❤️ for the legal community**
