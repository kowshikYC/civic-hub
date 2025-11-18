import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import EventHandlerNavbar from "@/components/EventHandlerNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, MapPin, Clock, Plus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Event = {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  maxParticipants: number;
  organizer: string;
  organizerId: string;
  points: number;
  participants: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    joinedAt: string;
  }>;
};

const fetchEvents = async (organizerId: string): Promise<Event[]> => {
  const res = await fetch(`http://localhost:5000/api/events/organizer/${organizerId}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || error.details || "Failed to fetch events");
  }
  return res.json();
};

const createEvent = async (eventData: any) => {
  const res = await fetch("http://localhost:5000/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create event");
  }
  return res.json();
};

const EventHandlerDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    time: "",
    location: "",
    maxParticipants: "",
    points: "50",
  });

  const { data: events, isLoading, error: eventsError } = useQuery({
    queryKey: ["events", "organizer", user?.id],
    queryFn: () => {
      if (!user?.id) {
        throw new Error("User not logged in");
      }
      return fetchEvents(user.id);
    },
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", "organizer", user?.id] });
      toast.success("Event created successfully!");
      setCreateEventOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "",
        date: "",
        time: "",
        location: "",
        maxParticipants: "",
        points: "50",
      });
    },
    onError: (error) => {
      toast.error("Failed to create event", { description: (error as Error).message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !user?.name) {
      toast.error("User information missing");
      return;
    }

    createMutation.mutate({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      maxParticipants: parseInt(formData.maxParticipants),
      organizer: user.name,
      organizerId: user.id,
      points: parseInt(formData.points) || 50,
      featured: false,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Please login to access the event handler dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <EventHandlerNavbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Event Handler Dashboard</h1>
            <p className="text-muted-foreground">Create and manage your events</p>
          </div>
          <Dialog open={createEventOpen} onOpenChange={setCreateEventOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Community Cleanup Drive"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cleanup">Cleanup</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="donation">Donation</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your event..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      placeholder="e.g., 9:00 AM - 12:00 PM"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Central Park"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max Participants *</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      min="1"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points">Points Reward</Label>
                    <Input
                      id="points"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateEventOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Event"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading && <p className="text-muted-foreground">Loading events...</p>}
        {eventsError && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-destructive">
              Error loading events: {(eventsError as Error).message}
            </p>
          </div>
        )}

        {/* Events List */}
        {events && events.length > 0 && (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event._id} className="p-6 hover:shadow-lg transition-all">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                      <p className="text-muted-foreground">{event.description}</p>
                    </div>
                    <Badge variant="secondary">{event.category}</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{event.participants?.length || 0} / {event.maxParticipants} participants</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Badge variant="outline" className="text-base font-semibold">
                      +{event.points} pts
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Organized by {event.organizer}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !eventsError && (!events || events.length === 0) && (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-bold">No events yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first event to get started
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EventHandlerDashboard;