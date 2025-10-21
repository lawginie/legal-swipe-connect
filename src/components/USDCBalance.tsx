import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BrowserProvider, Contract, formatUnits } from "ethers";

const BASE_USDC_MAINNET = import.meta.env.VITE_BASE_USDC_ADDRESS || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const BASE_USDC_SEPOLIA = import.meta.env.VITE_BASE_SEPOLIA_USDC_ADDRESS || "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)",
];

export default function USDCBalance() {
  const [balance, setBalance] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadBalance = async () => {
    if (typeof window.ethereum === "undefined") return;
    setLoading(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const chainId = await provider.send("eth_chainId", []);
      setNetwork(chainId?.toLowerCase() === "0x14a33" ? "Base Sepolia" : "Base");
      const tokenAddress = chainId?.toLowerCase() === "0x14a33" ? BASE_USDC_SEPOLIA : BASE_USDC_MAINNET;
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new Contract(tokenAddress, ERC20_ABI, signer);
      const dec = await contract.decimals();
      const bal = await contract.balanceOf(userAddress);
      setBalance(formatUnits(bal, Number(dec)));
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 4001) {
        toast.error("Wallet request rejected");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to load on mount quietly
    loadBalance();
  }, []);

  if (balance === null) {
    return (
      <Badge variant="outline" className="text-xs px-2 py-1">
        <span className="hidden sm:inline">USDC: </span>--
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1 text-xs px-2 py-1">
      <span className="hidden sm:inline">USDC: </span>
      <span className="font-medium">{loading ? "..." : parseFloat(balance).toFixed(2)}</span>
    </Badge>
  );
}