# Base Account Integration Guide

## Overview
This app uses the official **Base Account SDK** for authentication and payments on the Base blockchain network.

## Features Implemented

### 1. Sign in with Base (Home Page)
- **Location**: `src/pages/Index.tsx`
- **Flow**: Users sign in directly from the home page → go straight to app interface
- **Technology**: Base Account SDK's `wallet_connect` method with SIWE capabilities
- **User Experience**: 
  - Click "Sign in with Base" button
  - Base Account popup appears for authentication
  - After signing, users immediately access the swipe card interface
  - No intermediate auth page required

### 2. Base Pay Integration
- **Location**: `src/components/BasePayButton.tsx`
- **Currency**: USDC on Base network
- **Flow**: 
  - User clicks "Pay with Base"
  - Base Pay popup appears with transaction details
  - User confirms payment in popup
  - Payment receipt is generated and displayed

## Technical Implementation

### Authentication Flow
```typescript
// 1. Initialize SDK
const sdk = createBaseAccountSDK();

// 2. Request wallet connection with SIWE
const response = await provider.request({
  method: 'wallet_connect',
  params: [{
    nonce: 'random-nonce',
    capabilities: {
      siwe: {
        enabled: true
      }
    }
  }]
});

// 3. Store session
const session = {
  walletAddress: response.accounts[0],
  signature: response.signature,
  message: response.message,
  chainId: response.chainId
};
localStorage.setItem('base_wallet_session', JSON.stringify(session));
```

### Payment Flow
```typescript
// 1. Initiate payment
const result = await pay({
  amount: 100, // Amount in USDC
  to: lawyerAddress,
  testnet: true // Set to false for mainnet
});

// 2. Check payment status
const status = await getPaymentStatus({
  id: result.id,
  testnet: true
});

// 3. Generate receipt
const receipt = {
  id: result.id,
  amount: 100,
  recipient: lawyerAddress,
  sender: 'Base Account',
  timestamp: Date.now()
};
```

## Configuration

### Networks
- **Base Mainnet**: Chain ID `0x2105` (8453)
- **Base Sepolia Testnet**: Chain ID `0x14a33` (84531)

### Environment Setup
```typescript
// src/config/environment.ts
export const BASE_CONFIG = {
  mainnet: {
    chainId: '0x2105',
    chainName: 'Base',
    rpcUrl: 'https://mainnet.base.org'
  },
  testnet: {
    chainId: '0x14a33',
    chainName: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org'
  }
};
```

## Key Files

| File | Purpose |
|------|---------|
| `src/pages/Index.tsx` | Home page with Base sign-in |
| `src/components/BasePayButton.tsx` | Payment button component |
| `src/hooks/use-base-auth.ts` | Authentication state management hook |
| `src/middleware/auth.ts` | Backend authentication middleware |
| `src/utils/featureFlags.ts` | Feature flags for Base integration |

## User Flow

### For Clients
1. Land on home page
2. Click "Sign in with Base"
3. Complete authentication in Base popup
4. Browse lawyer profiles (swipe interface)
5. Click "Hire & Pay" on a lawyer's profile
6. Pay with USDC using Base Pay
7. Confirm payment in Base popup
8. View payment receipt

### For Lawyers
1. Sign in with Base (same as clients)
2. View dashboard with service listings
3. Receive payments directly to their wallet address
4. Track payment history

## Testing

### Development Testing
```bash
# Start dev server
npm run dev

# Test with Base Sepolia testnet
# - Sign in will use testnet
# - Payments will use testnet USDC
# - No real money involved
```

### Production Checklist
- [ ] Update `testnet` parameter to `false` in BasePayButton
- [ ] Verify Base Mainnet connection
- [ ] Test with real USDC on Base Mainnet
- [ ] Ensure proper error handling for failed payments
- [ ] Set up payment receipt storage

## Troubleshooting

### "User rejected connection"
- User declined in Base Account popup
- Let them try again by clicking sign-in button

### Payment fails
- Check wallet has sufficient USDC balance
- Verify network is Base (not Ethereum mainnet)
- Ensure gas fees are available

### Session expires
- Users need to sign in again
- Session stored in localStorage: `base_wallet_session`

## Security Notes

- Never store private keys in the app
- Base Account SDK handles all wallet interactions
- SIWE (Sign-In with Ethereum) provides secure authentication
- Payment confirmations require user approval in Base popup
- All transactions are on-chain and verifiable

## Resources

- [Base Account Docs](https://docs.base.org/base-account/quickstart/web)
- [Base Pay Docs](https://docs.base.org/base-pay)
- [Base Network](https://base.org)
- [USDC on Base](https://www.circle.com/en/usdc)

## Support

For issues with:
- **Base Account SDK**: Check [Base docs](https://docs.base.org)
- **Payments**: Verify wallet balance and network
- **App-specific issues**: Check console logs and error messages
