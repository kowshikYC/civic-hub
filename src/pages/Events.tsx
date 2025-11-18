import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Users, Clock, Search, Filter, Heart, Sparkles, RefreshCw, Upload, Camera, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const { user, updateUserPoints, trackEventJoined } = useAuth();

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch('http://localhost:5000/api/events', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          setEvents(data.length > 0 ? data : sampleEvents);
        } else {
          console.warn('API response not ok, using sample data');
          setEvents(sampleEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to sample data
        setEvents(sampleEvents);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
    // Load fallback suggestions immediately
    setAiSuggestions(fallbackSuggestions);
    // Then try to load AI suggestions
    loadAISuggestions();
  }, []);

  const fallbackSuggestions = [
    {
      title: "Community Cleanup Drive",
      description: "Organize neighbors to clean and beautify local streets and parks.",
      duration: "3 hours",
      participants: "20-50 people",
      materials: ["Trash bags", "Gloves", "Cleaning supplies"],
      impact: "Cleaner, more attractive neighborhood"
    },
    {
      title: "Neighborhood Safety Walk",
      description: "Community members walk together to identify safety concerns and build connections.",
      duration: "2 hours",
      participants: "15-30 people",
      materials: ["Clipboards", "Pens", "Safety vests"],
      impact: "Improved neighborhood safety awareness"
    },
    {
      title: "Community Garden Project",
      description: "Start a shared garden space where neighbors can grow food and flowers together.",
      duration: "4 hours",
      participants: "20-40 people",
      materials: ["Seeds", "Tools", "Soil", "Planters"],
      impact: "Sustainable food source and green space"
    }
  ];

  const loadAISuggestions = async () => {
    setLoadingAI(true);
    try {
      const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });
      const userContext = user ? `User has ${user.points || 0} points, joined ${user.eventsJoined || 0} events, reported ${user.issuesReported || 0} issues` : "New user";
      
      const response = await fetch('http://localhost:5000/api/ai/suggest-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityNeeds: "Environmental improvement, community safety, social engagement",
          season: currentMonth,
          availableResources: "Community volunteers, local partnerships, basic equipment",
          userContext: userContext
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.events && data.events.length > 0) {
          setAiSuggestions(data.events);
          toast.success("AI suggestions loaded!");
        } else {
          setAiSuggestions(fallbackSuggestions);
        }
      } else {
        setAiSuggestions(fallbackSuggestions);
      }
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
      setAiSuggestions(fallbackSuggestions);
    } finally {
      setLoadingAI(false);
    }
  };

  const sampleEvents = [
    {
      id: 1,
      title: "Community Cleanup Drive",
      description: "Join us for a neighborhood cleanup to make our streets cleaner and greener. Bring gloves and bags!",
      category: "cleanup",
      date: "June 15, 2024",
      time: "9:00 AM - 12:00 PM",
      location: "Central Park",
      participants: 24,
      maxParticipants: 50,
      organizer: "Green Earth NGO",
      points: 50,
      featured: true,
      priority: "high",
      status: "upcoming",
    },
    {
      id: 2,
      title: "Tree Plantation Drive",
      description: "Help us plant 100 trees along the riverside. Contribute to a greener tomorrow!",
      category: "environment",
      date: "June 20, 2024",
      time: "7:00 AM - 11:00 AM",
      location: "Riverside Park",
      participants: 18,
      maxParticipants: 30,
      organizer: "Save Our Planet",
      points: 75,
      featured: false,
      priority: "urgent",
      status: "upcoming",
    },
    {
      id: 3,
      title: "Food Donation Drive",
      description: "Collect and distribute food to families in need. Every contribution counts!",
      category: "donation",
      date: "June 18, 2024",
      time: "2:00 PM - 6:00 PM",
      location: "Community Center",
      participants: 31,
      maxParticipants: 40,
      organizer: "Hope Foundation",
      points: 60,
      featured: true,
      priority: "medium",
      status: "ongoing",
    },
    {
      id: 4,
      title: "Street Art Workshop",
      description: "Beautify public spaces with community art. All skill levels welcome!",
      category: "community",
      date: "June 22, 2024",
      time: "3:00 PM - 7:00 PM",
      location: "Downtown Plaza",
      participants: 12,
      maxParticipants: 25,
      organizer: "Arts for All",
      points: 40,
      featured: false,
      priority: "low",
      status: "upcoming",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    cleanup: "bg-primary/10 text-primary border-primary/20",
    environment: "bg-secondary/10 text-secondary border-secondary/20",
    donation: "bg-accent/10 text-accent border-accent/20",
    community: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };

  const handleProofUpload = async (eventIndex: number, file: File) => {
    const event = joinedEvents[eventIndex];
    
    try {
      // Simulate upload (in real app, upload to server)
      const formData = new FormData();
      formData.append('proof', file);
      formData.append('eventId', event.id?.toString() || 'sample');
      formData.append('userId', user?.id || '');
      
      // Award points for proof upload
      updateUserPoints(event.points || 50, 'event');
      
      // Update joined event status
      setJoinedEvents(prev => 
        prev.map((e, i) => 
          i === eventIndex 
            ? { ...e, proofUploaded: true, proofFile: file.name }
            : e
        )
      );
      
      toast.success(`Proof uploaded successfully!`, {
        description: `You earned ${event.points || 50} points for participating in "${event.title}"!`,
      });
    } catch (error) {
      toast.error("Failed to upload proof. Please try again.");
    }
  };

  const JoinedEventCard = ({ event, onProofUpload, eventIndex }: any) => (
    <Card className="overflow-hidden border-2 border-primary/20">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">{event.title}</h3>
            <p className="text-sm text-muted-foreground">{event.organizer}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">Joined</Badge>
            {event.proofUploaded && (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="w-3 h-3" />
                Completed
              </Badge>
            )}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">{event.description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{event.location}</span>
          </div>
        </div>
        
        {!event.proofUploaded ? (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">Upload participation proof to earn {event.points || 50} points:</p>
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
              <Camera className="w-6 h-6 text-primary mb-2" />
              <span className="text-sm font-medium">Upload Photo Proof</span>
              <span className="text-xs text-muted-foreground">Show your participation</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onProofUpload(eventIndex, file);
                }}
              />
            </label>
          </div>
        ) : (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Participation confirmed!</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              You earned {event.points || 50} points for completing this event.
            </p>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Community Events</h1>
          <p className="text-muted-foreground">
            Join local events and make a difference in your neighborhood
          </p>
        </div>

        {/* AI Suggestion Banner */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">AI-Powered Event Suggestions</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadAISuggestions}
                  disabled={loadingAI}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingAI ? 'animate-spin' : ''}`} />
                  {loadingAI ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                AI-generated event ideas based on community needs and current trends
              </p>
              
              {aiSuggestions.length > 0 ? (
                <div className="space-y-3">
                  {aiSuggestions.slice(0, 2).map((suggestion, index) => (
                    <Card key={index} className="p-4 bg-white/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{suggestion.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{suggestion.description}</p>
                          <div className="flex gap-2 text-xs">
                            <Badge variant="outline" className="text-xs">{suggestion.duration}</Badge>
                            <Badge variant="outline" className="text-xs">{suggestion.participants} participants</Badge>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs"
                          onClick={() => {
                            toast.success(`"${suggestion.title}" added to your event ideas!`, {
                              description: "Contact local organizers to make this event happen."
                            });
                          }}
                        >
                          Save Idea
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {loadingAI ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating AI suggestions...</span>
                    </>
                  ) : (
                    <span>Click refresh to get AI-powered event suggestions</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events by location (e.g., Central Park, Downtown Plaza)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="w-full md:w-auto">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {events
            .filter((event) => {
              if (!searchQuery.trim()) return true;
              const query = searchQuery.toLowerCase();
              return event.location.toLowerCase().includes(query);
            })
            .map((event) => (
            <Card
              key={event._id || event.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20"
            >
              {event.featured && (
                <div className="bg-gradient-to-r from-primary to-secondary px-4 py-2">
                  <div className="flex items-center gap-2 text-white text-sm font-medium">
                    <Heart className="w-4 h-4 fill-white" />
                    Featured Event
                  </div>
                </div>
              )}
              
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-2xl font-bold leading-tight">{event.title}</h3>
                    <div className="flex gap-2">
                      <Badge className={`${categoryColors[event.category]} border`}>
                        {event.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={
                      event.priority === 'urgent' ? 'destructive' :
                      event.priority === 'high' ? 'default' :
                      event.priority === 'medium' ? 'secondary' : 'outline'
                    }>
                      {event.priority} priority
                    </Badge>
                    <Badge variant={
                      event.status === 'ongoing' ? 'default' :
                      event.status === 'upcoming' ? 'secondary' :
                      event.status === 'completed' ? 'outline' : 'destructive'
                    }>
                      {event.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4 text-primary" />
                    <span>
                      {Array.isArray(event.participants) ? event.participants.length : event.participants || 0} / {event.maxParticipants} participants
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Organized by</p>
                    <p className="font-medium">{event.organizer}</p>
                  </div>
                  <Badge variant="secondary" className="text-base font-semibold px-4 py-2">
                    +{event.points} pts
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button 
                    variant={joinedEvents.some(je => je.id === event.id) ? "outline" : "default"}
                    className="w-full"
                    disabled={joinedEvents.some(je => je.id === event.id)}
                    onClick={async () => {
                      if (!user?.id) {
                        toast.error("Please login to join events");
                        return;
                      }
                      
                      try {
                        // For sample events (no _id), award points immediately
                        if (!event._id) {
                          // Check if already joined
                          const alreadyJoined = joinedEvents.some(je => je.id === event.id);
                          if (alreadyJoined) {
                            toast.error("You've already joined this event!");
                            return;
                          }
                          
                          // Add to joined events and award points
                          setJoinedEvents(prev => [...prev, event]);
                          updateUserPoints(event.points || 50, 'event');
                          
                          toast.success(`You've joined "${event.title}"!`, {
                            description: `You earned ${event.points || 50} points!`,
                          });
                          
                          return;
                        }
                        
                        // Join event via API for real events
                        const joinResponse = await fetch(`http://localhost:5000/api/events/${event._id}/join`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            userId: user.id,
                            userName: user.name,
                            userEmail: user.email,
                          }),
                        });
                        
                        if (joinResponse.ok) {
                          // Update user points and track event
                          updateUserPoints(event.points || 50, 'event');
                          
                          toast.success(`You've joined the "${event.title}" event!`, {
                            description: `You earned ${event.points || 50} points!`,
                          });
                        } else {
                          const errorData = await joinResponse.json();
                          toast.error(errorData.error || "Failed to join event");
                        }
                      } catch (err) {
                        toast.error("Failed to join event. Please try again.");
                      }
                    }}
                  >
                    {joinedEvents.some(je => je.id === event.id) ? "Already Joined" : "Join Event"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // This would typically navigate to a detailed event page
                      alert(`More details about "${event.title}"\n\nOrganizer: ${event.organizer}\nDate: ${event.date}\nTime: ${event.time}\nLocation: ${event.location}\n\nDescription: ${event.description}`);
                    }}
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {events.filter((event) => {
            if (!searchQuery.trim()) return false;
            const query = searchQuery.toLowerCase();
            return event.location.toLowerCase().includes(query);
          }).length === 0 && searchQuery.trim() && (
            <div className="col-span-2 text-center py-12">
              <p className="text-muted-foreground">No events found in "{searchQuery}"</p>
              <p className="text-sm text-muted-foreground mt-2">Try searching for a different location</p>
            </div>
          )}
          {/* Load More */}
          <div className="col-span-2 text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Events
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
