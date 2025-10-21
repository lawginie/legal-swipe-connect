import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, MapPin, Bell, Globe, DollarSign, Moon, Eye, Navigation, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SettingsState {
  distance: number;
  locationEnabled: boolean;
  notifications: boolean;
  language: string;
  currency: string;
  theme: string;
  profileVisible: boolean;
  shareLocation: boolean;
  showOnlineStatus: boolean;
}

const Settings = () => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userType, setUserType] = useState<"client" | "lawyer" | "base">("client");
  
  const [settings, setSettings] = useState<SettingsState>({
    distance: 50,
    locationEnabled: true,
    notifications: true,
    language: "en",
    currency: "USD",
    theme: "light",
    profileVisible: true,
    shareLocation: true,
    showOnlineStatus: true,
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("app_settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Determine user type
    const baseWalletSession = localStorage.getItem('base_wallet_session');
    const baseSession = localStorage.getItem('base_session');
    
    if (baseWalletSession || baseSession) {
      setUserType("base");
    }
  }, []);

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("app_settings", JSON.stringify(newSettings));
    toast.success("Settings updated");
  };

  const handleClearChatHistory = () => {
    // Clear all chat-related localStorage items
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('chat-')) {
        localStorage.removeItem(key);
      }
    });
    toast.success("Chat history cleared");
  };

  const handleDeleteAccount = () => {
    // Clear all user data
    localStorage.clear();
    toast.success("Account deleted");
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Distance Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Distance Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Maximum Distance</Label>
                <span className="text-sm font-medium text-primary">
                  {settings.distance} km
                </span>
              </div>
              <Slider
                value={[settings.distance]}
                onValueChange={(value) => updateSetting("distance", value[0])}
                min={5}
                max={200}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Show lawyers within {settings.distance} km of your location
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Location-Based Matching</Label>
                <p className="text-xs text-muted-foreground">
                  Use your location to find nearby lawyers
                </p>
              </div>
              <Switch
                checked={settings.locationEnabled}
                onCheckedChange={(checked) => updateSetting("locationEnabled", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive updates about matches and messages
                </p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => updateSetting("notifications", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => updateSetting("language", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="af">Afrikaans</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Currency Display
              </Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => updateSetting("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD (USDC)</SelectItem>
                  <SelectItem value="ZAR">ZAR (Rand)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Theme
              </Label>
              <Select
                value={settings.theme}
                onValueChange={(value) => updateSetting("theme", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profile Visibility</Label>
                <p className="text-xs text-muted-foreground">
                  Allow lawyers to see your profile
                </p>
              </div>
              <Switch
                checked={settings.profileVisible}
                onCheckedChange={(checked) => updateSetting("profileVisible", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  Share Location
                </Label>
                <p className="text-xs text-muted-foreground">
                  Show your location to matched lawyers
                </p>
              </div>
              <Switch
                checked={settings.shareLocation}
                onCheckedChange={(checked) => updateSetting("shareLocation", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Online Status</Label>
                <p className="text-xs text-muted-foreground">
                  Show when you're active in the app
                </p>
              </div>
              <Switch
                checked={settings.showOnlineStatus}
                onCheckedChange={(checked) => updateSetting("showOnlineStatus", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClearChatHistory}
            >
              Clear Chat History
            </Button>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNav userType={userType} />

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
