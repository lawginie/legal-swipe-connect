import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Discover from "./Discover";
import LawyerDashboard from "./LawyerDashboard";
import { Button } from "@/components/ui/button";
import { LogIn, Eye } from "lucide-react";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<"client" | "lawyer" | "base" | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [viewMode, setViewMode] = useState<"client" | "lawyer">("client");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check for Base wallet session first
      const baseWalletSession = localStorage.getItem('base_wallet_session');
      if (baseWalletSession) {
        try {
          const session = JSON.parse(baseWalletSession);
          setIsAuthenticated(true);
          setUserType(session.user.user_metadata.user_type);
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
          setUserType(session.user.user_metadata.user_type);
          setLoading(false);
          return;
        } catch (error) {
          console.error("Error parsing base session:", error);
          // Clear invalid session data
          localStorage.removeItem('auth_mode');
          localStorage.removeItem('base_session');
        }
      }

      // Regular Supabase authentication
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

  if (!isAuthenticated && !guestMode) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
        <div className="text-center text-primary-foreground space-y-6 p-8">
          <h1 className="text-4xl font-bold mb-2">Legal Swipe Connect</h1>
          <p className="text-lg opacity-90 mb-8">Connect with legal professionals or explore as a guest</p>
          
          <div className="space-y-4 max-w-sm mx-auto">
            <Button 
              onClick={() => setGuestMode(true)}
              size="lg" 
              variant="secondary" 
              className="w-full"
            >
              <Eye className="h-5 w-5 mr-2" />
              Browse as Guest
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/auth'}
              size="lg" 
              className="w-full bg-white text-primary hover:bg-gray-100"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Sign In / Sign Up
            </Button>
          </div>
          
          <p className="text-sm opacity-75 mt-6">
            Guest mode allows you to browse profiles without creating an account
          </p>
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
