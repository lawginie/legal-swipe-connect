# Base Authentication Integration - Quick Start

## ✅ What's Been Created

### New Backend Files (7 files)
1. **src/server/api/auth.routes.ts** - Base authentication endpoints
2. **src/server/api/sessions.routes.ts** - Session management endpoints
3. **src/server/api/profile.routes.ts** - User profile endpoints
4. **src/server/api/activity.routes.ts** - Activity tracking endpoints
5. **src/server/models/Session.model.ts** - Session data model
6. **src/server/models/UserProfile.model.ts** - User profile data model
7. **src/server/models/UserActivity.model.ts** - Activity tracking model
8. **src/server/middleware/auth.middleware.ts** - JWT authentication middleware

### New Frontend Files (2 files)
1. **src/services/api.ts** - Complete API client with all endpoints
2. **src/hooks/useAuth.ts** - React hook for authentication

### Documentation
1. **BASE_AUTH_INTEGRATION_GUIDE.md** - Complete integration guide

## 🚀 How It Works

### Authentication Flow
```
User connects Base Wallet
        ↓
Frontend calls signInWithBase()
        ↓
Backend creates/updates User in MongoDB
        ↓
Backend generates JWT token (7 days)
        ↓
Backend creates Session record
        ↓
Frontend stores: token, user data, session ID
        ↓
All API calls include JWT token
        ↓
Backend validates token and tracks activity
```

### Data Stored in MongoDB

**On User Sign In:**
- User record (wallet address, name, type)
- Session record (device info, login time, token)
- Activity record (login event)

**During App Usage:**
- All swipes recorded in UserActivity
- All matches recorded in UserActivity
- All chats recorded in UserActivity + ChatRoom messages
- All payments recorded in UserActivity + Payment collection
- All profile views recorded

**On Profile Update:**
- UserProfile collection updated
- Activity logged
- Profile completion status tracked

## 📝 API Endpoints Created

### Authentication
- `POST /api/auth/base-signin` - Sign in with Base wallet
- `POST /api/auth/verify-token` - Verify JWT token
- `POST /api/auth/logout` - Logout user

### Sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:userId` - Get active sessions
- `PATCH /api/sessions/:sessionId/activity` - Update session activity
- `DELETE /api/sessions/:sessionId` - Terminate session
- `DELETE /api/sessions/user/:userId` - Terminate all sessions

### Profiles
- `GET /api/profile/:userId` - Get user profile
- `POST /api/profile` - Create/update profile
- `PATCH /api/profile/:userId/settings` - Update settings
- `PATCH /api/profile/:userId/verification` - Update verification status

### Activity
- `POST /api/activity` - Record activity
- `GET /api/activity/:userId` - Get activity history (paginated)
- `GET /api/activity/:userId/stats` - Get activity statistics
- `DELETE /api/activity/:userId` - Clear activity

### Existing Enhanced
- `GET /api/lawyers` - Get lawyers (with filters)
- `POST /api/swipes` - Record swipe (auto-matching)
- `GET /api/matches/:clientId` - Get matches
- `POST /api/chats/room` - Create chat room
- `POST /api/chats/room/:roomId/message` - Send message (AI responds)
- `POST /api/payments` - Record payment

## 🔧 Setup Instructions

### 1. Install Dependencies (Already Done)
```bash
npm install axios jsonwebtoken
```

### 2. Update Environment Variables (.env already updated)
```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Start Services
```bash
# Terminal 1: Start MongoDB (if not running)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Terminal 2: Seed database
npm run seed

# Terminal 3: Start API server
npm run dev:api

# Terminal 4: Start frontend
npm run dev
```

### 4. Test Authentication

**A. Connect Base Wallet**
- Click "Connect Wallet" button
- Sign message with Base wallet
- User created in MongoDB automatically
- Session created and stored

**B. Check MongoDB**
```bash
mongosh legal-swipe-connect

# View users
db.users.find().pretty()

# View sessions
db.sessions.find({ isActive: true }).pretty()

# View activities
db.useractivities.find().sort({ timestamp: -1 }).limit(10).pretty()
```

**C. Verify API**
```bash
# Health check
curl http://localhost:3001/api/health

# Get lawyers (no auth required)
curl http://localhost:3001/api/lawyers

# Get user profile (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/profile/base-YOUR_WALLET_ADDRESS
```

## 💡 Usage in Components

### Example 1: Authentication
```typescript
import { useAuth } from '@/hooks/useAuth';

