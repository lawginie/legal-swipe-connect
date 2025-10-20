import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Shield, Clock, Heart, Trash2, ArrowLeft, Eye } from "lucide-react";
import { MockProfile } from "@/data/mockProfiles";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import LawyerProfile from "./LawyerProfile";

interface LikedServicesProps {
  onBack: () => void;
  userType?: "client" | "lawyer" | "base";
}

const LikedServices = ({ onBack, userType = "client" }: LikedServicesProps) => {
  const [likedProfiles, setLikedProfiles] = useState<MockProfile[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<MockProfile | null>(null);

  useEffect(() => {
    loadLikedProfiles();
  }, []);

  const loadLikedProfiles = () => {
    const saved = JSON.parse(localStorage.getItem('likedProfiles') || '[]');
    setLikedProfiles(saved);
  };

  const removeLikedProfile = (profileId: string) => {
    const updated = likedProfiles.filter(profile => profile.id !== profileId);
    setLikedProfiles(updated);
    localStorage.setItem('likedProfiles', JSON.stringify(updated));
    toast.success("Removed from favorites");
  };

  const clearAllLiked = () => {
    setLikedProfiles([]);
    localStorage.removeItem('likedProfiles');
    toast.success("All favorites cleared");
  };

  const handleViewProfile = (profile: MockProfile) => {
    if (profile.userType === 'lawyer') {
      setSelectedLawyer(profile);
    } else {
      toast.info("Profile viewing is only available for lawyers");
    }
  };

  const handleBackFromProfile = () => {
    setSelectedLawyer(null);
  };

  // Show lawyer profile if selected
  if (selectedLawyer) {
    return (
      <LawyerProfile 
        lawyer={selectedLawyer} 
        onBack={handleBackFromProfile}
      />
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--gradient-primary)" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Liked Services
            </h1>
            {likedProfiles.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllLiked}>
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        {likedProfiles.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-muted-foreground mb-2">
              No Liked Services Yet
            </h2>
            <p className="text-muted-foreground">
              Start swiping right on profiles you like to see them here!
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                {likedProfiles.length} {likedProfiles.length === 1 ? 'service' : 'services'} saved
              </p>
            </div>
            
            {likedProfiles.map((profile) => (
              <Card 
                key={profile.id} 
                className={`p-4 ${profile.userType === 'lawyer' ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                onClick={() => profile.userType === 'lawyer' && handleViewProfile(profile)}
              >
                <div className="flex gap-4">
                  {/* Profile Image */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl text-primary-foreground font-bold rounded-lg flex-shrink-0">
                    {profile.image ? (
                      <img src={profile.image} alt={profile.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      profile.name.charAt(0)
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{profile.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{profile.location}</span>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{profile.rating}</span>
                        </div>
                      </div>
                      <Badge variant={profile.userType === 'lawyer' ? 'default' : 'secondary'}>
                        {profile.userType === 'lawyer' ? 'Lawyer' : 'Client'}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {profile.bio}
                    </p>

                    {/* Specialization/Legal Issue */}
                    <div className="flex items-center gap-2 mt-2">
                      <Shield className="h-3 w-3 text-blue-500" />
                      <span className="text-xs font-medium">
                        {profile.userType === 'lawyer' ? profile.specialization : profile.legalIssue}
                      </span>
                    </div>

                    {/* Experience/Urgency */}
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-green-500" />
                      <span className="text-xs">
                        {profile.userType === 'lawyer' ? profile.experience : `Urgency: ${profile.urgency}`}
                      </span>
                    </div>

                    {/* Languages */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {profile.languages.slice(0, 3).map((lang) => (
                        <Badge key={lang} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                      {profile.languages.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.languages.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-3">
                      {profile.userType === 'lawyer' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProfile(profile);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Profile
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLikedProfile(profile.id);
                        }}
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>

      <BottomNav userType={userType} />
    </div>
  );
};

export default LikedServices;