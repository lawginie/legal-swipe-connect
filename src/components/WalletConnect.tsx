import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, ChevronDown, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const WalletConnect = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<"base_account" | null>(null);

  const handleWalletDisconnect = async () => {
    setWalletAddress(null);
    setAuthMethod(null);
    
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
  }, []);

  const checkWalletConnection = () => {
    // Only check for Base Account session
    const baseWalletSession = localStorage.getItem('base_wallet_session');
    if (baseWalletSession) {
      try {
        const session = JSON.parse(baseWalletSession);
        const address = session.user.user_metadata.wallet_address;
        if (address) {
          setWalletAddress(address);
          setAuthMethod("base_account");
        }
      } catch (error) {
        console.error("Error parsing base wallet session:", error);
        localStorage.removeItem('base_wallet_session');
      }
    }
  };

  const disconnectWallet = async () => {
    await handleWalletDisconnect();
  };

  if (!walletAddress) {
    return null; // Don't show button if not connected via Base Account
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 px-2 sm:px-3">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">
              Base: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
            <span className="inline sm:hidden text-xs">
              {walletAddress.slice(0, 4)}...{walletAddress.slice(-3)}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={disconnectWallet} className="text-red-600 cursor-pointer">
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default WalletConnect;
