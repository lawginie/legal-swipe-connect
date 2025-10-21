# Integration Examples - How to Use New Auth System

## Quick Integration Guide

### 1. WalletConnect.tsx - Replace existing auth logic

**Current Code:**
```typescript
// Manual localStorage management
localStorage.setItem('auth_mode', 'base');
localStorage.setItem('base_wallet_session', address);
```

**New Code:**
```typescript
import { useAuth } from '@/hooks/useAuth';

function WalletConnect() {
  const { signInWithBase, logout, user, isAuthenticated } = useAuth();

  const connectWallet = async () => {
    // After Base SDK provides credentials
    const walletAddress = "0x...";
    const signature = "0x...";
    const message = "Sign in to Legal Swipe";
    
    const result = await signInWithBase(
      walletAddress,
      signature,
      message,
      'User Name', // optional
      'client'     // optional: 'client' or 'lawyer'
    );

    if (result.success) {
      toast.success('Connected successfully!');
      navigate('/discover');
    } else {
      toast.error(result.error);
    }
  };

  const handleDisconnect = async () => {
    await logout(); // Automatically clears all data and redirects
  };

  return (
    <Button onClick={isAuthenticated ? handleDisconnect : connectWallet}>
      {isAuthenticated ? `Disconnect ${user?.fullName}` : 'Connect Wallet'}
    </Button>
  );
}
```

---

### 2. Discover.tsx - Track swipe activities

**Add to existing Discover page:**
```typescript
import { activityAPI, swipeAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

function Discover() {
  const { user, isAuthenticated } = useAuth();
  const [currentProfile, setCurrentProfile] = useState(profiles[0]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    const lawyerId = currentProfile.id;

    // Only track if authenticated (not guest mode)
    if (isAuthenticated && user) {
      try {
        // Record activity
        await activityAPI.record(
          user.userId,
          'swipe',
          lawyerId,
          {
            direction,
            lawyerName: currentProfile.name,
            specialization: currentProfile.specialization,
            timestamp: new Date().toISOString()
          }
        );

        // Create swipe in database (handles auto-matching)
        const swipeResult = await swipeAPI.create({
          clientId: user.userId,
          lawyerId,
          direction
        });

        if (swipeResult.data.match) {
          toast.success('It\'s a match! 🎉');
          // Match and chat room created automatically
        }
      } catch (error) {
        console.error('Failed to record swipe:', error);
        // Continue with local functionality even if API fails
      }
    }

    // Continue with existing local logic
    setCurrentIndex(prev => prev + 1);
    // ... rest of swipe logic
  };

  return (
    // ... existing JSX
  );
}
```

---

### 3. Chat.tsx - Store messages in MongoDB

**Add to existing Chat page:**
```typescript
import { chatAPI, activityAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomId, setRoomId] = useState<string>();

  // Load messages from MongoDB
  useEffect(() => {
    if (user && lawyerId) {
      loadChatRoom();
    }
  }, [user, lawyerId]);

  const loadChatRoom = async () => {
    try {
      // Get or create chat room
      const rooms = await chatAPI.getRooms(user!.userId);
      let room = rooms.data.find((r: any) => r.lawyerId === lawyerId);

      if (!room) {
        // Create new room
        const matchId = `match-${user!.userId}-${lawyerId}`;
        const newRoom = await chatAPI.createRoom(user!.userId, lawyerId, matchId);
        room = newRoom.data;
      }

      setRoomId(room._id);

      // Load messages
      const messagesRes = await chatAPI.getMessages(room._id);
      setMessages(messagesRes.data.messages);
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!user || !roomId) return;

    try {
      // Send message (AI will auto-respond)
      const result = await chatAPI.sendMessage(roomId, user.userId, content);

      // Update local state with user message and AI response
      setMessages(result.data.messages);

      // Record chat activity
      await activityAPI.record(
        user.userId,
        'chat',
        lawyerId,
        { messageCount: 1 }
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    // ... existing JSX
  );
}
```

---

### 4. Profile.tsx - Save profile to MongoDB

**Create new Profile page or update existing:**
```typescript
import { profileAPI, activityAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

function Profile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    dateOfBirth: '',
    gender: '',
    languages: [] as string[],
    preferredSpecializations: [] as string[]
  });

  // Load existing profile
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const result = await profileAPI.get(user!.userId);
      if (result.success) {
        setFormData(result.data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      await profileAPI.save({
        userId: user.userId,
        ...formData
      });

      // Record activity
      await activityAPI.record(
        user.userId,
        'profile_view',
        undefined,
        { action: 'profile_updated' }
      );

      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save profile');
    }
  };

  return (
    <form onSubmit={handleSave}>
      <input
        value={formData.fullName}
        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
        placeholder="Full Name"
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        placeholder="Email"
      />
      <textarea
        value={formData.bio}
        onChange={(e) => setFormData({...formData, bio: e.target.value})}
        placeholder="Bio"
      />
      {/* ... more fields */}
      <Button type="submit">Save Profile</Button>
    </form>
  );
}
```

---

### 5. USDCPayButton.tsx - Track payments

**Add to existing payment component:**
```typescript
import { paymentAPI, activityAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

function USDCPayButton({ service, lawyerId }: Props) {
  const { user } = useAuth();

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please connect wallet first');
      return;
    }

    try {
      // Process Base Pay transaction
      const txHash = await processBasePayTransaction(service.price);

      // Record payment in MongoDB
      await paymentAPI.create({
        userId: user.userId,
        lawyerId,
        serviceId: service.id,
        amount: service.price,
        currency: 'USDC',
        transactionHash: txHash,
        status: 'completed'
      });

      // Record activity
      await activityAPI.record(
        user.userId,
        'payment',
        lawyerId,
        {
          serviceId: service.id,
          serviceName: service.name,
          amount: service.price,
          transactionHash: txHash
        }
      );

      toast.success('Payment successful!');
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed');
    }
  };

  return (
    <Button onClick={handlePayment}>
      Pay {service.price} USDC
    </Button>
  );
}
```

