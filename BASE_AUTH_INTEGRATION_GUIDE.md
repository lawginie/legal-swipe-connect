# Base Authentication Integration Guide

## Overview
This guide explains how the Legal Swipe app integrates Base Account authentication with MongoDB backend for complete user data persistence.

## Architecture

### Frontend Flow
1. User connects wallet via Base Account SDK
2. Frontend receives wallet address and signature
3. Frontend calls `/api/auth/base-signin` with credentials
4. Backend creates/updates user and generates JWT token
5. Frontend stores token and user data in localStorage
6. All subsequent API calls include JWT token in Authorization header

### Backend Components
- **MongoDB Collections**: Users, Sessions, UserProfiles, UserActivity
- **API Endpoints**: Auth, Sessions, Profiles, Activity tracking
- **JWT Authentication**: Secure token-based auth with 7-day expiry
- **Session Management**: Track active sessions, device info, last activity

## Database Schema

### User Model (src/server/models/User.model.ts)
```typescript
{
  userId: string;           // "base-{walletAddress}"
  walletAddress: string;    // Ethereum address (lowercase)
  fullName: string;
  email: string;
  userType: "client" | "lawyer";
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Session Model (src/server/models/Session.model.ts)
```typescript
{
  sessionId: string;        // Unique session identifier
  userId: string;
  walletAddress: string;
  token: string;            // JWT token
  signature: string;        // Wallet signature
  message: string;          // Signed message
  loginTime: Date;
  lastActivity: Date;
  expiresAt: Date;          // Auto-expires after 7 days
  deviceInfo: {
    userAgent: string;
    ip: string;
    platform: string;
  };
  isActive: boolean;
}
```

### UserProfile Model (src/server/models/UserProfile.model.ts)
```typescript
{
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  profileImageUrl: string;
  location: string;
  dateOfBirth: Date;
  gender: string;
  languages: string[];
  preferredSpecializations: string[];
  settings: {
    notifications: boolean;
    emailUpdates: boolean;
    smsUpdates: boolean;
    marketingConsent: boolean;
  };
  verificationStatus: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  completedAt: Date;
}
```

### UserActivity Model (src/server/models/UserActivity.model.ts)
```typescript
{
  userId: string;
  activityType: "swipe" | "match" | "chat" | "payment" | "profile_view" | "service_view" | "login" | "logout";
  targetId: string;         // Lawyer ID, match ID, etc.
  metadata: Record<string, any>;
  timestamp: Date;
  sessionId: string;
}
```

## API Endpoints

### Authentication
**POST /api/auth/base-signin**
- Request: `{ walletAddress, signature, message, fullName?, userType? }`
- Response: `{ user, token, session }`
- Creates new user or updates existing user
- Generates JWT token (7-day expiry)
- Returns user data and session info

**POST /api/auth/verify-token**
- Request: `{ token }`
- Response: `{ userId, userType, walletAddress }`
- Verifies JWT token validity
- Updates user's last active timestamp

**POST /api/auth/logout**
- Request: `{ userId }`
- Response: `{ success: true }`
- Logs user activity and updates timestamp

### Session Management
**POST /api/sessions**
- Creates new session, deactivates old sessions

**GET /api/sessions/:userId**
- Returns all active sessions for user

**PATCH /api/sessions/:sessionId/activity**
- Updates session's last activity timestamp

**DELETE /api/sessions/:sessionId**
- Terminates specific session

**DELETE /api/sessions/user/:userId**
- Terminates all sessions for user

### User Profile
**GET /api/profile/:userId**
- Returns user's complete profile

**POST /api/profile**
- Creates or updates user profile
- Marks profile as complete when required fields filled

**PATCH /api/profile/:userId/settings**
- Updates notification and privacy settings

**PATCH /api/profile/:userId/verification**
- Updates verification status (email, phone, identity)

### Activity Tracking
**POST /api/activity**
- Records user activity (swipes, matches, chats, payments)
- Request: `{ userId, activityType, targetId?, metadata?, sessionId? }`

**GET /api/activity/:userId**
- Returns paginated activity history
- Query params: `activityType, limit, page`

**GET /api/activity/:userId/stats**
- Returns activity statistics by type
- Query params: `startDate, endDate`

**DELETE /api/activity/:userId**
- Clears user activity (optionally older than date)

## Frontend Integration

### useAuth Hook (src/hooks/useAuth.ts)
```typescript
const {
  user,                  // Current user object
  token,                 // JWT token
  sessionId,             // Active session ID
  isAuthenticated,       // Auth status
  isLoading,            // Loading state
  error,                // Error message
  signInWithBase,       // Sign in function
  logout,               // Logout function
  updateActivity        // Update session activity
} = useAuth();
```

### API Service (src/services/api.ts)
Centralized API client with:
- Axios interceptors for auth token injection
- Automatic token refresh handling
- Error handling and 401 redirect
- Type-safe API methods

### Usage Example
```typescript
import { useAuth } from '@/hooks/useAuth';
import { activityAPI, profileAPI } from '@/services/api';

