import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, X, Heart, Star, Clock, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MockProfile } from "@/data/mockProfiles";

interface SwipeCardProps {
  profile: MockProfile;
  onSwipe: (direction: "left" | "right") => void;
  isTop?: boolean;
}

const SwipeCard = ({ profile, onSwipe, isTop = true }: SwipeCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTop) return;
    console.log('📱 Touch started on', profile.name);
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isTop) return;
    const currentX = e.touches[0].clientX;
    setDragX(currentX - startX);
  };

  const handleTouchEnd = () => {
    if (!isTop) return;
    console.log('📱 Touch ended, dragX:', dragX);
    if (Math.abs(dragX) > 100) {
      const direction = dragX > 0 ? "right" : "left";
      console.log('✅ Swipe threshold reached, direction:', direction);
      setIsExiting(true);
      setExitDirection(direction);
      setTimeout(() => {
        console.log('🚀 Calling onSwipe with', direction);
        onSwipe(direction);
        setIsExiting(false);
        setExitDirection(null);
        setDragX(0);
      }, 300);
    }
    setIsDragging(false);
    if (Math.abs(dragX) <= 100) {
      setDragX(0);
    }
  };

  // Mouse handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isTop) return;
    console.log('🖱️ Mouse down on', profile.name);
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isTop) return;
    const currentX = e.clientX;
    setDragX(currentX - startX);
  };

  const handleMouseUp = () => {
    if (!isTop) return;
    console.log('🖱️ Mouse up, dragX:', dragX);
    if (Math.abs(dragX) > 100) {
      const direction = dragX > 0 ? "right" : "left";
      console.log('✅ Swipe threshold reached, direction:', direction);
      setIsExiting(true);
      setExitDirection(direction);
      setTimeout(() => {
        console.log('🚀 Calling onSwipe with', direction);
        onSwipe(direction);
        setIsExiting(false);
        setExitDirection(null);
        setDragX(0);
      }, 300);
    }
    setIsDragging(false);
    if (Math.abs(dragX) <= 100) {
      setDragX(0);
    }
  };

  const handleMouseLeave = () => {
    if (isDragging && isTop) {
      setIsDragging(false);
      setDragX(0);
    }
  };

  const rotation = dragX * 0.05;
  const opacity = 1 - Math.abs(dragX) * 0.002;

  // Calculate exit transform
  const getTransform = () => {
    if (isExiting && exitDirection) {
      const exitX = exitDirection === "right" ? 1000 : -1000;
      return `translateX(${exitX}px) rotate(${exitDirection === "right" ? 30 : -30}deg)`;
    }
    return `translateX(${dragX}px) rotate(${rotation}deg)`;
  };

  const getOpacity = () => {
    if (isExiting) return 0;
    return opacity;
  };

  return (
    <Card
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        transform: getTransform(),
        opacity: getOpacity(),
        transition: isExiting ? 'transform 0.3s ease, opacity 0.3s ease' : isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
        cursor: isTop ? (isDragging ? 'grabbing' : 'grab') : 'default',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
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
        {isTop && (
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => {
                setIsExiting(true);
                setExitDirection("left");
                setTimeout(() => {
                  onSwipe("left");
                  setIsExiting(false);
                  setExitDirection(null);
                }, 300);
              }}
            >
              <X className="h-6 w-6" />
            </Button>
            <Button
              size="lg"
              className="flex-1 bg-accent hover:bg-accent/90"
              onClick={() => {
                setIsExiting(true);
                setExitDirection("right");
                setTimeout(() => {
                  onSwipe("right");
                  setIsExiting(false);
                  setExitDirection(null);
                }, 300);
              }}
            >
              <Heart className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SwipeCard;
