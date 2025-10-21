import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export interface BaseAuthSession {
  user: {
    id: string;
    email: string;
    user_metadata: {
      full_name: string;
      user_type: 'client' | 'lawyer' | 'base';
      wallet_address: string;
      wallet_signature?: string;
    };
    created_at: string;
  };
  access_token: string;
  refresh_token: string;
}

export interface UseBaseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  walletAddress: string | null;
  session: BaseAuthSession | null;
  signIn: () => Promise<boolean>;
  signOut: () => void;
  switchNetwork: () => Promise<boolean>;
  getProvider: () => Promise<BrowserProvider | null>;
}

const BASE_CHAIN_ID = '0x2105'; // Base Mainnet
const BASE_SEPOLIA_CHAIN_ID = '0x14a33'; // Base Sepolia

export const useBaseAuth = (): UseBaseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [session, setSession] = useState<BaseAuthSession | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = useCallback(async () => {
    try {
      // Check for Base wallet session
      const baseWalletSession = localStorage.getItem('base_wallet_session');
      if (baseWalletSession) {
        const parsedSession = JSON.parse(baseWalletSession) as BaseAuthSession;
        setSession(parsedSession);
        setWalletAddress(parsedSession.user.user_metadata.wallet_address);
        setIsAuthenticated(true);
        
        logger.info('Base auth session restored', {
          action: 'base_auth_restore',
          metadata: { address: parsedSession.user.user_metadata.wallet_address.slice(0, 6) + '...' }
        });
      }
    } catch (error) {
      logger.error('Failed to restore Base auth session', {
        action: 'base_auth_restore_error',
        error: error instanceof Error ? error.message : String(error)
      });
      localStorage.removeItem('base_wallet_session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProvider = useCallback(async (): Promise<BrowserProvider | null> => {
    if (typeof window.ethereum === 'undefined') {
      return null;
    }
    return new BrowserProvider(window.ethereum);
  }, []);

  const switchNetwork = useCallback(async (): Promise<boolean> => {
    try {
      const provider = await getProvider();
      if (!provider) {
        toast.error('Please install MetaMask or a Web3 wallet');
        return false;
      }

      // Try to switch to Base Mainnet
      try {
        await provider.send('wallet_switchEthereumChain', [{ chainId: BASE_CHAIN_ID }]);
        return true;
      } catch (switchError: unknown) {
        // Chain doesn't exist, add it
        if (switchError && typeof switchError === 'object' && 'code' in switchError && switchError.code === 4902) {
          await provider.send('wallet_addEthereumChain', [
            {
              chainId: BASE_CHAIN_ID,
              chainName: 'Base',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org'],
            },
          ]);
          return true;
        }
        throw switchError;
      }
    } catch (error) {
      logger.error('Failed to switch network', {
        action: 'base_auth_network_switch_error',
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }, [getProvider]);

  const signIn = useCallback(async (): Promise<boolean> => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('Please install MetaMask or a Web3 wallet to sign in with Base');
      return false;
    }

    setIsLoading(true);

    try {
      const provider = await getProvider();
      if (!provider) return false;

      // Request account access
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];

      // Switch to Base network
      const networkSwitched = await switchNetwork();
      if (!networkSwitched) {
        toast.error('Failed to switch to Base network');
        return false;
      }

      // Create a message to sign for authentication
      const message = `Sign in to LegalMatch with your Base wallet\nAddress: ${address}\nTimestamp: ${Date.now()}`;
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      // Create Base wallet session
      const baseWalletSession: BaseAuthSession = {
        user: {
          id: `base-wallet-${address}`,
          email: `${address}@base.wallet`,
          user_metadata: {
            full_name: `Base User (${address.slice(0, 6)}...${address.slice(-4)})`,
            user_type: 'client',
            wallet_address: address,
            wallet_signature: signature,
          },
          created_at: new Date().toISOString(),
        },
        access_token: `base-wallet-token-${address}`,
        refresh_token: `base-wallet-refresh-${address}`,
      };

      // Store in localStorage for persistence
      localStorage.setItem('base_wallet_session', JSON.stringify(baseWalletSession));
      localStorage.setItem('auth_mode', 'base_wallet');

      setSession(baseWalletSession);
      setWalletAddress(address);
      setIsAuthenticated(true);

      logger.info('Base wallet sign-in successful', {
        action: 'base_auth_signin_success',
        metadata: { address: address.slice(0, 6) + '...' + address.slice(-4) }
      });

      toast.success(`Signed in with Base: ${address.slice(0, 6)}...${address.slice(-4)}`);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      
      logger.error('Base wallet sign-in failed', {
        action: 'base_auth_signin_error',
        error: errorMessage
      });

      if (error && typeof error === 'object' && 'code' in error && error.code === 4001) {
        toast.error('Connection rejected by user');
      } else {
        toast.error(errorMessage);
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getProvider, switchNetwork]);

  const signOut = useCallback(() => {
    localStorage.removeItem('base_wallet_session');
    localStorage.removeItem('auth_mode');
    setSession(null);
    setWalletAddress(null);
    setIsAuthenticated(false);

    logger.info('Base wallet signed out', {
      action: 'base_auth_signout'
    });

    toast.success('Signed out successfully');
  }, []);

  return {
    isAuthenticated,
    isLoading,
    walletAddress,
    session,
    signIn,
    signOut,
    switchNetwork,
    getProvider,
  };
};