function Component() {
  const { user, signInWithBase, isAuthenticated } = useAuth();

  const handleConnect = async (walletAddress, signature, message) => {
    const result = await signInWithBase(
      walletAddress,
      signature,
      message,
      'John Doe',
      'client'
    );

    if (result.success) {
      // Record activity
      await activityAPI.record(
        result.user.userId,
        'login',
        undefined,
        { walletAddress }
      );
    }
  };

  const handleSwipe = async (lawyerId, direction) => {
    if (user) {
      await activityAPI.record(
        user.userId,
        'swipe',
        lawyerId,
        { direction }
      );
    }
  };

  return <div>...</div>;
}
```

## Data Persistence Flow

### On Sign In
1. User connects Base wallet
2. `signInWithBase()` called with wallet credentials
3. Backend creates user record in MongoDB
4. Backend generates JWT token
5. Backend creates session record
6. Frontend stores token, user data, session ID in localStorage
7. Activity logged: "login"

### During Session
1. Every API call includes JWT token in Authorization header
2. Backend validates token and extracts userId
3. Session activity updated every 5 minutes
4. All user actions recorded in UserActivity collection

### On Profile Update
1. User fills out profile form
2. `profileAPI.save()` called with profile data
3. Backend updates UserProfile collection
4. Marks profile as complete if all required fields filled

### On Swipe/Match/Chat/Payment
1. Action performed in UI
2. Activity recorded: `activityAPI.record(userId, activityType, targetId, metadata)`
3. Backend creates UserActivity record
4. Associated data (Swipe, Match, ChatRoom, Payment) created in respective collections

### On Logout
1. `logout()` function called
2. Activity logged: "logout"
3. Session terminated in backend
4. All localStorage data cleared
5. User redirected to landing page

## Security Features

1. **JWT Authentication**
   - 7-day token expiry
   - Tokens signed with secret key
   - Automatic refresh/re-login required after expiry

2. **Session Management**
   - Multiple device support
   - Session tracking with device info
   - Automatic session expiry (TTL index)
   - Manual session termination

3. **Rate Limiting**
   - 100 requests per 15 minutes in production
   - Prevents abuse and DDoS attacks

4. **CORS Protection**
   - Whitelist-based origin validation
   - Credentials support for authenticated requests

5. **Data Encryption**
   - Wallet signatures stored for audit trail
   - Passwords not used (wallet-based auth)

## Production Deployment

### Environment Variables
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/legalswipe
PORT=3001
NODE_ENV=production
JWT_SECRET=<generate-strong-random-secret>
CORS_ORIGIN=https://your-production-domain.com
VITE_API_URL=https://api.your-domain.com/api
```

### Steps
1. Set up MongoDB Atlas cluster
2. Update .env with production values
3. Generate strong JWT secret: `openssl rand -base64 32`
4. Run database seed: `npm run seed`
5. Deploy API server (Railway, Render, Heroku)
6. Deploy frontend (Vercel, Netlify)
7. Update VITE_API_URL in frontend env
8. Test authentication flow end-to-end

## Testing

### Manual Testing
1. Start MongoDB: `docker run -d -p 27017:27017 mongo`
2. Seed database: `npm run seed`
3. Start API: `npm run dev:api`
4. Start frontend: `npm run dev`
5. Connect Base wallet
6. Verify user created in MongoDB
7. Check session created
8. Perform swipes/matches/chats
9. Verify activity logged
10. Update profile
11. Logout and verify session terminated

### MongoDB Verification
```bash
# Connect to MongoDB
mongosh legalswipe

# Check users
db.users.find().pretty()

# Check sessions
db.sessions.find({ isActive: true }).pretty()

# Check activity
db.useractivities.find().sort({ timestamp: -1 }).limit(10).pretty()

# Check profiles
db.userprofiles.find().pretty()
```

## Troubleshooting

### Token Invalid/Expired
- User will be logged out automatically
- Must reconnect wallet and sign in again

### Session Not Created
- Check API server logs
- Verify MongoDB connection
- Check CORS settings

### Activity Not Recording
- Verify JWT token in request headers
- Check userId matches authenticated user
- Ensure API endpoints accessible

### Profile Not Saving
- Verify required fields provided
- Check MongoDB write permissions
- Review API error logs

## Next Steps

1. **Email Verification**: Implement email verification flow
2. **Phone Verification**: Add SMS verification via Twilio
3. **Identity Verification**: Integrate KYC service
4. **Analytics Dashboard**: Build admin analytics for user activity
5. **Push Notifications**: Add real-time notifications for matches/messages
6. **Backup & Recovery**: Implement data export and account recovery
