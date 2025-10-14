import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SwipeCard from "@/components/SwipeCard";
import WalletConnect from "@/components/WalletConnect";
import BottomNav from "@/components/BottomNav";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

interface LawyerProfile {
  id: string;
  full_name: string;
  bio: string;
  profile_image_url?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  services: any[];
}

const Discover = () => {
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserLocation();
    fetchLawyers();
  }, [selectedCategory]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Unable to get your location");
        }
      );
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchLawyers = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get already swiped lawyers
      const { data: swipes } = await supabase
        .from("swipes")
        .select("lawyer_id")
        .eq("client_id", user.id);

      const swipedIds = swipes?.map(s => s.lawyer_id) || [];

      // Fetch lawyers
      let query = supabase
        .from("profiles")
        .select(`
          *,
          services:lawyer_services(*)
        `)
        .eq("user_type", "lawyer")
        .not("id", "in", `(${swipedIds.join(",") || "00000000-0000-0000-0000-000000000000"})`);

      const { data: lawyerData, error } = await query;

      if (error) throw error;

      let processedLawyers = lawyerData || [];

      // Filter by category if selected
      if (selectedCategory !== "all") {
        processedLawyers = processedLawyers.filter(lawyer => 
          lawyer.services?.some((s: any) => s.category === selectedCategory)
        );
      }

      // Calculate distances
      if (userLocation) {
        processedLawyers = processedLawyers.map(lawyer => ({
          ...lawyer,
          distance: lawyer.latitude && lawyer.longitude
            ? calculateDistance(userLocation.lat, userLocation.lng, lawyer.latitude, lawyer.longitude)
            : undefined
        })).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      }

      setLawyers(processedLawyers);
    } catch (error: any) {
      console.error("Error fetching lawyers:", error);
      toast.error("Failed to load lawyers");
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: "left" | "right") => {
    const currentLawyer = lawyers[currentIndex];
    if (!currentLawyer) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("swipes").insert({
        client_id: user.id,
        lawyer_id: currentLawyer.id,
        swiped_right: direction === "right",
      });

      if (direction === "right") {
        toast.success(`You liked ${currentLawyer.full_name}!`);
      }

      setCurrentIndex(prev => prev + 1);
    } catch (error: any) {
      console.error("Error saving swipe:", error);
      toast.error("Failed to save swipe");
    }
  };

  const currentLawyer = lawyers[currentIndex];

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--gradient-primary)" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="bail_application">Bail Application</SelectItem>
                <SelectItem value="debt_review">Debt Review</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="eviction">Eviction</SelectItem>
                <SelectItem value="debt_collection">Debt Collection</SelectItem>
                <SelectItem value="letter_of_demand">Letter of Demand</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <WalletConnect />
        </div>
      </div>

      {/* Swipe Area */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-12rem)]">
        {loading ? (
          <div className="text-center text-primary-foreground">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-foreground mx-auto mb-4"></div>
            <p>Finding lawyers near you...</p>
          </div>
        ) : currentLawyer ? (
          <SwipeCard lawyer={currentLawyer} onSwipe={handleSwipe} />
        ) : (
          <div className="text-center text-primary-foreground p-8">
            <p className="text-xl font-semibold mb-2">No more lawyers to show</p>
            <p className="text-sm opacity-80">Check back later or adjust your filters</p>
          </div>
        )}
      </div>

      <BottomNav userType="client" />
    </div>
  );
};

export default Discover;
