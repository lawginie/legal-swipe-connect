# Base Wallet Integration & Base Pay Implementation

## Overview
This implementation adds **Base wallet authentication** and **Base Pay (USDC payments)** to the LegalSwipe application, enabling users to sign in with their Base wallet and pay for legal services using USDC on the Base network.

## Features Implemented

### 1. Base Wallet Authentication ✅
- **Primary Sign-in Method**: Base wallet is now the main authentication option
- **One-Click Registration**: Users can create accounts instantly using their Base wallet
- **No Email Required**: Truly decentralized authentication
- **Network Auto-Switch**: Automatically switches users to Base network (Mainnet or Sepolia)

### 2. Base Pay Integration ✅
- **USDC Payments**: Pay for all legal services with USDC on Base
- **Dual Payment Options**: Users can choose between Base Pay or traditional payment
- **Real-time Balance**: View USDC balance before making payments
- **Transaction Tracking**: All transactions are recorded with Basescan links

### 3. Payment Confirmation System ✅
- **Transaction Receipts**: Detailed receipts with transaction hashes
- **Basescan Integration**: Direct links to view transactions on Basescan
- **Payment History**: View all past payments and bookings
- **Status Tracking**: Track payment status (pending, paid, completed)

## New Components

### `BasePayButton.tsx`
A comprehensive payment button component that handles:
- USDC balance checking
- Network switching to Base
- Transaction execution
- Receipt generation
- Error handling

**Usage:**
```tsx
<BasePayButton
  recipient="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  amount={300}
  serviceName="Legal Consultation"
  lawyerName="Sarah Johnson"
  onSuccess={(txHash, receipt) => console.log('Payment successful!')}
/>
```

### `PaymentHistory.tsx`
Displays all Base Pay transactions and traditional bookings with:
- Transaction details and amounts
- Service and lawyer information
- Links to Basescan explorer
- Payment status badges

### `useBaseAuth.ts` Hook
Custom React hook for managing Base wallet authentication:
```typescript
const {
  isAuthenticated,
  isLoading,
  walletAddress,
  session,
  signIn,
  signOut,
  switchNetwork,
  getProvider
} = useBaseAuth();
```

## Updated Files

### Authentication
- **`src/pages/Auth.tsx`**: Base wallet sign-in is now the primary method
- **`src/hooks/use-base-auth.ts`**: New authentication hook
- **`src/middleware/auth.ts`**: Updated to support Base wallet tokens
- **`src/types/express.d.ts`**: Extended Express types for Base authentication

### Payments
- **`src/components/BasePayButton.tsx`**: New Base Pay component
- **`src/components/PaymentHistory.tsx`**: Payment history viewer
- **`src/pages/LawyerProfile.tsx`**: Integrated Base Pay option

### Configuration
- **`src/utils/featureFlags.ts`**: Enabled Base wallet and payment features
- **`src/config/environment.ts`**: Base wallet configuration
- **`src/pages/Index.tsx`**: Updated auth check to prioritize Base wallet

### Models & Types
- **`src/models/User.ts`**: Added `base` user type and `walletAddress` field
- **`src/data/mockProfiles.ts`**: Added `walletAddress` to profile interface

## Key Features

### Sign-in Flow
1. User clicks "Sign in with BASE"
2. MetaMask/wallet prompts for connection
3. App switches to Base network (if needed)
4. User signs authentication message
5. Session is created and stored locally
6. User gains full access to the app

### Payment Flow
1. User selects legal services
2. Chooses "Pay with BASE" payment method
3. Reviews payment details (amount, recipient, balance)
4. Confirms transaction in wallet
5. Transaction is submitted to Base network
6. Receipt is generated with Basescan link
7. Booking is confirmed and saved

## Network Support

### Base Mainnet
- **Chain ID**: `0x2105` (8453)
- **USDC Contract**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **RPC**: https://mainnet.base.org
- **Explorer**: https://basescan.org

### Base Sepolia (Testnet)
- **Chain ID**: `0x14a33` (84531)
- **USDC Contract**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **RPC**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org

## Feature Flags

All Base features are controlled by feature flags in `featureFlags.ts`:

```typescript
{
  base_wallet_integration: true,  // Enable Base wallet features
  base_wallet_auth: true,         // Enable Base wallet authentication
  base_pay: true,                 // Enable Base Pay for payments
  payment_integration: true       // Enable all payment features
}
```

## Security Features

1. **Message Signing**: Authentication requires cryptographic signature
2. **Wallet Validation**: Address format validation
3. **Network Verification**: Ensures transactions on correct network
4. **Balance Checks**: Prevents insufficient balance transactions
5. **Token Validation**: Server-side Base wallet token verification

## User Experience

### For Clients
- ✅ Quick sign-in with Base wallet
- ✅ View USDC balance
- ✅ Pay lawyers instantly with USDC
- ✅ Track all payments in one place
- ✅ Access Basescan transaction proofs

### For Lawyers
- ✅ Receive payments in USDC
- ✅ Instant payment confirmation
- ✅ Wallet address for receiving payments
- ✅ Transaction records with blockchain proof

## Testing

### Test Credentials (Development)
The app includes quick login buttons for testing:
- **Base Account**: admin@test.com / admin123
- **Client Account**: client@test.com / password123
- **Lawyer Account**: lawyer@test.com / password123

### Test Wallet
For Base Pay testing, a demo recipient address is used:
`0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

## Data Storage

### LocalStorage Keys
- `base_wallet_session`: Base wallet authentication session
- `auth_mode`: Authentication mode ('base_wallet', 'offline', or undefined)
- `base_payments`: Array of all Base Pay transaction receipts
- `consultationBookings`: Array of all consultation bookings

### Payment Receipt Structure
```typescript
{
  transactionHash: string;
  amount: string;
  recipient: string;
  sender: string;
  timestamp: string;
  network: 'Base' | 'Base Sepolia';
  serviceName?: string;
  lawyerName?: string;
  explorerUrl: string;
}
```

## Next Steps

### Recommended Enhancements
1. **Backend Integration**: Store payments in database
2. **Push Notifications**: Notify lawyers of incoming payments
3. **Multi-token Support**: Accept other tokens (ETH, USDT, etc.)
4. **Automatic Wallet Creation**: Smart contract wallets for new users
5. **Dispute Resolution**: On-chain escrow for disputed payments
6. **Fiat On-ramp**: Allow users to buy USDC directly
7. **Mobile Wallet Support**: Coinbase Wallet, Rainbow, etc.

## Support

For issues or questions:
- Check Basescan for transaction status
- Ensure wallet is connected to Base network
- Verify sufficient USDC balance
- Check browser console for detailed errors

## License

This implementation is part of the LegalSwipe application.
