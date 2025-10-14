import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { LogOut, Save } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<"client" | "lawyer">("client");
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    bio: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUserType(data.user_type);
        setProfile({
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          bio: data.bio || "",
          latitude: data.latitude?.toString() || "",
          longitude: data.longitude?.toString() || "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updates: any = {
        full_name: profile.full_name,
        phone: profile.phone,
        bio: profile.bio,
      };

      if (profile.latitude && profile.longitude) {
        updates.latitude = parseFloat(profile.latitude);
        updates.longitude = parseFloat(profile.longitude);
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setProfile({
            ...profile,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
          toast.success("Location updated!");
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Unable to get location");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button variant="destructive" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <Card className="p-6">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input value={profile.email} disabled className="bg-muted" />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+27 123 456 7890"
              />
            </div>

            <div>
              <Label>Bio</Label>
              <Textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder={userType === "lawyer" ? "Tell clients about yourself and your expertise..." : "Tell lawyers about your legal needs..."}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <div className="flex gap-2">
                <Input
                  value={profile.latitude}
                  onChange={(e) => setProfile({ ...profile, latitude: e.target.value })}
                  placeholder="Latitude"
                  className="flex-1"
                />
                <Input
                  value={profile.longitude}
                  onChange={(e) => setProfile({ ...profile, longitude: e.target.value })}
                  placeholder="Longitude"
                  className="flex-1"
                />
              </div>
              <Button type="button" variant="outline" onClick={getCurrentLocation} className="w-full">
                Use Current Location
              </Button>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Card>
      </div>

      <BottomNav userType={userType} />
    </div>
  );
};

export default Profile;
