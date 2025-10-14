import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { BrowserProvider } from "ethers";
import { supabase } from "@/integrations/supabase/client";

const WalletConnect = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof (window as any).ethereum !== "undefined") {
      try {
        const provider = new BrowserProvider((window as any).ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0].address);
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof (window as any).ethereum === "undefined") {
      toast.error("Please install MetaMask or a Web3 wallet");
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      
      // Request account access
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      
      // Switch to Base network (chain ID: 8453)
      try {
        await provider.send("wallet_switchEthereumChain", [{ chainId: "0x2105" }]);
      } catch (switchError: any) {
        // Chain doesn't exist, add it
        if (switchError.code === 4902) {
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
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast.error(error.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    toast.success("Wallet disconnected");
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
