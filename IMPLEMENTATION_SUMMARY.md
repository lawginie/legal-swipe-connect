# LegalSwipe - Legal Services Platform

## ✅ Completed Features

### 🎯 30 Placeholder Lawyers Across 6 Service Categories

Each category has 5 specialized lawyers with:
- ✅ Professional profile photos (Unsplash)
- ✅ Detailed biographies and specializations
- ✅ 3 bookable service options per lawyer
- ✅ Price ranges for each service
- ✅ Service durations
- ✅ Base wallet addresses for payments
- ✅ Languages spoken
- ✅ Availability status
- ✅ Rating (4.6 - 4.9 stars)
- ✅ Years of experience

#### Service Categories:

1. **Bail Application** (5 lawyers)
   - Emergency bail, bail appeals, bail condition variations
   - 24/7 availability for urgent matters
   - Price range: R2,500 - R40,000

2. **Debt Review** (5 lawyers)
   - Full debt review under NCA
   - Debt restructuring and consolidation
   - Credit bureau clearance assistance
   - Price range: R500 - R11,000

3. **Maintenance** (5 lawyers)
   - Child and spousal maintenance
   - Maintenance enforcement
   - Emergency maintenance applications
   - Price range: R1,500 - R15,000

4. **Eviction** (5 lawyers)
   - Tenant eviction (residential & commercial)
   - PIE Act evictions
   - Eviction defense
   - Price range: R2,500 - R20,000

5. **Debt Collection** (5 lawyers)
   - Legal debt recovery
   - Court judgments
   - Asset attachment
   - Price range: R1,500 - R20,000

6. **Letter of Demand** (5 lawyers)
   - Standard and urgent demand letters
   - Consumer rights demands
   - Commercial demand letters
   - Price range: R600 - R5,000

### 💳 Base Pay Integration

- ✅ **BasePayButton Component**: Fully functional USDC payment button
- ✅ **Wallet Integration**: Connects to Base Account SDK
- ✅ **Payment Flow**:
  1. User selects services on lawyer profile
  2. Chooses payment method (Base Pay or Traditional)
  3. Base Pay popup appears with transaction details
  4. Payment confirmed on Base network
  5. Receipt generated and stored
- ✅ **Payment Receipts**: Transaction ID, amount, recipient, timestamp
- ✅ **Payment History**: Stored in localStorage for demo

### 🔐 Authentication

- ✅ **Sign in with Base**: Primary authentication method on home page
- ✅ **Session Management**: localStorage persistence
- ✅ **Direct Navigation**: Users go straight to app after sign-in
- ✅ **No intermediate auth page**: Removed /auth route

### 🎨 User Interface

- ✅ **Swipe Card Interface**: Tinder-style lawyer discovery
- ✅ **Service Filtering**: Filter by 6 service categories
- ✅ **Liked Services**: Save favorite lawyers
- ✅ **Lawyer Profiles**: Detailed profile pages with service selection
- ✅ **Payment Method Selection**: Toggle between Base Pay and traditional
- ✅ **Responsive Design**: Mobile-optimized

### 🌐 Network Configuration

- **Base Mainnet**: Chain ID 0x2105 (8453)
- **Base Sepolia Testnet**: Chain ID 0x14a33 (84531)
- **Currency**: USDC on Base
- **SDK**: @base-org/account (official Base Account SDK)

## 📊 Data Structure

### Lawyer Profile Schema

```typescript
{
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  specialization: string; // Service category
  experience: string;
  rating: number;
  image: string; // Unsplash URL
  userType: 'lawyer';
  verified: boolean;
  languages: string[];
  availability: string;
  consultationFee: number;
  walletAddress: string; // Base wallet for payments
  services: LawyerService[];
}
```

### Service Schema

```typescript
{
  id: string;
  name: string;
  description: string;
  priceRange: {
    min: number;
    max: number;
  };
  duration: string;
  category: string;
}
```

## 🚀 Usage

### For Users (Clients)

1. **Sign in with Base** on home page
2. **Swipe through lawyers** or use category filters
3. **Like favorite lawyers** (saved to "Liked" section)
4. **View lawyer profiles** with detailed services
5. **Select services** to book
6. **Choose payment method**: Base Pay (USDC) or Traditional
7. **Pay with Base**: Instant USDC payment on Base network
8. **Receive confirmation** and booking receipt

### For Lawyers

- Each lawyer has a **Base wallet address** to receive payments
- Payments sent directly to lawyer's wallet
- **Consultation fee** + **service fees** = total payment
- All transactions on-chain and verifiable

## 💡 Key Features

### Swipe Discovery
- Tinder-style card interface
- Arrow key support (← pass, → like)
- Smooth animations
- Profile details on cards

### Service Selection
- Multiple services per lawyer
- Checkbox selection
- Price range display
- Duration estimates
- Real-time total calculation

### Base Pay
- Instant USDC payments
- Secure Base network transactions
- Payment confirmation popup
- Receipt generation
- Transaction hash tracking

### Data Persistence
- Liked profiles in localStorage
- Payment receipts stored locally
- Booking history tracked
- Session management

## 🔧 Technical Stack

- **Frontend**: React 18.3 + TypeScript
- **UI Library**: Radix UI + shadcn/ui + Tailwind CSS
- **Blockchain**: Base (L2)
- **Payments**: Base Pay (USDC)
- **SDK**: @base-org/account
- **State**: React hooks + localStorage
- **Routing**: React Router DOM
- **Build**: Vite

## 📝 Next Steps

### Production Checklist
- [ ] Replace demo wallet addresses with real addresses
- [ ] Set `testnet: false` in BasePayButton for mainnet
- [ ] Add database backend for lawyer profiles
- [ ] Implement real authentication backend
- [ ] Add payment receipt email notifications
- [ ] Set up webhook for payment confirmations
- [ ] Add dispute resolution system
- [ ] Implement lawyer verification process

### Feature Enhancements
- [ ] Add video consultation booking
- [ ] Implement chat messaging
- [ ] Add document upload for cases
- [ ] Lawyer dashboard for managing bookings
- [ ] Client dashboard for tracking services
- [ ] Rating and review system
- [ ] Push notifications for bookings

## 🎉 Success Metrics

- ✅ 30 diverse lawyers across 6 categories
- ✅ 90+ bookable services total (3 per lawyer)
- ✅ Full Base Pay integration
- ✅ Professional UI/UX
- ✅ Mobile-responsive design
- ✅ Zero TypeScript errors
- ✅ Fast, smooth performance

## 📚 Documentation

See `BASE_ACCOUNT_SETUP.md` for detailed Base integration documentation.

---

**Ready for testing!** Start the dev server with `npm run dev` and visit http://localhost:8080/
