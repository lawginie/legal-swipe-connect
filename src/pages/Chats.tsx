import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import BottomNav from "@/components/BottomNav";
import { MessageCircle } from "lucide-react";

interface Match {
  id: string;
  client_id: string;
  lawyer_id: string;
  created_at: string;
  other_user: {
    id: string;
    full_name: string;
    profile_image_url?: string;
  };
  last_message?: {
    content: string;
    created_at: string;
  };
}

const Chats = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [userType, setUserType] = useState<"client" | "lawyer" | "base">("client");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      // Check for offline mode first (base session)
      const authMode = localStorage.getItem('auth_mode');
      const baseSession = localStorage.getItem('base_session');
      
      if (authMode === 'offline' && baseSession) {
        const offlineSession = JSON.parse(baseSession);
        setUserType(offlineSession.user.user_metadata.user_type);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user type
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserType(profile.user_type);
      }

      // Fetch matches
      const { data: matchesData, error } = await supabase
        .from("matches")
        .select(`
          *,
          client:profiles!matches_client_id_fkey(*),
          lawyer:profiles!matches_lawyer_id_fkey(*)
        `)
        .or(`client_id.eq.${user.id},lawyer_id.eq.${user.id}`);

      if (error) throw error;

      // Process matches to get the "other user"
      const processedMatches = matchesData?.map(match => ({
        ...match,
        other_user: match.client_id === user.id ? match.lawyer : match.client,
      })) || [];

      setMatches(processedMatches);
    } catch (error: unknown) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const openChat = (matchId: string) => {
    navigate(`/chat/${matchId}`);
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading chats...</p>
          </div>
        ) : matches.length > 0 ? (
          <div className="space-y-2">
            {matches.map((match) => (
              <Card
                key={match.id}
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => openChat(match.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
                    {match.other_user.full_name.charAt(0)}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{match.other_user.full_name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {match.last_message?.content || "Start a conversation"}
                    </p>
                  </div>
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No matches yet</p>
            <p className="text-sm text-muted-foreground">
              {userType === "client" 
                ? "Swipe right on lawyers to start chatting" 
                : "Wait for clients to match with you"}
            </p>
          </div>
        )}
      </div>

      <BottomNav userType={userType as "client" | "lawyer" | "base"} />
    </div>
  );
};

export default Chats;
