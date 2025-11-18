import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, AlertCircle, User, Home, LogIn, LogOut, Gift } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Don't show consumer navbar if user is on event handler dashboard or NGO workspace
  const isEventHandlerRoute = location.pathname.startsWith("/event-handler");
  const isNGORoute = location.pathname.startsWith("/ngo");
  if (isEventHandlerRoute || isNGORoute) {
    return null;
  }
  
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/map", icon: MapPin, label: "Map" },
    { path: "/events", icon: Calendar, label: "Events" },
    { path: "/issues", icon: AlertCircle, label: "Issues" },
    { path: "/report", icon: AlertCircle, label: "Report Issue" },
    { path: "/redeem", icon: Gift, label: "Redeem" },
    ...(user?.role === "solver" ? [{ path: "/ngo/issues", icon: AlertCircle, label: "NGO Issues" }] : []),
  ];

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CitizenSpark
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button 
                    variant={isActive ? "default" : "ghost"}
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-gray-600 hidden md:block">
                  Welcome, {user.name}
                  {user.organizationType && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({user.organizationType})
                    </span>
                  )}
                </span>
                <Link to="/profile">
                  <Button variant="outline" size="icon">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" size="icon">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
