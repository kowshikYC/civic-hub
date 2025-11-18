import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "reporter" | "solver" | null;
export type OrganizationType = "government" | "municipality" | "ngo" | "volunteer" | "other" | null;

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  points?: number;
  level?: number;
  eventsJoined?: number;
  issuesReported?: number;
  impactScore?: number;
  organizationType?: OrganizationType;
  organizationName?: string;
  profilePhoto?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole, organizationType?: OrganizationType, name?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateUserPoints: (pointsToAdd: number) => void;
  updateUser: (updatedUser: User) => void;
  trackEventJoined: () => void;
  trackIssueReported: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to initialize default stats for new users
  const initializeUserStats = (user: User): User => {
    return {
      ...user,
      points: user.points ?? 0,
      level: user.level ?? 1,
      eventsJoined: user.eventsJoined ?? 0,
      issuesReported: user.issuesReported ?? 0,
      impactScore: user.impactScore ?? 0,
    };
  };

  // Helper function to calculate level based on points
  const calculateLevel = (points: number): number => {
    // Level formula: level = floor(points / 100) + 1
    // This means: 0-99 points = level 1, 100-199 = level 2, etc.
    return Math.floor(points / 100) + 1;
  };

  // Helper function to calculate impact score based on activities
  const calculateImpactScore = (points: number, eventsJoined: number, issuesReported: number): number => {
    // Impact score is a combination of points and activities
    // Max score is 100, calculated as: (points/20 + eventsJoined*5 + issuesReported*3) capped at 100
    const score = Math.min(100, Math.floor((points / 20) + (eventsJoined * 5) + (issuesReported * 3)));
    return score;
  };

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem("civic-hub-user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Ensure user has all stats initialized
      const initializedUser = initializeUserStats(user);
      // Recalculate level based on current points if needed
      if (initializedUser.points !== undefined) {
        initializedUser.level = calculateLevel(initializedUser.points);
      }
      // Recalculate impact score
      initializedUser.impactScore = calculateImpactScore(
        initializedUser.points || 0,
        initializedUser.eventsJoined || 0,
        initializedUser.issuesReported || 0
      );
      setUser(initializedUser);
      localStorage.setItem("civic-hub-user", JSON.stringify(initializedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole, organizationType?: OrganizationType, name?: string) => {
    setIsLoading(true);
    
    // Check if user already exists in localStorage
    const existingUserStr = localStorage.getItem("civic-hub-user");
    let existingUser: User | null = null;
    
    if (existingUserStr) {
      try {
        existingUser = JSON.parse(existingUserStr);
        // Check if this is the same user (same email)
        if (existingUser.email === email) {
          // User exists, track login in backend
          try {
            await fetch("http://localhost:5000/api/users/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email,
                name: existingUser.name,
                role: existingUser.role,
                organizationType: existingUser.organizationType,
                organizationName: existingUser.organizationName,
                userId: existingUser.id
              }),
            });
          } catch (err) {
            console.error("Error tracking login:", err);
          }
          
          // User exists, use their existing data but ensure stats are initialized
          const initializedUser = initializeUserStats(existingUser);
          initializedUser.level = calculateLevel(initializedUser.points || 0);
          initializedUser.impactScore = calculateImpactScore(
            initializedUser.points || 0,
            initializedUser.eventsJoined || 0,
            initializedUser.issuesReported || 0
          );
          setUser(initializedUser);
          localStorage.setItem("civic-hub-user", JSON.stringify(initializedUser));
          setIsLoading(false);
          return;
        }
      } catch (e) {
        // Invalid stored data, continue with new user creation
      }
    }
    
    // Track login in backend
    try {
      const loginResponse = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || email.split("@")[0],
          role,
          organizationType,
          organizationName: organizationType ? `${organizationType.charAt(0).toUpperCase() + organizationType.slice(1)} Organization` : undefined,
          userId: existingUser?.id
        }),
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        // Use the userId from backend if available
        const userId = loginData.userId || existingUser?.id || Date.now().toString();
        
        // Create new user with default stats (starting from scratch)
        const newUser: User = {
          id: userId,
          email,
          name: name || email.split("@")[0],
          role,
          points: existingUser?.points || 0,
          level: existingUser ? calculateLevel(existingUser.points || 0) : 1,
          eventsJoined: existingUser?.eventsJoined || 0,
          issuesReported: existingUser?.issuesReported || 0,
          impactScore: existingUser ? calculateImpactScore(
            existingUser.points || 0,
            existingUser.eventsJoined || 0,
            existingUser.issuesReported || 0
          ) : 0,
          organizationType: organizationType || null,
          organizationName: organizationType ? `${organizationType.charAt(0).toUpperCase() + organizationType.slice(1)} Organization` : undefined,
        };
        
        setUser(newUser);
        localStorage.setItem("civic-hub-user", JSON.stringify(newUser));
      } else {
        throw new Error("Failed to track login");
      }
    } catch (err) {
      console.error("Error tracking login:", err);
      // Continue with local user creation if backend fails
      const newUser: User = {
        id: existingUser?.id || Date.now().toString(),
        email,
        name: name || email.split("@")[0],
        role,
        points: existingUser?.points || 0,
        level: existingUser ? calculateLevel(existingUser.points || 0) : 1,
        eventsJoined: existingUser?.eventsJoined || 0,
        issuesReported: existingUser?.issuesReported || 0,
        impactScore: existingUser ? calculateImpactScore(
          existingUser.points || 0,
          existingUser.eventsJoined || 0,
          existingUser.issuesReported || 0
        ) : 0,
        organizationType: organizationType || null,
        organizationName: organizationType ? `${organizationType.charAt(0).toUpperCase() + organizationType.slice(1)} Organization` : undefined,
      };
      setUser(newUser);
      localStorage.setItem("civic-hub-user", JSON.stringify(newUser));
    }
    
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("civic-hub-user");
    // Clear any role-specific state
  };

  const updateUserPoints = async (pointsToAdd: number, type?: string) => {
    if (user) {
      try {
        // Update backend first
        const response = await fetch(`http://localhost:5000/api/users/${user.id}/update-points`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points: pointsToAdd, type })
        });
        
        if (response.ok) {
          const data = await response.json();
          const updatedUser = {
            ...user,
            points: data.points,
            level: data.level,
            eventsCompleted: data.eventsCompleted,
            issuesReported: data.issuesReported,
            impactScore: data.impactScore
          };
          setUser(updatedUser);
          localStorage.setItem("civic-hub-user", JSON.stringify(updatedUser));
        } else {
          // Fallback to local update if backend fails
          const currentPoints = user.points || 0;
          const newPoints = currentPoints + pointsToAdd;
          const updatedUser = {
            ...user,
            points: newPoints,
            level: calculateLevel(newPoints),
            impactScore: calculateImpactScore(
              newPoints,
              user.eventsJoined || 0,
              user.issuesReported || 0
            )
          };
          setUser(updatedUser);
          localStorage.setItem("civic-hub-user", JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.error('Error updating points:', error);
        // Fallback to local update
        const currentPoints = user.points || 0;
        const newPoints = currentPoints + pointsToAdd;
        const updatedUser = {
          ...user,
          points: newPoints,
          level: calculateLevel(newPoints)
        };
        setUser(updatedUser);
        localStorage.setItem("civic-hub-user", JSON.stringify(updatedUser));
      }
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("civic-hub-user", JSON.stringify(updatedUser));
  };

  const trackEventJoined = () => {
    // This is now handled by updateUserPoints with type 'event'
  };

  const trackIssueReported = () => {
    // This is now handled by updateUserPoints with type 'issue'
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    updateUserPoints,
    updateUser,
    trackEventJoined,
    trackIssueReported,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