---

### 6. LawyerProfile.tsx - Track profile views

**Add to lawyer profile view:**
```typescript
import { activityAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

function LawyerProfile({ lawyerId }: Props) {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Record profile view
    if (isAuthenticated && user) {
      activityAPI.record(
        user.userId,
        'profile_view',
        lawyerId,
        {
          timestamp: new Date().toISOString()
        }
      );
    }
  }, [lawyerId, user, isAuthenticated]);

  return (
    // ... existing JSX
  );
}
```

---

### 7. ServiceCard.tsx - Track service views

**Add to service card component:**
```typescript
import { activityAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

function ServiceCard({ service, lawyerId }: Props) {
  const { user, isAuthenticated } = useAuth();

  const handleServiceClick = async () => {
    // Record service view
    if (isAuthenticated && user) {
      await activityAPI.record(
        user.userId,
        'service_view',
        lawyerId,
        {
          serviceId: service.id,
          serviceName: service.name,
          servicePrice: service.price
        }
      );
    }

    // Open service details
    navigate(`/lawyer/${lawyerId}/service/${service.id}`);
  };

  return (
    <Card onClick={handleServiceClick}>
      {/* ... service details */}
    </Card>
  );
}
```

---

### 8. ActivityHistory.tsx - View user activity

**Create new page to show activity history:**
```typescript
import { activityAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

function ActivityHistory() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (user) {
      loadActivity();
      loadStats();
    }
  }, [user, page]);

  const loadActivity = async () => {
    try {
      const result = await activityAPI.getHistory(
        user!.userId,
        undefined, // all activity types
        50,        // limit
        page       // page number
      );
      setActivities(result.data);
    } catch (error) {
      console.error('Failed to load activity:', error);
    }
  };

  const loadStats = async () => {
    try {
      const result = await activityAPI.getStats(user!.userId);
      setStats(result.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Activity</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>Swipes</CardHeader>
          <CardContent>{stats.swipe || 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>Matches</CardHeader>
          <CardContent>{stats.match || 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>Chats</CardHeader>
          <CardContent>{stats.chat || 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>Payments</CardHeader>
          <CardContent>{stats.payment || 0}</CardContent>
        </Card>
      </div>

      {/* Activity List */}
      <div className="space-y-2">
        {activities.map((activity: any) => (
          <Card key={activity._id}>
            <CardContent className="flex justify-between items-center p-4">
              <div>
                <p className="font-medium">{activity.activityType}</p>
                <p className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
              {activity.metadata && (
                <p className="text-sm">{JSON.stringify(activity.metadata)}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        <Button onClick={() => setPage(p => Math.max(1, p - 1))}>
          Previous
        </Button>
        <Button onClick={() => setPage(p => p + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
```

---

## API Usage Cheat Sheet

### Authentication
```typescript
import { useAuth } from '@/hooks/useAuth';

const {
  user,              // Current user object
  token,             // JWT token
  isAuthenticated,   // Boolean auth status
  isLoading,         // Loading state
  signInWithBase,    // (address, sig, msg, name?, type?) => Promise
  logout,            // () => Promise<void>
  updateActivity     // () => Promise<void>
} = useAuth();
```

### API Calls
```typescript
import { 
  activityAPI, 
  profileAPI, 
  chatAPI, 
  paymentAPI,
  swipeAPI,
  matchAPI,
  lawyerAPI 
} from '@/services/api';

// Record activity
await activityAPI.record(userId, 'swipe', lawyerId, { direction: 'right' });

// Save profile
await profileAPI.save({ userId, fullName, email, bio, ... });

// Send chat message
await chatAPI.sendMessage(roomId, userId, content);

// Record payment
await paymentAPI.create({ userId, lawyerId, serviceId, amount, ... });

// Get activity history
const { data } = await activityAPI.getHistory(userId, 'swipe', 50, 1);

// Get activity stats
const { data } = await activityAPI.getStats(userId);
```

---

## Testing Checklist

- [ ] Connect Base wallet → User created in MongoDB
- [ ] Swipe on lawyer → Activity recorded
- [ ] Match created → Match + ChatRoom in MongoDB
- [ ] Send chat message → Message stored, AI responds
- [ ] Update profile → Profile saved
- [ ] Make payment → Payment recorded
- [ ] View activity history → All actions listed
- [ ] Logout → Session terminated, localStorage cleared
- [ ] Reconnect → New session created

---

## Key Benefits

1. **Persistence**: All data stored in MongoDB, survives browser refresh
2. **Analytics**: Track user behavior for insights
3. **Audit Trail**: Complete history of all actions
4. **Multi-Device**: Sessions managed across devices
5. **Security**: JWT tokens, rate limiting, CORS protection
6. **Scalability**: Production-ready architecture
7. **AI Integration**: Chatbot responses stored with messages
8. **Payment Tracking**: Complete transaction history

---

## Next Steps

1. Update `WalletConnect.tsx` to use `useAuth` hook
2. Update `Discover.tsx` to record swipes
3. Update `Chat.tsx` to use MongoDB storage
4. Create `Profile.tsx` page with MongoDB save
5. Update payment components to record transactions
6. Create `ActivityHistory.tsx` page
7. Test end-to-end flow
8. Deploy to production!
