import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, X, Heart, Star, Clock, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MockProfile } from "@/data/mockProfiles";

interface SwipeCardProps {
  profile: MockProfile;
  onSwipe: (direction: "left" | "right") => void;
}

const SwipeCard = ({ profile, onSwipe }: SwipeCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);

  const handleTouchStart = () => setIsDragging(true);
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const card = e.currentTarget.getBoundingClientRect();
    setDragX(touch.clientX - card.left - card.width / 2);
  };

  const handleTouchEnd = () => {
    if (Math.abs(dragX) > 100) {
      onSwipe(dragX > 0 ? "right" : "left");
    }
    setIsDragging(false);
    setDragX(0);
  };

  const rotation = dragX * 0.05;
  const opacity = 1 - Math.abs(dragX) * 0.002;

  return (
    <Card
      className="relative w-full max-w-md h-[600px] overflow-hidden transition-transform"
      style={{
        transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
        opacity,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Profile Image */}
      <div className="h-64 bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-6xl text-primary-foreground font-bold relative">
        {profile.image ? (
          <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
        ) : (
          profile.name.charAt(0)
        )}
        {/* Verification badge */}
        {profile.verified && (
          <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Overlay indicators */}
      {dragX > 50 && (
        <div className="absolute inset-0 bg-accent/20 flex items-center justify-center pointer-events-none">
          <Heart className="h-32 w-32 text-accent" strokeWidth={3} />
        </div>
      )}
      {dragX < -50 && (
        <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center pointer-events-none">
          <X className="h-32 w-32 text-destructive" strokeWidth={3} />
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <Badge variant={profile.userType === 'lawyer' ? 'default' : 'secondary'}>
              {profile.userType === 'lawyer' ? 'Lawyer' : 'Client'}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{profile.rating}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Age: {profile.age}</p>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">{profile.bio}</p>

        {/* Lawyer-specific info */}
        {profile.userType === 'lawyer' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">{profile.specialization}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="text-sm">{profile.experience} experience</span>
            </div>
          </div>
        )}

        {/* Client-specific info */}
        {profile.userType === 'client' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-sm">{profile.legalIssue}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-500" />
              <span className="text-sm">Urgency: {profile.urgency}</span>
            </div>
          </div>
        )}

        {/* Languages and Availability */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {profile.languages.map((lang) => (
              <Badge key={lang} variant="outline" className="text-xs">
                {lang}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{profile.availability}</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onSwipe("left")}
          >
            <X className="h-6 w-6" />
          </Button>
          <Button
            size="lg"
            className="flex-1 bg-accent hover:bg-accent/90"
            onClick={() => onSwipe("right")}
          >
            <Heart className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SwipeCard;
