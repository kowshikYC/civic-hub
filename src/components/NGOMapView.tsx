import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle, Clock, CheckCircle, User, Calendar } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const NGOMapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Sample issues for fallback
  const sampleIssues = [
    {
      _id: '1',
      title: 'Broken Street Light',
      description: 'Street light not working on Main Street',
      location: 'Main Street & 5th Ave',
      coordinates: { lat: 40.7589, lng: -73.9851 },
      status: 'open',
      category: 'streetlight',
      reporterName: 'John Doe',
      createdAt: new Date().toISOString()
    },
    {
      _id: '2', 
      title: 'Pothole on Broadway',
      description: 'Large pothole causing traffic issues',
      location: 'Broadway & 42nd St',
      coordinates: { lat: 40.7580, lng: -73.9855 },
      status: 'in_progress',
      category: 'pothole',
      reporterName: 'Jane Smith',
      createdAt: new Date().toISOString()
    },
    {
      _id: '3',
      title: 'Garbage Overflow',
      description: 'Trash bin overflowing in Central Park',
      location: 'Central Park East',
      coordinates: { lat: 40.7829, lng: -73.9654 },
      status: 'resolved',
      category: 'garbage',
      reporterName: 'Mike Johnson',
      createdAt: new Date().toISOString()
    }
  ];

  // Initialize with sample data immediately
  useEffect(() => {
    setIssues(sampleIssues);
    
    // Then try to fetch real data
    const fetchIssues = async () => {
      try {
        const response = await fetch('/api/issues');
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setIssues(data);
          }
        }
      } catch (error) {
        console.error('Error fetching issues:', error);
      }
    };
    fetchIssues();
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current) return;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.7589, lng: -73.9851 },
        zoom: 13
      });

      setMap(mapInstance);
    };

    if (window.google) {
      initializeMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBgWpr1pB55092SKAWI6rSzgABrkZkKEic`;
      script.onload = initializeMap;
      document.head.appendChild(script);
    }
  }, []);

  // Add issue markers to map
  useEffect(() => {
    if (!map || !issues.length) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    const newMarkers: any[] = [];

    issues.forEach(issue => {
      if (!issue.coordinates?.lat || !issue.coordinates?.lng) {
        console.log('Issue missing coordinates:', issue.title);
        return;
      }

      const color = issue.status === 'open' ? '#ef4444' : 
                   issue.status === 'in_progress' ? '#f59e0b' : '#10b981';
      
      const marker = new window.google.maps.Marker({
        position: { lat: issue.coordinates.lat, lng: issue.coordinates.lng },
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
        setSelectedIssue(issue);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  }, [map, issues]);

  const handleUpdateStatus = async (issueId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setIssues(issues.map(issue => 
          issue._id === issueId ? { ...issue, status: newStatus } : issue
        ));
        setSelectedIssue(prev => prev?._id === issueId ? { ...prev, status: newStatus } : prev);
        toast.success(`Issue marked as ${newStatus.replace('_', ' ')}`);
      } else {
        throw new Error('Failed to update issue');
      }
    } catch (error) {
      console.error('Error updating issue:', error);
      toast.error('Failed to update issue');
    }
  };



  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Issues Map</h2>
        <p className="text-muted-foreground">
          View all citizen-reported issues on the map with their exact locations
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold">Interactive Issues Map</h3>
              <p className="text-sm text-muted-foreground">Click on markers to view issue details</p>
            </div>
            <div ref={mapRef} className="w-full h-[600px] bg-gray-100" />
          </Card>
        </div>

        {/* Details Panel */}
        <div className="space-y-6">
          {/* Legend */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Status Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-sm">Open Issues</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-sm">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm">Resolved</span>
              </div>
            </div>
          </Card>

          {/* Selected Issue Details */}
          {selectedIssue && (
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedIssue.status === 'open' ? 'bg-red-500' :
                    selectedIssue.status === 'in_progress' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>
                    {selectedIssue.status === 'open' ? (
                      <AlertCircle className="w-5 h-5 text-white" />
                    ) : selectedIssue.status === 'in_progress' ? (
                      <Clock className="w-5 h-5 text-white" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{selectedIssue.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedIssue.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{selectedIssue.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-primary" />
                    <span>Reported by {selectedIssue.reporterName || 'Anonymous'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{new Date(selectedIssue.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={
                      selectedIssue.status === 'open' ? 'destructive' :
                      selectedIssue.status === 'in_progress' ? 'default' : 'secondary'
                    }>
                      {selectedIssue.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">
                      {selectedIssue.category}
                    </Badge>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  {selectedIssue.status === 'open' && (
                    <Button 
                      className="w-full" 
                      onClick={() => handleUpdateStatus(selectedIssue._id, 'in_progress')}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Start Working
                    </Button>
                  )}
                  {(selectedIssue.status === 'open' || selectedIssue.status === 'in_progress') && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleUpdateStatus(selectedIssue._id, 'resolved')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Solved
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Issue Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Issues</span>
                <span className="font-semibold">{issues.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Open</span>
                <span className="font-semibold text-red-600">
                  {issues.filter(i => i.status === 'open').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">In Progress</span>
                <span className="font-semibold text-yellow-600">
                  {issues.filter(i => i.status === 'in_progress').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Resolved</span>
                <span className="font-semibold text-green-600">
                  {issues.filter(i => i.status === 'resolved').length}
                </span>
              </div>
            </div>
            
            <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
              {map ? `Map loaded with ${issues.length} issues` : 'Initializing map...'}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NGOMapView;