function Component() {
  const { user, signInWithBase, logout, isAuthenticated } = useAuth();

  const handleConnect = async () => {
    // After Base SDK provides credentials
    const result = await signInWithBase(
      walletAddress,
      signature,
      message,
      fullName,
      'client'
    );

    if (result.success) {
      console.log('User authenticated:', result.user);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.fullName}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleConnect}>Connect Base Wallet</button>
      )}
    </div>
  );
}
```

### Example 2: Track Activity
```typescript
import { activityAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

function DiscoverPage() {
  const { user } = useAuth();

  const handleSwipe = async (lawyerId: string, direction: string) => {
    // Record swipe activity
    if (user) {
      await activityAPI.record(
        user.userId,
        'swipe',
        lawyerId,
        { direction, timestamp: new Date().toISOString() }
      );
    }

    // Continue with swipe logic...
  };

  return <SwipeCard onSwipe={handleSwipe} />;
}
```

### Example 3: Save Profile
```typescript
import { profileAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({});

  const handleSave = async () => {
    if (user) {
      await profileAPI.save({
        userId: user.userId,
        ...formData
      });

      toast.success('Profile saved!');
    }
  };

  return <form onSubmit={handleSave}>...</form>;
}
```

### Example 4: View Activity History
```typescript
import { activityAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

function ActivityHistoryPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (user) {
      // Load activity history
      activityAPI.getHistory(user.userId, undefined, 50, 1)
        .then(res => setActivities(res.data));

      // Load stats
      activityAPI.getStats(user.userId)
        .then(res => setStats(res.data));
    }
  }, [user]);

  return (
    <div>
      <h2>Your Activity</h2>
      <div>Total swipes: {stats.swipe || 0}</div>
      <div>Total matches: {stats.match || 0}</div>
      <div>Total chats: {stats.chat || 0}</div>
      
      <ul>
        {activities.map(activity => (
          <li key={activity._id}>
            {activity.activityType} - {new Date(activity.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 🔐 Security Features

1. **JWT Tokens**: 7-day expiry, signed with secret
2. **Session Tracking**: Device info, IP, user agent
3. **Activity Logging**: Every action tracked for audit
4. **Automatic Logout**: Invalid/expired tokens = logout
5. **Rate Limiting**: 100 req/15min per IP
6. **CORS Protection**: Whitelist-based origins

## 📊 What Gets Stored

### Every User Action Tracked:
- ✅ Login/Logout
- ✅ Swipes (left/right)
- ✅ Matches created
- ✅ Chat messages sent
- ✅ Payments made
- ✅ Profile views
- ✅ Service views
- ✅ Profile updates

### Complete User Data:
- ✅ Wallet address
- ✅ Full name
- ✅ Email, phone (optional)
- ✅ Profile info (bio, location, etc.)
- ✅ Preferences (notifications, specializations)
- ✅ Verification status (email, phone, identity)
- ✅ Session history
- ✅ Activity history
- ✅ Match history
- ✅ Chat history
- ✅ Payment history

## 🎯 Next Steps

### Immediate (Already Done ✅)
- [x] Create authentication endpoints
- [x] Create session management
- [x] Create profile management
- [x] Create activity tracking
- [x] Create API client
- [x] Create useAuth hook
- [x] Update server routes

### TODO (For You)
- [ ] Update WalletConnect.tsx to use useAuth hook
- [ ] Update Discover.tsx to record swipe activities
- [ ] Update Chat.tsx to record chat activities
- [ ] Update Profile page to save to backend
- [ ] Add activity history page
- [ ] Test end-to-end authentication flow
- [ ] Deploy to production

## 🐛 Troubleshooting

**Problem: Can't connect to API**
- Check API server is running: `npm run dev:api`
- Check VITE_API_URL in .env: `http://localhost:3001/api`
- Check CORS settings in server/app.ts

**Problem: Token invalid**
- Check JWT_SECRET matches between signin and verify
- Check token stored in localStorage: `localStorage.getItem('auth_token')`
- Token expires after 7 days - reconnect wallet

**Problem: MongoDB connection failed**
- Check MongoDB is running: `docker ps`
- Check MONGODB_URI in .env
- Check MongoDB Atlas connection if using cloud

**Problem: Activity not recording**
- Check user is authenticated: `useAuth().isAuthenticated`
- Check userId is included in API call
- Check backend logs for errors

## 📚 Documentation
- Full integration guide: **BASE_AUTH_INTEGRATION_GUIDE.md**
- API documentation: **API_README.md**
- Setup guide: **SETUP_GUIDE.md**
- MongoDB setup: **MONGODB_SETUP_COMPLETE.md**
