import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import BasePayButton from "@/components/BasePayButton";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface OtherUser {
  id: string;
  full_name?: string;
  profile_image_url?: string;
  specialization?: string;
  wallet_address?: string;
}

const Chat = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
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
        
        // Extract lawyer ID from matchId (format: chat-lawyer-id)
        const lawyerId = matchId?.replace('chat-', '');
        
        // Find the lawyer from liked profiles
        const likedProfiles = JSON.parse(localStorage.getItem('likedProfiles') || '[]');
        const lawyer = likedProfiles.find((profile: any) => profile.id === lawyerId);
        
        if (lawyer) {
          setOtherUser({
            id: lawyer.id,
            full_name: lawyer.name,
            profile_image_url: lawyer.image,
            specialization: lawyer.specialization,
            wallet_address: lawyer.walletAddress
          });
          
          // Load existing chat messages from localStorage
          const chatKey = `chat-${offlineSession.user.id}-${lawyerId}`;
          const savedMessages = JSON.parse(localStorage.getItem(chatKey) || '[]');
          
          if (savedMessages.length === 0) {
            // Initial greeting from the lawyer chatbot
            const initialMessage = {
              id: '1',
              content: `Hello! I'm ${lawyer.name}, ${lawyer.specialization} specialist. I have ${lawyer.experience} of experience. How can I help you with your legal matter today?`,
              sender_id: lawyer.id,
              created_at: new Date().toISOString()
            };
            setMessages([initialMessage]);
            localStorage.setItem(chatKey, JSON.stringify([initialMessage]));
          } else {
            setMessages(savedMessages);
          }
        }
        
        return;
      }
      
      // Check for authenticated user or handle guest mode
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        // Guest mode - no authenticated user
        const lawyerId = matchId?.replace('chat-', '');
        const likedProfiles = JSON.parse(localStorage.getItem('likedProfiles') || '[]');
        const lawyer = likedProfiles.find((profile: any) => profile.id === lawyerId);
        
        if (lawyer) {
          setCurrentUserId('guest');
          setOtherUser({
            id: lawyer.id,
            full_name: lawyer.name,
            profile_image_url: lawyer.image,
            specialization: lawyer.specialization,
            wallet_address: lawyer.walletAddress
          });
          
          // Load existing chat messages from localStorage
          const chatKey = `chat-guest-${lawyerId}`;
          const savedMessages = JSON.parse(localStorage.getItem(chatKey) || '[]');
          
          if (savedMessages.length === 0) {
            // Initial greeting from the lawyer chatbot
            const initialMessage = {
              id: '1',
              content: `Hello! I'm ${lawyer.name}, ${lawyer.specialization} specialist. I have ${lawyer.experience} of experience. How can I help you with your legal matter today?`,
              sender_id: lawyer.id,
              created_at: new Date().toISOString()
            };
            setMessages([initialMessage]);
            localStorage.setItem(chatKey, JSON.stringify([initialMessage]));
          } else {
            setMessages(savedMessages);
          }
        }
        
        return;
      }

      // Authenticated user - use real Supabase chat
      setCurrentUserId(currentUser.id);

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

      const other = match.client_id === currentUser.id ? match.lawyer : match.client;
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

  const generateLawyerResponse = (userMessage: string, lawyerProfile: any) => {
    const msg = userMessage.toLowerCase();
    
    // Legal advice patterns
    if (msg.includes('bail') || msg.includes('arrested') || msg.includes('custody')) {
      return `Based on my ${lawyerProfile.experience} in ${lawyerProfile.specialization}, I can help you with bail applications. The process typically takes 2-5 days. I charge between R3,000-R8,000 depending on complexity. Would you like me to review your case?`;
    }
    
    if (msg.includes('debt') || msg.includes('payment') || msg.includes('owe') || msg.includes('money')) {
      return `I specialize in debt matters with ${lawyerProfile.experience}. I can help you understand your options, negotiate payment plans, or initiate legal proceedings if needed. My rates are competitive. What specific debt issue are you facing?`;
    }
    
    if (msg.includes('maintenance') || msg.includes('child support') || msg.includes('alimony')) {
      return `Maintenance claims are one of my specialties. I can help you file a claim, enforce existing orders, or defend against unfair claims. The process usually takes 4-8 weeks. Would you like to schedule a consultation?`;
    }
    
    if (msg.includes('evict') || msg.includes('tenant') || msg.includes('rent') || msg.includes('lease')) {
      return `With ${lawyerProfile.experience} in ${lawyerProfile.specialization}, I handle eviction matters efficiently. I'll need details about your lease agreement and the grounds for eviction. The process typically takes 6-12 weeks. Can you share more details?`;
    }
    
    if (msg.includes('letter of demand') || msg.includes('demand letter')) {
      return `I can draft a professional letter of demand for you. My letters have an 80%+ success rate in getting results before litigation. Cost is R1,500-R3,500 depending on complexity. What is the nature of your claim?`;
    }
    
    if (msg.includes('cost') || msg.includes('price') || msg.includes('fee') || msg.includes('charge')) {
      return `My fees depend on case complexity. I offer transparent pricing: consultations from R500, standard matters from R3,000. I also accept USDC payments via Base Pay. Would you like a detailed quote for your specific matter?`;
    }
    
    if (msg.includes('appointment') || msg.includes('meet') || msg.includes('consultation') || msg.includes('schedule')) {
      return `I'd be happy to schedule a consultation! I'm available for in-person meetings in ${lawyerProfile.location} or virtual consultations. My initial consultation fee is R500 (30 minutes). What dates work best for you?`;
    }
    
    if (msg.includes('experience') || msg.includes('qualification') || msg.includes('background')) {
      return `I have ${lawyerProfile.experience} specializing in ${lawyerProfile.specialization}. My practice focuses on providing accessible, efficient legal services. I maintain a ${lawyerProfile.rating} star rating from satisfied clients. How can I help with your legal matter?`;
    }
    
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return `Hello! I'm here to help with your ${lawyerProfile.specialization} matter. What legal issue are you facing?`;
    }
    
    if (msg.includes('thank') || msg.includes('thanks')) {
      return `You're welcome! Feel free to ask any questions about your legal matter. I'm here to help!`;
    }
    
    if (msg.includes('help') || msg.includes('advice') || msg.includes('what') || msg.includes('how')) {
      return `I specialize in ${lawyerProfile.specialization} with ${lawyerProfile.experience}. I can assist you with legal advice, document preparation, court representation, and more. Could you tell me more about your specific situation?`;
    }
    
    // Default response
    return `Thank you for your message. As a ${lawyerProfile.specialization} specialist with ${lawyerProfile.experience}, I'm here to assist you. Could you provide more details about your legal matter so I can give you specific guidance?`;
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Check for offline mode (base session)
      const authMode = localStorage.getItem('auth_mode');
      const baseSession = localStorage.getItem('base_session');
      
      if (authMode === 'offline' || !currentUserId.includes('-')) {
        // For base/guest users, add message to local state
        const newMsg = {
          id: Date.now().toString(),
          content: newMessage.trim(),
          sender_id: currentUserId,
          created_at: new Date().toISOString()
        };
        
        const updatedMessages = [...messages, newMsg];
        setMessages(updatedMessages);
        
        // Save to localStorage
        const lawyerId = matchId?.replace('chat-', '');
        const chatKey = `chat-${currentUserId}-${lawyerId}`;
        localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
        
        const messageContent = newMessage.trim();
        setNewMessage("");
        
        // Get lawyer profile for intelligent response
        const likedProfiles = JSON.parse(localStorage.getItem('likedProfiles') || '[]');
        const lawyer = likedProfiles.find((profile: any) => profile.id === lawyerId);
        
        // Simulate lawyer chatbot response after a delay
        setTimeout(() => {
          const response = {
            id: (Date.now() + 1).toString(),
            content: generateLawyerResponse(messageContent, lawyer || otherUser),
            sender_id: otherUser?.id || 'lawyer',
            created_at: new Date().toISOString()
          };
          
          const messagesWithResponse = [...updatedMessages, response];
          setMessages(messagesWithResponse);
          localStorage.setItem(chatKey, JSON.stringify(messagesWithResponse));
        }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds for more natural feel
        
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
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/chats")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {otherUser && (
            <>
              <Avatar className="h-10 w-10 bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
                {otherUser.full_name?.charAt(0) || '?'}
              </Avatar>
              <div className="flex-1">
                <h2 className="font-semibold">{otherUser.full_name}</h2>
                {otherUser.specialization && (
                  <p className="text-xs text-muted-foreground">{otherUser.specialization}</p>
                )}
              </div>
              {/* Pay with Base Account (only when other user has a wallet address) */}
              {otherUser.wallet_address && (
                <div className="ml-auto">
                  <BasePayButton 
                    recipient={otherUser.wallet_address}
                    amount={0.01}
                    lawyerName={otherUser.full_name}
                    serviceName={otherUser.specialization || "Legal Services"}
                    size="sm"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-md mx-auto space-y-4">
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
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-border p-4">
        <div className="max-w-md mx-auto flex gap-2">
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
