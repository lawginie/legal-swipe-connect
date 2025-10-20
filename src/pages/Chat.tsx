import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import USDCPayButton from "@/components/USDCPayButton";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

const Chat = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<{ id: string; full_name?: string; profile_image_url?: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchId) {
      initChat();
    }
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initChat = async () => {
    try {
      // Check for offline mode (base session) first
      const authMode = localStorage.getItem('auth_mode');
      const baseSession = localStorage.getItem('base_session');
      
      if (authMode === 'offline' && baseSession) {
        const offlineSession = JSON.parse(baseSession);
        setCurrentUserId(offlineSession.user.id);
        
        // For base users, create mock chat data
        setOtherUser({
          id: 'mock-lawyer-1',
          full_name: 'Demo Lawyer',
          email: 'demo@lawyer.com',
          user_type: 'lawyer'
        });
        
        setMessages([
          {
            id: '1',
            content: 'Hello! This is a demo chat for the base account.',
            sender_id: 'mock-lawyer-1',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            content: 'You can test the chat functionality here.',
            sender_id: offlineSession.user.id,
            created_at: new Date().toISOString()
          }
        ]);
        
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      // Get match details
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select(`
          *,
          client:profiles!matches_client_id_fkey(*),
          lawyer:profiles!matches_lawyer_id_fkey(*)
        `)
        .eq("id", matchId)
        .single();

      if (matchError) throw matchError;

      const other = match.client_id === user.id ? match.lawyer : match.client;
      setOtherUser(other);

      // Get or create chat room
      let { data: room } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("match_id", matchId)
        .single();

      if (!room) {
        const { data: newRoom, error: roomError } = await supabase
          .from("chat_rooms")
          .insert({ match_id: matchId })
          .select()
          .single();

        if (roomError) throw roomError;
        room = newRoom;
      }

      setRoomId(room.id);

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", room.id)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

      // Subscribe to new messages
      const channel = supabase
        .channel(`room-${room.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `room_id=eq.${room.id}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error: unknown) {
      console.error("Error initializing chat:", error);
      toast.error((error as { message?: string })?.message || "Failed to load chat");
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Check for offline mode (base session)
      const authMode = localStorage.getItem('auth_mode');
      
      if (authMode === 'offline') {
        // For base users, add message to local state
        const newMsg = {
          id: Date.now().toString(),
          content: newMessage.trim(),
          sender_id: currentUserId,
          created_at: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, newMsg]);
        setNewMessage("");
        
        // Simulate a response after a delay
        setTimeout(() => {
          const response = {
            id: (Date.now() + 1).toString(),
            content: "Thanks for your message! This is a demo response.",
            sender_id: 'mock-lawyer-1',
            created_at: new Date().toISOString()
          };
          setMessages(prev => [...prev, response]);
        }, 1000);
        
        return;
      }

      // Original Supabase logic for authenticated users
      if (!roomId) return;
      
      const { error } = await supabase.from("messages").insert({
        room_id: roomId,
        sender_id: currentUserId,
        content: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage("");
    } catch (error: unknown) {
      console.error("Error sending message:", error);
      toast.error((error as { message?: string })?.message || "Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/chats")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {otherUser && (
            <>
              <Avatar className="h-10 w-10 bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
                {otherUser.full_name.charAt(0)}
              </Avatar>
              <h2 className="font-semibold">{otherUser.full_name}</h2>
              {/* Pay with USDC (only when other user has a wallet address) */}
              {otherUser.wallet_address && (
                <div className="ml-auto">
                  <USDCPayButton recipient={otherUser.wallet_address} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.sender_id === currentUserId ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[70%] rounded-2xl px-4 py-2",
                message.sender_id === currentUserId
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
