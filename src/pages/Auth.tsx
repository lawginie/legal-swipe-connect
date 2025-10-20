import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Scale, User, Briefcase, Shield, Wallet } from "lucide-react";
import { BrowserProvider } from "ethers";
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { featureFlags } from '@/utils/featureFlags';

// Development credentials from environment
const DEV_CREDENTIALS = config.development.testCredentials;

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  // Sign up form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<"client" | "lawyer">("client");
  
  // Lawyer-specific fields
  const [practiceNumber, setPracticeNumber] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Validate lawyer-specific fields
    if (userType === "lawyer") {
      if (!practiceNumber || !address || !phoneNumber) {
        toast.error("Please fill in all required lawyer fields (practice number, address, phone)");
        return;
      }
    }

    setLoading(true);
    
    logger.info('Sign up attempt started', {
      action: 'auth_signup_start',
      metadata: { email, userType }
    });

    try {
      const userData: Record<string, string | boolean | number> = {
        full_name: fullName,
        user_type: userType,
      };
      
      // Add lawyer-specific fields if user is a lawyer
      if (userType === "lawyer") {
        userData.practice_number = practiceNumber;
        userData.address = address;
        userData.phone_number = phoneNumber;
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
      
      logger.info('Sign up successful', {
        action: 'auth_signup_success',
        metadata: { email, userType }
      });
      
      toast.success("Account created! Please log in.");
      setIsLogin(true);
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message;
      logger.error('Sign up failed', {
        action: 'auth_signup_error',
        error: errorMessage,
        metadata: { email, userType }
      });
      toast.error(errorMessage || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    
    logger.info('Sign in attempt started', {
      action: 'auth_signin_start',
      metadata: { email }
    });

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      logger.info('Sign in successful', {
        action: 'auth_signin_success',
        metadata: { email }
      });
      
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message;
      logger.error('Sign in failed', {
        action: 'auth_signin_error',
        error: errorMessage,
        metadata: { email }
      });
      toast.error(errorMessage || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const handleBaseWalletLogin = async () => {
    if (!featureFlags.isEnabled('base_wallet_auth')) {
      toast.error("Base wallet authentication is currently disabled");
      return;
    }

    if (typeof window.ethereum === "undefined") {
      toast.error("Please install MetaMask or a Web3 wallet to sign in with Base");
      return;
    }

    setLoading(true);
    
    logger.info('Base wallet login attempt started', {
      action: 'auth_base_wallet_start'
    });

    try {
      const provider = new BrowserProvider(window.ethereum!);
      
      // Request account access
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      
      // Switch to Base network (chain ID: 8453)
      try {
        await provider.send("wallet_switchEthereumChain", [{ chainId: "0x2105" }]);
      } catch (switchError: unknown) {
        // Chain doesn't exist, add it
        if ((switchError as { code?: number })?.code === 4902) {
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

      // Create a message to sign for authentication
      const message = `Sign in to LegalMatch with your Base wallet\nAddress: ${address}\nTimestamp: ${Date.now()}`;
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      // Create Base wallet session
      const baseWalletSession = {
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
      
      logger.info('Base wallet login successful', {
        action: 'auth_base_wallet_success',
        metadata: { address: address.slice(0, 6) + '...' + address.slice(-4) }
      });
      
      toast.success(`Signed in with Base wallet: ${address.slice(0, 6)}...${address.slice(-4)}`);
      navigate("/");
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message;
      logger.error('Base wallet login failed', {
        action: 'auth_base_wallet_error',
        error: errorMessage
      });
      console.error("Error connecting Base wallet:", error);
      toast.error(errorMessage || "Failed to connect Base wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleBaseAccountRegistration = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error("Please install MetaMask or a Web3 wallet to create a Base account");
      return;
    }

    setLoading(true);
    try {
      const provider = new BrowserProvider(window.ethereum!);
      
      // Request account access
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      
      // Switch to Base network (chain ID: 8453)
      try {
        await provider.send("wallet_switchEthereumChain", [{ chainId: "0x2105" }]);
      } catch (switchError: unknown) {
        // Chain doesn't exist, add it
        if ((switchError as { code?: number })?.code === 4902) {
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

      // Create a registration message to sign
      const registrationMessage = `Create new Base account on LegalMatch\nAddress: ${address}\nTimestamp: ${Date.now()}\nAction: Registration`;
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(registrationMessage);

      // Create new Base account session
      const newBaseAccount = {
        user: {
          id: `base-account-${address}`,
          email: `${address}@base.account`,
          user_metadata: {
            full_name: `Base Account (${address.slice(0, 6)}...${address.slice(-4)})`,
            user_type: 'client',
            wallet_address: address,
            wallet_signature: signature,
            account_created: new Date().toISOString(),
            registration_type: 'base_wallet',
          },
          created_at: new Date().toISOString(),
        },
        access_token: `base-account-token-${address}`,
        refresh_token: `base-account-refresh-${address}`,
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('base_wallet_session', JSON.stringify(newBaseAccount));
      localStorage.setItem('auth_mode', 'base_wallet');
      
      toast.success(`🎉 Base account created successfully! Welcome ${address.slice(0, 6)}...${address.slice(-4)}`);
      navigate("/");
    } catch (error: unknown) {
      console.error("Error creating Base account:", error);
      toast.error((error as { message?: string })?.message || "Failed to create Base account");
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async (userType: 'base' | 'client' | 'lawyer') => {
    const credentials = DEV_CREDENTIALS[userType];
    setLoading(true);
    
    try {
      // Special handling for base account - offline mode
      if (userType === 'base') {
        // Create local session for base account without database
        const baseSession = {
          access_token: config.development.baseWallet.accessToken,
          refresh_token: config.development.baseWallet.refreshToken,
          expires_in: 3600,
          token_type: "bearer",
          user: {
            id: 'base-admin-local',
            email: credentials.email,
            user_metadata: {
              full_name: credentials.fullName,
              user_type: 'base',
            },
            created_at: new Date().toISOString(),
          }
        };
        
        // Store in localStorage for persistence
        localStorage.setItem('base_session', JSON.stringify(baseSession));
        localStorage.setItem('base_wallet_session', JSON.stringify(baseSession));
        localStorage.setItem('auth_mode', 'offline');
        
        toast.success(`Logged in as Base Admin (Offline Mode)!`);
        navigate("/");
        return;
      }

      // Regular Supabase authentication for client/lawyer accounts
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (signInError) {
        // If sign in fails, create the account first
        const { error: signUpError } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            data: {
              full_name: credentials.fullName,
              user_type: credentials.userType,
            },
          },
        });

        if (signUpError) throw signUpError;

        // Then sign in
        const { error: retrySignInError } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (retrySignInError) throw retrySignInError;
      }
      
      // Clear offline mode for regular accounts
      localStorage.removeItem('auth_mode');
      localStorage.removeItem('base_session');
      
      toast.success(`Logged in as ${credentials.userType}!`);
      navigate("/");
    } catch (error: unknown) {
      toast.error((error as { message?: string })?.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{ background: "var(--gradient-primary)" }}>
      <Card className="w-full max-w-md p-8 backdrop-blur-sm bg-card/95">
        <div className="flex items-center justify-center mb-6">
          <Scale className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          LegalMatch
        </h1>
        
        {/* Base Wallet Sign In - Feature Flag Controlled */}
        {featureFlags.isEnabled('base_wallet_integration') && (
          <div className="mb-6">
            <Button
              onClick={handleBaseWalletLogin}
              disabled={loading}
              className="w-full flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3"
            >
              <Wallet className="h-5 w-5" />
              Sign in with Base Wallet
            </Button>
            <p className="text-xs text-center mt-2 text-muted-foreground">
              Connect your Base wallet to sign in securely
            </p>
          </div>
        )}
        
        {/* Development Quick Login */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20">
          <h3 className="text-sm font-medium text-center mb-3 text-muted-foreground">
            🚀 Development Quick Login
          </h3>
          <div className="space-y-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => handleDevLogin('base')}
              disabled={loading}
              className="w-full flex items-center gap-2 bg-gradient-to-r from-primary to-secondary"
            >
              <Shield className="h-4 w-4" />
              Base Account
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDevLogin('client')}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Client
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDevLogin('lawyer')}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Briefcase className="h-4 w-4" />
                Lawyer
              </Button>
            </div>
          </div>
          <div className="text-xs text-center mt-2 text-muted-foreground space-y-1">
            <p><strong>Base:</strong> admin@test.com | admin123</p>
            <p><strong>Others:</strong> client@test.com / lawyer@test.com | password123</p>
          </div>
        </div>
        
        <Tabs value={isLogin ? "login" : "signup"} onValueChange={(v) => setIsLogin(v === "login")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Loading..." : "Login"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <Label>I am a:</Label>
                <RadioGroup value={userType} onValueChange={(v) => setUserType(v as "client" | "lawyer")} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="client" id="client" />
                    <Label htmlFor="client" className="cursor-pointer">Client (Looking for legal help)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lawyer" id="lawyer" />
                    <Label htmlFor="lawyer" className="cursor-pointer">Lawyer (Offering services)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Lawyer-specific fields */}
              {userType === "lawyer" && (
                <>
                  <div>
                    <Label htmlFor="practice-number">Practice Number *</Label>
                    <Input
                      id="practice-number"
                      type="text"
                      value={practiceNumber}
                      onChange={(e) => setPracticeNumber(e.target.value)}
                      placeholder="e.g., 12345/2020"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Business Address *</Label>
                    <Input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main Street, City, Province"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone-number">Phone Number *</Label>
                    <Input
                      id="phone-number"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+27 11 123 4567"
                      required
                    />
                  </div>
                </>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Base Account Registration - Feature Flag Controlled */}
        {featureFlags.isEnabled('base_wallet_integration') && (
          <div className="mt-8 pt-6 border-t border-border/50">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                New to Web3?
              </h3>
              <p className="text-sm text-muted-foreground">
                Create your first Base account and join the future of legal services
              </p>
            </div>
            
            <Button
              onClick={handleBaseAccountRegistration}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Wallet className="h-5 w-5" />
                </div>
                <span>Register with BASE</span>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              </div>
            </Button>
            
            <div className="mt-3 text-center">
              <p className="text-xs text-muted-foreground">
                ✨ Secure • Decentralized • No Email Required
              </p>
              <p className="text-xs text-blue-600 font-medium mt-1">
                Powered by Base Network
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Auth;
