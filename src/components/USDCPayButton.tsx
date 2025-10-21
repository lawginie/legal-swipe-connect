import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BrowserProvider, Contract, formatUnits, parseUnits } from "ethers";

// USDC addresses on Base
// Source: Circle USDC contract addresses
// Base Mainnet: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
// Base Sepolia: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
const BASE_USDC_MAINNET = import.meta.env.VITE_BASE_USDC_ADDRESS || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const BASE_USDC_SEPOLIA = import.meta.env.VITE_BASE_SEPOLIA_USDC_ADDRESS || "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

interface USDCPayButtonProps {
  recipient?: string;
  initialAmount?: string; // default in USDC units, e.g. "5"
  className?: string;
  onSuccess?: (txHash: string) => void;
}

export default function USDCPayButton({ recipient, initialAmount = "5", className, onSuccess }: USDCPayButtonProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(initialAmount);
  const [decimals, setDecimals] = useState<number>(6); // USDC typically 6
  const [isPaying, setIsPaying] = useState(false);
  const [chainIdHex, setChainIdHex] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    // Preload decimals, chain, and balance
    (async () => {
      try {
        if (typeof window.ethereum === "undefined") return;
        const provider = new BrowserProvider(window.ethereum);
        const network = await provider.send("eth_chainId", []);
        setChainIdHex(network);
        const tokenAddress = network?.toLowerCase() === "0x14a33" ? BASE_USDC_SEPOLIA : BASE_USDC_MAINNET;
        const signer = await provider.getSigner();
        const contract = new Contract(tokenAddress, ERC20_ABI, signer);
        const dec = await contract.decimals();
        setDecimals(Number(dec));
        const userAddress = await signer.getAddress();
        const bal = await contract.balanceOf(userAddress);
        setBalance(formatUnits(bal, Number(dec)));
      } catch (err) {
        // silently ignore
      }
    })();
  }, []);

  const getTokenAddress = (chainId: string | null) => {
    if (chainId?.toLowerCase() === "0x14a33") return BASE_USDC_SEPOLIA; // Base Sepolia
    return BASE_USDC_MAINNET; // Base Mainnet
  };

  const ensureBaseNetwork = async (provider: BrowserProvider) => {
    try {
      const chainId = await provider.send("eth_chainId", []);
      if (chainId?.toLowerCase() !== "0x2105" && chainId?.toLowerCase() !== "0x14a33") {
        // Try switch to Base mainnet
        await provider.send("wallet_switchEthereumChain", [{ chainId: "0x2105" }]);
        setChainIdHex("0x2105");
      } else {
        setChainIdHex(chainId);
      }
    } catch (switchErr: unknown) {
      // If switch fails, try adding Base mainnet
      if (switchErr && typeof switchErr === 'object' && 'code' in switchErr && switchErr.code === 4902) {
        await provider.send("wallet_addEthereumChain", [{
          chainId: "0x2105",
          chainName: "Base",
          nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://mainnet.base.org"],
          blockExplorerUrls: ["https://basescan.org"],
        }]);
        setChainIdHex("0x2105");
      } else {
        throw switchErr;
      }
    }
  };

  const handlePay = async () => {
    if (!recipient) {
      toast.error("No recipient wallet address available");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (typeof window.ethereum === "undefined") {
      toast.error("Please install MetaMask or Coinbase Wallet");
      return;
    }

    setIsPaying(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      await ensureBaseNetwork(provider);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const tokenAddress = getTokenAddress(chainIdHex);
      const contract = new Contract(tokenAddress, ERC20_ABI, signer);

      // Check balance
      const balanceBN = await contract.balanceOf(userAddress);
      const amt = parseUnits(amount, decimals);
      if (balanceBN < amt) {
        toast.error(`Insufficient USDC. You have ${formatUnits(balanceBN, decimals)} USDC`);
        setIsPaying(false);
        return;
      }

      const tx = await contract.transfer(recipient, amt);
      toast.info("Transaction submitted, waiting for confirmation...");
      const receipt = await tx.wait();

      toast.success("Payment successful! View on Basescan");
      // Open Basescan link in a new tab
      const scanBase = chainIdHex?.toLowerCase() === "0x14a33" ? "https://sepolia.basescan.org" : "https://basescan.org";
      window.open(`${scanBase}/tx/${receipt.hash}`, "_blank");

      if (onSuccess) onSuccess(receipt.hash);
      setOpen(false);
      // Refresh balance after successful payment
      try {
        const updatedBal = await contract.balanceOf(userAddress);
        setBalance(formatUnits(updatedBal, decimals));
      } catch {
        // Ignore balance update errors
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 4001) {
        toast.error("User rejected the transaction");
      } else {
        const message = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' 
          ? error.message 
          : "Failed to send USDC";
        toast.error(message);
      }
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className={className}>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Pay with USDC
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay with USDC</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Network: {chainIdHex?.toLowerCase() === "0x14a33" ? "Base Sepolia" : "Base"}
            </div>
            {balance !== null && (
              <div className="text-xs">Your USDC balance: <span className="font-medium">{balance}</span></div>
            )}
            <div>
              <label className="text-sm font-medium">Amount (USDC)</label>
              <Input type="number" min={0} step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPaying}>
              Cancel
            </Button>
            <Button onClick={handlePay} disabled={isPaying}>
              {isPaying ? "Paying..." : "Pay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}