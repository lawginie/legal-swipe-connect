import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SwipeCard from "@/components/SwipeCard";
import WalletConnect from "@/components/WalletConnect";
import BottomNav from "@/components/BottomNav";
import LikedServices from "./LikedServices";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Users, UserCheck, Heart } from "lucide-react";
import { MockProfile, getAllMockProfiles, getMockProfilesByType } from "@/data/mockProfiles";
import { Button } from "@/components/ui/button";
import USDCBalance from "@/components/USDCBalance";

interface DiscoverProps {
  guestMode?: boolean;
  userType?: "client" | "lawyer" | "base";
}

const Discover = ({ guestMode = false, userType = "client" }: DiscoverProps) => {
  const [profiles, setProfiles] = useState<MockProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'lawyers' | 'clients'>('lawyers');
  const [showLikedServices, setShowLikedServices] = useState(false);
  const [likedCount, setLikedCount] = useState(0);

  useEffect(() => {
    getUserLocation();
    if (guestMode) {
      loadMockProfiles();
    } else {
      fetchLawyers();
    }
    loadLikedCount();
  }, [selectedCategory, viewMode, guestMode]);

  const handleSwipe = async (direction: "left" | "right") => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    // Save liked profiles to localStorage
    if (direction === "right") {
      const existingLiked = JSON.parse(localStorage.getItem('likedProfiles') || '[]');
      const isAlreadyLiked = existingLiked.some((profile: MockProfile) => profile.id === currentProfile.id);
      
      if (!isAlreadyLiked) {
        const updatedLiked = [...existingLiked, currentProfile];
        localStorage.setItem('likedProfiles', JSON.stringify(updatedLiked));
        setLikedCount(updatedLiked.length);
        toast.success(`You liked ${currentProfile.name}! Added to your favorites.`);
      } else {
        toast.info(`${currentProfile.name} is already in your favorites.`);
      }
    } else {
      toast.info(`You passed on ${currentProfile.name}.`);
    }

    if (guestMode) {
      setCurrentIndex(prev => prev + 1);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("swipes").insert({
        client_id: user.id,
        lawyer_id: currentProfile.id,
        swiped_right: direction === "right",
      });

      setCurrentIndex(prev => prev + 1);
    } catch (error: unknown) {
      console.error("Error saving swipe:", error);
      toast.error("Failed to save swipe");
    }
  };

  // Keyboard event listener for arrow keys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle arrow keys if we're not in liked services view and have profiles
      if (showLikedServices || currentIndex >= profiles.length) return;
      
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleSwipe('left');
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleSwipe('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showLikedServices, currentIndex, profiles.length, handleSwipe]);

  const loadLikedCount = () => {
    const liked = JSON.parse(localStorage.getItem('likedProfiles') || '[]');
    setLikedCount(liked.length);
  };

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

  const loadMockProfiles = () => {
    setLoading(true);
    try {
      let mockData: MockProfile[] = [];
      
      if (viewMode === 'lawyers') {
        mockData = getMockProfilesByType('lawyer');
      } else {
        mockData = getMockProfilesByType('client');
      }

      // Filter by specialization/legal issue if category is selected
      if (selectedCategory !== "all") {
        mockData = mockData.filter(profile => {
          if (profile.userType === 'lawyer') {
            return profile.specialization?.toLowerCase().includes(selectedCategory.replace('_', ' '));
          } else {
            return profile.legalIssue?.toLowerCase().includes(selectedCategory.replace('_', ' '));
          }
        });
      }

      setProfiles(mockData);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error loading mock profiles:", error);
      toast.error("Failed to load profiles");
    } finally {
      setLoading(false);
    }
  };

  // Function to map database lawyer data to MockProfile structure
  const mapDatabaseToMockProfile = (dbLawyer: { id: string; full_name?: string; latitude?: number; longitude?: number; bio?: string; specialization?: string; experience_years?: number; hourly_rate?: number; profile_image_url?: string }): MockProfile => {
    return {
      id: dbLawyer.id,
      name: dbLawyer.full_name || 'Unknown',
      age: 30, // Default age since not in database
      location: dbLawyer.latitude && dbLawyer.longitude 
        ? `${dbLawyer.latitude.toFixed(2)}, ${dbLawyer.longitude.toFixed(2)}`
        : 'Location not specified',
      bio: dbLawyer.bio || 'No bio available',
      specialization: dbLawyer.services?.[0]?.category || 'General Practice',
      experience: '5+ years', // Default since not in database
      rating: 4.5, // Default rating
      image: dbLawyer.profile_image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      userType: 'lawyer' as const,
      verified: true, // Default to verified
      languages: ['English'], // Default languages
      availability: 'Available', // Default availability
      distance: dbLawyer.distance
    };
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
      const query = supabase
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
          lawyer.services?.some((s: { category?: string }) => s.category === selectedCategory)
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

      // Map database data to MockProfile structure
      const mappedProfiles = processedLawyers.map(mapDatabaseToMockProfile);
      setProfiles(mappedProfiles);
    } catch (error: unknown) {
      console.error("Error fetching lawyers:", error);
      toast.error((error as { message?: string })?.message || "Failed to load lawyers");
    } finally {
      setLoading(false);
    }
  };

  const currentProfile = profiles[currentIndex];

  // Show LikedServices if requested
  if (showLikedServices) {
    return (
      <LikedServices 
        onBack={() => {
          setShowLikedServices(false);
          loadLikedCount(); // Refresh count when returning
        }} 
        userType={userType}
      />
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--gradient-primary)" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border p-4">
        <div className="max-w-md mx-auto">
          {/* View Mode Toggle (only in guest mode) */}
          {guestMode && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <Button
                variant={viewMode === 'lawyers' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('lawyers')}
                className="flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Lawyers
              </Button>
              <Button
                variant={viewMode === 'clients' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('clients')}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Clients
              </Button>
            </div>
          )}
          
          <div className="flex items-center justify-between">
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLikedServices(true)}
                className="relative"
              >
                <Heart className="h-4 w-4 mr-1" />
                Liked
                {likedCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {likedCount}
                  </span>
                )}
              </Button>
              {!guestMode && (
                <div className="flex items-center gap-2">
                  <USDCBalance />
                  <WalletConnect />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Swipe Area */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-12rem)]">
        {loading ? (
          <div className="text-center text-primary-foreground">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-foreground mx-auto mb-4"></div>
            <p>{guestMode ? 'Loading profiles...' : 'Finding lawyers near you...'}</p>
          </div>
        ) : currentProfile ? (
          <SwipeCard profile={currentProfile} onSwipe={handleSwipe} />
        ) : (
          <div className="text-center text-primary-foreground p-8">
            <p className="text-xl font-semibold mb-2">
              {guestMode 
                ? `No more ${viewMode} to show` 
                : 'No more lawyers to show'
              }
            </p>
            <p className="text-sm opacity-80">
              {guestMode 
                ? 'Try switching view mode or adjusting filters' 
                : 'Check back later or adjust your filters'
              }
            </p>
          </div>
        )}
      </div>

      {!guestMode && <BottomNav userType={userType} />}
    </div>
  );
};

export default Discover;
