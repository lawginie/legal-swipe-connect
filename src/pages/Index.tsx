import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Discover from "./Discover";
import LawyerDashboard from "./LawyerDashboard";
import { Button } from "@/components/ui/button";
import { Eye, Wallet } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<"client" | "lawyer" | "base" | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [viewMode, setViewMode] = useState<"client" | "lawyer">("client");

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('auth_mode');
    localStorage.removeItem('base_session');
    localStorage.removeItem('base_wallet_session');
    setIsAuthenticated(false);
    setUserType(null);
    setGuestMode(false);
    toast.info("Session expired. Please sign in again.");
  };

  const checkAuth = async () => {
    try {
      // Check for Base wallet session first (primary authentication method)
      const baseWalletSession = localStorage.getItem('base_wallet_session');
      if (baseWalletSession) {
        try {
          const session = JSON.parse(baseWalletSession);
          setIsAuthenticated(true);
          setUserType(session.user.user_metadata.user_type || 'client');
          setLoading(false);
          return;
        } catch (error) {
          console.error("Error parsing base wallet session:", error);
          localStorage.removeItem('base_wallet_session');
        }
      }

      // Check for offline base account session
      const authMode = localStorage.getItem('auth_mode');
      const baseSession = localStorage.getItem('base_session');
      
      if (authMode === 'offline' && baseSession) {
        try {
          const session = JSON.parse(baseSession);
          setIsAuthenticated(true);
          setUserType(session.user.user_metadata.user_type || 'base');
          setLoading(false);
          return;
        } catch (error) {
          console.error("Error parsing base session:", error);
          // Clear invalid session data
          localStorage.removeItem('auth_mode');
          localStorage.removeItem('base_session');
        }
      }

      // Regular Supabase authentication (fallback)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUserType(profile.user_type);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
        <div className="text-center text-primary-foreground">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-foreground mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const handleBaseSignIn = async () => {
    setLoading(true);
    
    try {
      logger.info('Initiating Base Account sign-in', {
        action: 'base_signin_start'
      });

      // Import Base Account SDK dynamically
      const { createBaseAccountSDK } = await import('@base-org/account');
      
      // Initialize Base Account SDK
      const sdk = createBaseAccountSDK({
        appName: 'Legal Swipe Connect',
        appLogoUrl: 'https://base.org/logo.png',
      });
      
      const provider = sdk.getProvider();
      
      toast.info("Connecting to Base Account...");
      
      // Generate a fresh nonce for authentication
      const nonce = window.crypto.randomUUID().replace(/-/g, '');
      
      // Connect and authenticate using wallet_connect
      const response: any = await provider.request({
        method: 'wallet_connect',
        params: [{
          version: '1',
          capabilities: {
            signInWithEthereum: { 
              nonce, 
              chainId: '0x14a33' // Base Sepolia Testnet (84532)
            }
          }
        }]
      });
      
      const { address } = response.accounts[0];
      const { message, signature } = response.accounts[0].capabilities.signInWithEthereum;
      
      // Create Base Account session
      const baseAccountSession = {
        user: {
          id: `base-account-${address}`,
          email: `${address}@base.account`,
          user_metadata: {
            full_name: `Base User (${address.slice(0, 6)}...${address.slice(-4)})`,
            user_type: 'client',
            wallet_address: address,
            wallet_signature: signature,
            auth_message: message,
            auth_method: 'base_account'
          },
          created_at: new Date().toISOString(),
        },
        access_token: `base-account-${address}`,
        refresh_token: `base-account-refresh-${address}`,
      };
      
      // Store session
      localStorage.setItem('base_wallet_session', JSON.stringify(baseAccountSession));
      localStorage.setItem('auth_mode', 'base_account');
      
      logger.info('Base Account sign-in successful', {
        action: 'base_signin_success',
        metadata: { address: address.slice(0, 6) + '...' + address.slice(-4) }
      });
      
      toast.success(`✅ Signed in with Base Account! ${address.slice(0, 6)}...${address.slice(-4)}`);
      
      // Update state to trigger app navigation
      setIsAuthenticated(true);
      setUserType('client');
      setLoading(false);
      
    } catch (error: any) {
      logger.error('Base Account sign-in failed', {
        action: 'base_signin_error',
        error: error?.message || String(error)
      });
      
      console.error('Sign-in error:', error);
      toast.error(`Sign-in failed: ${error?.message || 'Unknown error'}`);
      setLoading(false);
    }
  };

  if (!isAuthenticated && !guestMode) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div className="text-center text-white space-y-8 p-8 max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4">Legal Swipe Connect</h1>
            <p className="text-xl opacity-90">Connect with legal professionals instantly</p>
          </div>
          
          <div className="space-y-4">
            {/* Primary CTA - Sign in with Base */}
            <Button 
              onClick={handleBaseSignIn}
              disabled={loading}
              size="lg" 
              className="w-full bg-white text-purple-700 hover:bg-gray-100 font-semibold py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <span>Sign in with Base</span>
              </div>
            </Button>
            
            <p className="text-sm opacity-90">
              🔐 Secure • Fast • No password required
            </p>
            
            {/* Secondary CTA - Browse as Guest */}
            <div className="pt-6 border-t border-white/20">
              <Button 
                onClick={() => setGuestMode(true)}
                size="lg" 
                variant="ghost"
                className="w-full text-white border-2 border-white/30 hover:bg-white/10"
              >
                <Eye className="h-5 w-5 mr-2" />
                Browse as Guest
              </Button>
              <p className="text-xs opacity-75 mt-3">
                Guest mode allows you to explore profiles without creating an account
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Base users get access to both views with a toggle
  if (isAuthenticated && userType === "base") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* View Mode Toggle for Base Users */}
        <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("client")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === "client" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Client View
            </button>
            <button
              onClick={() => setViewMode("lawyer")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === "lawyer" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Lawyer View
            </button>
          </div>
        </div>
        
        {viewMode === "lawyer" ? <LawyerDashboard /> : <Discover userType="base" />}
      </div>
    );
  }

  if (isAuthenticated && userType === "lawyer") {
    return <LawyerDashboard />;
  }

  return <Discover guestMode={guestMode} userType={isAuthenticated ? userType as "client" | "lawyer" | "base" : "client"} />;
};

export default Index;
