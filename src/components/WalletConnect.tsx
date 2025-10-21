import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { BrowserProvider } from "ethers";
import { supabase } from "@/integrations/supabase/client";

// Global state to prevent multiple simultaneous connection attempts
let isGloballyConnecting = false;
let globalWalletAddress: string | null = null;

const WalletConnect = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string | null>(globalWalletAddress);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleWalletDisconnect = async () => {
    globalWalletAddress = null;
    setWalletAddress(null);
    
    // Clear all authentication and session data
    localStorage.removeItem('auth_mode');
    localStorage.removeItem('base_session');
    localStorage.removeItem('base_wallet_session');
    
    // Sign out from Supabase if authenticated
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
    
    toast.success("Wallet disconnected. Logging out...");
    
    // Navigate to landing page and force a full page reload to reset all state
    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  };

  useEffect(() => {
    checkWalletConnection();
    
    // Listen for account changes (wallet disconnect/switch)
    if (typeof window.ethereum !== "undefined") {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // Wallet disconnected
          handleWalletDisconnect();
        } else {
          // Account switched
          const address = accounts[0];
          globalWalletAddress = address;
          setWalletAddress(address);
          toast.info("Wallet account switched");
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        // If we already have a global wallet address, use it
        if (globalWalletAddress) {
          setWalletAddress(globalWalletAddress);
          return;
        }

        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const address = accounts[0].address;
          globalWalletAddress = address;
          setWalletAddress(address);
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error("Please install MetaMask or a Web3 wallet");
      return;
    }

    // Prevent multiple simultaneous connection attempts
    if (isGloballyConnecting) {
      toast.error("Wallet connection already in progress. Please wait.");
      return;
    }

    // If already connected, don't reconnect
    if (globalWalletAddress) {
      toast.success("Wallet already connected!");
      return;
    }

    isGloballyConnecting = true;
    setIsConnecting(true);
    
    try {
      const provider = new BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      
      // Switch to Base network (chain ID: 8453)
      try {
        await provider.send("wallet_switchEthereumChain", [{ chainId: "0x2105" }]);
      } catch (switchError: unknown) {
        // Chain doesn't exist, add it
        if (switchError && typeof switchError === 'object' && 'code' in switchError && switchError.code === 4902) {
          await provider.send("wallet_addEthereumChain", [
            {
              chainId: "0x2105",
              chainName: "Base",
              nativeCurrency: {
                name: "Ethereum",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://mainnet.base.org"],
              blockExplorerUrls: ["https://basescan.org"],
            },
          ]);
        }
      }

      // Update both local and global state
      globalWalletAddress = address;
      setWalletAddress(address);
      
      // Save wallet address to profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ wallet_address: address })
          .eq("id", user.id);
      }

      toast.success("Wallet connected!");
    } catch (error: unknown) {
      console.error("Error connecting wallet:", error);
      
      // Handle specific error for pending requests
      if (error && typeof error === 'object' && 
          (('code' in error && error.code === -32002) || 
           ('message' in error && typeof error.message === 'string' && error.message.includes("already pending")))) {
        toast.error("A wallet connection request is already pending. Please check your wallet and approve or reject the existing request.");
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 4001) {
        toast.error("Wallet connection was rejected by user.");
      } else {
        const message = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' 
          ? error.message 
          : "Failed to connect wallet";
        toast.error(message);
      }
    } finally {
      isGloballyConnecting = false;
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    await handleWalletDisconnect();
  };

  return (
    <div>
      {walletAddress ? (
        <Button variant="outline" onClick={disconnectWallet} className="gap-2">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        </Button>
      ) : (
        <Button onClick={connectWallet} disabled={isConnecting} className="gap-2">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </span>
        </Button>
      )}
    </div>
  );
};

export default WalletConnect;
