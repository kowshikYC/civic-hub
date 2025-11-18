import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, AlertCircle, Users, Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const MapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showEvents, setShowEvents] = useState(true);
  const [showIssues, setShowIssues] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);

  // Sample data with coordinates
  const sampleEvents = [
    {
      id: 1,
      title: "Community Cleanup Drive",
      description: "Join us for a neighborhood cleanup",
      location: "Central Park",
      lat: 40.7829,
      lng: -73.9654,
      type: "event",
      category: "cleanup",
      date: "June 15, 2024",
      participants: 24,
      maxParticipants: 50,
      points: 50,
      priority: "high",
      status: "upcoming"
    },
    {
      id: 2,
      title: "Tree Plantation Drive",
      description: "Help us plant 100 trees",
      location: "Riverside Park",
      lat: 40.7956,
      lng: -73.9722,
      type: "event",
      category: "environment",
      date: "June 20, 2024",
      participants: 18,
      maxParticipants: 30,
      points: 75,
      priority: "urgent",
      status: "ongoing"
    }
  ];

  const sampleIssues = [
    {
      id: 1,
      title: "Broken Street Light",
      description: "Street light not working on Main St",
      location: "Main Street & 5th Ave",
      lat: 40.7614,
      lng: -73.9776,
      type: "issue",
      category: "streetlight",
      status: "open",
      priority: "medium"
    },
    {
      id: 2,
      title: "Pothole on Road",
      description: "Large pothole causing traffic issues",
      location: "Broadway & 42nd St",
      lat: 40.7580,
      lng: -73.9855,
      type: "issue",
      category: "pothole",
      status: "in_progress",
      priority: "high"
    }
  ];

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = () => {
      if (!window.google || !mapRef.current) return;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.7829, lng: -73.9654 }, // NYC coordinates
        zoom: 13,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      setMap(mapInstance);
    };

    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBgWpr1pB55092SKAWI6rSzgABrkZkKEic&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    // Fetch data
    setEvents(sampleEvents);
    setIssues(sampleIssues);
  }, []);

  // Add markers to map
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    const newMarkers: any[] = [];

    // Add event markers
    if (showEvents) {
      events.forEach(event => {
        const eventColor = event.priority === 'urgent' ? '#dc2626' : 
                          event.priority === 'high' ? '#ea580c' :
                          event.priority === 'medium' ? '#10b981' : '#6b7280';
        
        const marker = new window.google.maps.Marker({
          position: { lat: event.lat, lng: event.lng },
          map: map,
          title: event.title,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="${eventColor}" stroke="white" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="16">📅</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32)
          }
        });

        marker.addListener('click', () => {
          setSelectedItem(event);
        });

        newMarkers.push(marker);
      });
    }

    // Add issue markers
    if (showIssues) {
      issues.forEach(issue => {
        const color = issue.priority === 'high' ? '#ef4444' : 
                     issue.priority === 'medium' ? '#f59e0b' : '#6b7280';
        
        const marker = new window.google.maps.Marker({
          position: { lat: issue.lat, lng: issue.lng },
          map: map,
          title: issue.title,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="${color}" stroke="white" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="16">⚠️</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32)
          }
        });

        marker.addListener('click', () => {
          setSelectedItem(issue);
        });

        newMarkers.push(marker);
      });
    }

    setMarkers(newMarkers);
  }, [map, showEvents, showIssues, events, issues]);

  const handleJoinEvent = (event: any) => {
    toast.success(`Joined "${event.title}"!`, {
      description: `You earned ${event.points} points!`
    });
  };

  const handleReportProgress = (issue: any) => {
    toast.success(`Progress reported for "${issue.title}"!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Community Map</h1>
          <p className="text-muted-foreground">
            Explore events and issues in your neighborhood
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center gap-4">
                  <Button
                    variant={showEvents ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowEvents(!showEvents)}
                    className="gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Events
                  </Button>
                  <Button
                    variant={showIssues ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowIssues(!showIssues)}
                    className="gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Issues
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                </div>
              </div>
              <div ref={mapRef} className="w-full h-[600px]" />
            </Card>
          </div>

          {/* Details Panel */}
          <div className="space-y-6">
            {/* Legend */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Map Legend</h3>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground mb-1">EVENTS</div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-600"></div>
                  <span className="text-sm">Urgent Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-600"></div>
                  <span className="text-sm">High Priority Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm">Medium Priority Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                  <span className="text-sm">Low Priority Events</span>
                </div>
                <div className="text-xs font-semibold text-muted-foreground mb-1 mt-3">ISSUES</div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-sm">High Priority Issues</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Medium Priority Issues</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                  <span className="text-sm">Low Priority Issues</span>
                </div>
              </div>
            </Card>

            {/* Selected Item Details */}
            {selectedItem && (
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedItem.type === 'event' ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {selectedItem.type === 'event' ? (
                        <Calendar className="w-5 h-5 text-white" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{selectedItem.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedItem.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{selectedItem.location}</span>
                    </div>
                    
                    {selectedItem.type === 'event' && (
                      <>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>{selectedItem.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-primary" />
                          <span>{selectedItem.participants}/{selectedItem.maxParticipants} participants</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            selectedItem.priority === 'urgent' ? 'destructive' :
                            selectedItem.priority === 'high' ? 'default' :
                            selectedItem.priority === 'medium' ? 'secondary' : 'outline'
                          }>
                            {selectedItem.priority} priority
                          </Badge>
                          <Badge variant={
                            selectedItem.status === 'ongoing' ? 'default' :
                            selectedItem.status === 'upcoming' ? 'secondary' :
                            selectedItem.status === 'completed' ? 'outline' : 'destructive'
                          }>
                            {selectedItem.status}
                          </Badge>
                        </div>
                      </>
                    )}

                    {selectedItem.type === 'issue' && (
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          selectedItem.status === 'open' ? 'destructive' :
                          selectedItem.status === 'in_progress' ? 'default' : 'secondary'
                        }>
                          {selectedItem.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {selectedItem.priority} priority
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    {selectedItem.type === 'event' ? (
                      <Button 
                        className="w-full" 
                        onClick={() => handleJoinEvent(selectedItem)}
                      >
                        Join Event (+{selectedItem.points} pts)
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleReportProgress(selectedItem)}
                      >
                        Report Progress
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Active Events</span>
                  <span className="font-semibold">{events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Open Issues</span>
                  <span className="font-semibold">{issues.filter(i => i.status === 'open').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">In Progress</span>
                  <span className="font-semibold">{issues.filter(i => i.status === 'in_progress').length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;