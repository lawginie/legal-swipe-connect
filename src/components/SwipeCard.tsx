import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LawyerService {
  id: string;
  category: string;
  title: string;
  description: string;
  price: number;
  currency: string;
}

interface LawyerProfile {
  id: string;
  full_name: string;
  bio: string;
  profile_image_url?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  services: LawyerService[];
}

interface SwipeCardProps {
  lawyer: LawyerProfile;
  onSwipe: (direction: "left" | "right") => void;
}

const categoryLabels: Record<string, string> = {
  bail_application: "Bail Application",
  debt_review: "Debt Review",
  maintenance: "Maintenance",
  eviction: "Eviction",
  debt_collection: "Debt Collection",
  letter_of_demand: "Letter of Demand",
  contract_review: "Contract Review",
  divorce: "Divorce",
  other: "Other",
};

const SwipeCard = ({ lawyer, onSwipe }: SwipeCardProps) => {
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
      <div className="h-64 bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-6xl text-primary-foreground font-bold">
        {lawyer.profile_image_url ? (
          <img src={lawyer.profile_image_url} alt={lawyer.full_name} className="w-full h-full object-cover" />
        ) : (
          lawyer.full_name.charAt(0)
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
          <h2 className="text-2xl font-bold">{lawyer.full_name}</h2>
          {lawyer.distance !== undefined && (
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span>{lawyer.distance.toFixed(1)} km away</span>
            </div>
          )}
        </div>

        {lawyer.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">{lawyer.bio}</p>
        )}

        {/* Services */}
        <div className="space-y-2">
          <h3 className="font-semibold">Services:</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {lawyer.services.map((service) => (
              <div key={service.id} className="flex items-center justify-between text-sm">
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-1">
                    {categoryLabels[service.category] || service.category}
                  </Badge>
                  <p className="font-medium">{service.title}</p>
                </div>
                <div className="flex items-center gap-1 text-accent font-bold">
                  <DollarSign className="h-4 w-4" />
                  <span>{service.price}</span>
                </div>
              </div>
            ))}
          </div>
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
