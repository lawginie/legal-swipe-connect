import { Home, MessageCircle, User, Briefcase } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  userType: "client" | "lawyer" | "base";
}

const BottomNav = ({ userType }: BottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = (userType === "client" || userType === "base") 
    ? [
        { icon: Home, label: "Discover", path: "/" },
        { icon: MessageCircle, label: "Chats", path: "/chats" },
        { icon: User, label: "Profile", path: "/profile" },
      ]
    : [
        { icon: Briefcase, label: "Dashboard", path: "/lawyer-dashboard" },
        { icon: MessageCircle, label: "Chats", path: "/chats" },
        { icon: User, label: "Profile", path: "/profile" },
      ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
