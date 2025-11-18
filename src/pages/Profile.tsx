import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  User, 
  Award, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  Star,
  Trophy,
  Target,
  Zap,
  Settings,
  LogIn,
  Gift,
  Camera,
  Upload
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import RewardContribution from "@/components/RewardContribution";
import { toast } from "sonner";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [userStats, setUserStats] = useState({
    totalPoints: user?.points || 0,
    eventsJoined: user?.eventsJoined || 0,
    issuesReported: user?.issuesReported || 0,
    impactScore: user?.impactScore || 0
  });

  // Update stats when user data changes
  useEffect(() => {
    if (user) {
      setUserStats({
        totalPoints: user.points || 0,
        eventsJoined: user.eventsJoined || 0,
        issuesReported: user.issuesReported || 0,
        impactScore: user.impactScore || 0
      });
    }
  }, [user]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Initialize edit form when user data changes
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || ''
      });
      fetchLeaderboard();
    }
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleEditProfile = () => {
    setEditDialogOpen(true);
  };

  const handleSaveProfile = () => {
    // Update user data
    if (updateUser) {
      updateUser({
        ...user,
        name: editForm.name,
        email: editForm.email
      });
    }
    setEditDialogOpen(false);
    toast.success("Profile updated successfully!");
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) {
      console.log('No file selected or user not found');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('profilePhoto', file);

    try {
      console.log('Uploading photo for user:', user.id);
      const response = await fetch(`http://localhost:5000/api/users/${user.id}/profile-photo`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (response.ok) {
        if (updateUser) {
          updateUser({
            ...user,
            profilePhoto: data.profilePhoto
          });
        }
        toast.success("Profile photo updated successfully!");
      } else {
        console.error('Upload failed:', data);
        toast.error(data.error || "Failed to upload photo");
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error("Network error. Please try again.");
    } finally {
      setUploadingPhoto(false);
      // Reset the input
      event.target.value = '';
    }
  };

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Profile Access</h2>
            <p className="text-muted-foreground mb-6">
              Please log in to view your profile and track your civic engagement progress.
            </p>
            <div className="space-y-3">
              <Link to="/login">
                <Button className="w-full gap-2">
                  <LogIn className="w-4 h-4" />
                  Login to Your Account
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  // Calculate next level threshold (100 points per level)
  // Level 1 = 0-99 points, Level 2 = 100-199 points, etc.
  // To reach next level, need: (currentLevel) * 100 points
  const getNextLevelThreshold = (currentLevel: number): number => {
    return currentLevel * 100;
  };
  
  // Calculate progress within current level (0-100%)
  const getLevelProgress = (points: number): number => {
    const pointsInCurrentLevel = points % 100;
    return Math.min(100, (pointsInCurrentLevel / 100) * 100);
  };
  
  // Calculate points needed to reach next level
  const getPointsToNextLevel = (points: number, currentLevel: number): number => {
    const nextLevelThreshold = getNextLevelThreshold(currentLevel);
    return Math.max(0, nextLevelThreshold - points);
  };

  const userData = user ? {
    name: user.name || "Community Member",
    email: user.email || "member@citizenspark.com",
    role: user.role === "reporter" ? "Citizen" : 
          user.role === "solver" ? user.organizationType || "Solver" : 
          user.role === "event_handler" ? "Event Organizer" : "Citizen",
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    points: userStats.totalPoints,
    level: Math.floor(userStats.totalPoints / 100) + 1,
    eventsJoined: userStats.eventsJoined,
    issuesReported: userStats.issuesReported,
    impactScore: userStats.impactScore,
  } : {
    name: "Guest User",
    email: "guest@citizenspark.com",
    role: "Visitor",
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    points: 0,
    level: 1,
    eventsJoined: 0,
    issuesReported: 0,
    impactScore: 0,
  };

  const badges = [
    { id: 1, name: "First Steps", icon: "👶", description: "Joined CitizenSpark", earned: true },
    { id: 2, name: "Reporter", icon: "📝", description: "Reported first issue", earned: userData.issuesReported >= 1 },
    { id: 3, name: "Community Helper", icon: "🤝", description: "Reported 3+ issues", earned: userData.issuesReported >= 3 },
    { id: 4, name: "Event Joiner", icon: "🎉", description: "Joined first event", earned: userData.eventsJoined >= 1 },
    { id: 5, name: "Active Citizen", icon: "⭐", description: "Joined 3+ events", earned: userData.eventsJoined >= 3 },
    { id: 6, name: "Point Collector", icon: "💎", description: "Earned 100+ points", earned: userData.points >= 100 },
    { id: 7, name: "Rising Star", icon: "🌟", description: "Earned 250+ points", earned: userData.points >= 250 },
    { id: 8, name: "Community Champion", icon: "🏆", description: "Earned 500+ points", earned: userData.points >= 500 },
    { id: 9, name: "Level Up", icon: "🚀", description: "Reached level 2+", earned: userData.level >= 2 },
  ];

  const recentActivities = [
    { id: 1, type: "event", title: "Community Cleanup Drive", date: "2 days ago", points: 50 },
    { id: 2, type: "issue", title: "Reported broken street light", date: "5 days ago", points: 25 },
    { id: 3, type: "event", title: "Tree Plantation Drive", date: "1 week ago", points: 75 },
    { id: 4, type: "redeem", title: "Redeemed Starbucks voucher", date: "1 week ago", points: -50 },
  ];

  // Add current user to leaderboard if not already there
  const displayLeaderboard = leaderboard.length > 0 ? 
    leaderboard.map(entry => ({
      ...entry,
      isCurrentUser: user && entry._id === user.id
    })) : 
    [
      { rank: 1, name: "Sarah Miller", points: 456 },
      { rank: 2, name: "Mike Chen", points: 387 },
      { rank: 3, name: userData.name, points: userData.points, isCurrentUser: true },
      { rank: 4, name: "Emma Davis", points: 245 },
      { rank: 5, name: "James Wilson", points: 198 },
    ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="p-6">
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <Avatar className="w-24 h-24 mx-auto border-4 border-primary/20">
                    {user?.profilePhoto ? (
                      <AvatarImage 
                        src={`http://localhost:5000/uploads/profiles/${user.profilePhoto}`} 
                        alt={userData.name}
                        className="object-cover"
                        onError={(e) => {
                          console.log('Image failed to load:', e);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-secondary text-white">
                      {userData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="photo-upload" 
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors"
                  >
                    {uploadingPhoto ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold">{userData.name}</h2>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                  <Badge variant="secondary" className="mt-2">
                    {userData.role}
                  </Badge>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Joined {userData.joinedDate}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={handleEditProfile}>
                        <Settings className="w-4 h-4" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            placeholder="Your email"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveProfile} className="flex-1">
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Link to="/redeem">
                    <Button variant="default" size="sm" className="w-full">
                      <Gift className="w-4 h-4" />
                      Redeem
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Level Progress */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Level</p>
                    <p className="text-3xl font-bold text-primary">Level {userData.level}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{userData.points} points</span>
                    <span className="text-muted-foreground">{getPointsToNextLevel(userData.points, userData.level)} to level {userData.level + 1}</span>
                  </div>
                  <Progress value={getLevelProgress(userData.points)} className="h-3" />
                </div>
                <div className="text-center pt-2">
                  <Link to="/redeem">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Gift className="w-4 h-4" />
                      Redeem Points
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Your Impact</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{userData.eventsJoined}</p>
                      <p className="text-xs text-muted-foreground">Events Joined</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-semibold">{userData.issuesReported}</p>
                      <p className="text-xs text-muted-foreground">Issues Reported</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold">{userData.impactScore}%</p>
                      <p className="text-xs text-muted-foreground">Impact Score</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Middle Column - Badges and Activities */}
          <div className="lg:col-span-2 space-y-6">
            {/* Badges */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold">Badges</h3>
                  <p className="text-sm text-muted-foreground">
                    Earned {badges.filter(b => b.earned).length} of {badges.length}
                  </p>
                </div>
                <Award className="w-8 h-8 text-primary" />
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <Card
                    key={badge.id}
                    className={`p-4 text-center transition-all ${
                      badge.earned
                        ? 'border-2 border-primary/20 hover:shadow-lg'
                        : 'opacity-50 grayscale'
                    }`}
                  >
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <h4 className="font-semibold text-sm mb-1">{badge.name}</h4>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    {badge.earned && (
                      <Badge variant="default" className="mt-2 text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Earned
                      </Badge>
                    )}
                  </Card>
                ))}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <Card key={activity.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === 'event' ? 'bg-primary/10' : 
                          activity.type === 'issue' ? 'bg-destructive/10' : 'bg-secondary/10'
                        }`}>
                          {activity.type === 'event' ? (
                            <Calendar className="w-5 h-5 text-primary" />
                          ) : activity.type === 'issue' ? (
                            <MapPin className="w-5 h-5 text-destructive" />
                          ) : (
                            <Gift className="w-5 h-5 text-secondary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">{activity.date}</p>
                        </div>
                      </div>
                      <Badge variant={activity.points > 0 ? "secondary" : "outline"} className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {activity.points > 0 ? '+' : ''}{activity.points}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Contribution Rewards */}
            <RewardContribution />

            {/* Leaderboard */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold">Leaderboard</h3>
                  <p className="text-sm text-muted-foreground">Top contributors this month</p>
                </div>
                <Target className="w-8 h-8 text-accent" />
              </div>

              <div className="space-y-3">
                {displayLeaderboard.slice(0, 5).map((entry) => (
                  <Card
                    key={entry.rank}
                    className={`p-4 transition-all ${
                      entry.isCurrentUser
                        ? 'border-2 border-primary shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          entry.rank === 1 ? 'bg-yellow-500 text-white' :
                          entry.rank === 2 ? 'bg-gray-400 text-white' :
                          entry.rank === 3 ? 'bg-amber-700 text-white' :
                          'bg-muted text-foreground'
                        }`}>
                          {entry.rank}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {entry.name}
                            {entry.isCurrentUser && (
                              <Badge variant="default" className="ml-2 text-xs">You</Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Level {Math.floor((entry.points || 0) / 100) + 1}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="font-semibold">
                          {entry.points || 0} pts
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {entry.eventsCompleted || 0} events • {entry.issuesReported || 0} issues
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
