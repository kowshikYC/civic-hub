import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Camera, Upload, CheckCircle, MapPin, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ReportIssue = () => {
  const { user, updateUserPoints, trackIssueReported } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    lat: "",
    lng: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string>("");

  const categories = [
    { value: "garbage", label: "Garbage / Waste" },
    { value: "pothole", label: "Pothole / Road Damage" },
    { value: "streetlight", label: "Broken Street Light" },
    { value: "drainage", label: "Drainage / Sewage" },
    { value: "vandalism", label: "Vandalism" },
    { value: "other", label: "Other" },
  ];

  // Get current location coordinates
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      return;
    }

    setGeoLoading(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setFormData((prev) => ({
          ...prev,
          lat,
          lng,
        }));
        setGeoLoading(false);
        toast.success("Location captured successfully!");
      },
      (error) => {
        setGeoLoading(false);
        let errorMsg = "Failed to get location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMsg = "Location request timed out.";
            break;
        }
        setGeoError(errorMsg);
        toast.error(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Auto-fetch location on component mount
  useEffect(() => {
    getCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      try {
      const locationText = formData.location || "Not specified";
      const hasFiles = selectedFiles.length > 0;
      let res: Response;
      if (hasFiles) {
        const fd = new FormData();
        fd.append("title", formData.title);
        fd.append("category", formData.category);
        fd.append("description", formData.description);
        fd.append("location", locationText);
        fd.append("reporterName", user?.name || "Anonymous");
        fd.append("reporterEmail", user?.email || "");
        fd.append("reporterId", user?.id || "");
        fd.append("status", "open");
        if (formData.lat && formData.lng) {
          fd.append("lat", formData.lat);
          fd.append("lng", formData.lng);
        } else {
          // Add default coordinates for testing (NYC area)
          const defaultLat = (40.7589 + Math.random() * 0.05).toFixed(6);
          const defaultLng = (-73.9851 + Math.random() * 0.05).toFixed(6);
          fd.append("lat", defaultLat);
          fd.append("lng", defaultLng);
        }
        selectedFiles.forEach((f) => fd.append("photos", f));
        res = await fetch("http://localhost:5000/api/issues", { method: "POST", body: fd });
      } else {
        const payload: any = {
          title: formData.title,
          category: formData.category,
          description: formData.description,
          location: locationText,
          reporterName: user?.name || "Anonymous",
          reporterEmail: user?.email || "",
          reporterId: user?.id || "",
          status: "open",
        };
        if (formData.lat && formData.lng) {
          payload.coordinates = {
            lat: parseFloat(formData.lat),
            lng: parseFloat(formData.lng),
          };
        } else {
          // Add default coordinates for testing (NYC area)
          payload.coordinates = {
            lat: 40.7589 + Math.random() * 0.05,
            lng: -73.9851 + Math.random() * 0.05,
          };
        }
        res = await fetch("http://localhost:5000/api/issues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) throw new Error("Failed to submit");
      const result = await res.json();
      
      // Update user stats
      updateUserPoints(25, 'issue');
      
      // Show classification result
      if (result.classification) {
        const { issueType, points, reasoning } = result.classification;
        if (issueType === "large") {
          toast.success("Issue reported successfully!", {
            description: "You earned 25 points! This issue has been classified as LARGE and forwarded to NGOs for professional handling.",
          });
        } else {
          toast.success("Issue reported successfully!", {
            description: `You earned 25 points! This issue has been classified as SMALL and is available for community members to solve (${points} points reward).`,
          });
        }
      } else {
        toast.success("Issue reported successfully!", {
          description: "You earned 25 points! Municipal authorities have been notified.",
        });
      }
      
      setFormData({ title: "", category: "", description: "", location: "", lat: "", lng: "" });
      setSelectedFiles([]);
      // Re-fetch location for next report
      getCurrentLocation();
    } catch (err) {
      toast.error("Unable to submit issue", { description: (err as Error).message });
    }
  };



  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Report an Issue</h1>
          <p className="text-muted-foreground text-lg">
            Help improve your community by reporting local problems
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Fast Response</p>
            <p className="text-xs text-muted-foreground">Authorities notified instantly</p>
          </Card>
          <Card className="p-4 text-center">
            <Camera className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Photo Verification</p>
            <p className="text-xs text-muted-foreground">Upload proof of the issue</p>
          </Card>
          <Card className="p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Track Progress</p>
            <p className="text-xs text-muted-foreground">Get real-time updates</p>
          </Card>
        </div>

        {/* Report Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Broken street light on Main Street"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select issue category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about the issue..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                required
              />
            </div>

            {/* Coordinates Section */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location Coordinates
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatically captured from your device location
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={geoLoading}
                >
                  {geoLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Getting...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
              </div>

              {geoError && (
                <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                  {geoError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="text"
                    placeholder="e.g., 40.7128"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    readOnly
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="text"
                    placeholder="e.g., -74.0060"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    readOnly
                    className="bg-background"
                  />
                </div>
              </div>

              {formData.lat && formData.lng && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Location coordinates captured</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Upload Photos (Optional)</Label>
              <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                <label className="flex flex-col items-center justify-center p-8 cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium mb-1">Click to upload photos</p>
                  <p className="text-xs text-muted-foreground">
                    Before and after photos help resolve issues faster
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setSelectedFiles(files);
                    }}
                  />
                </label>
              </Card>
              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {selectedFiles.map((file, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(file)}
                      alt={`preview-${idx}`}
                      className="w-full h-24 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>


            <div className="flex gap-4 pt-4">
              <Button type="submit" variant="hero" size="lg" className="flex-1">
                <AlertCircle className="w-5 h-5" />
                Submit Report
              </Button>
              <Button type="button" variant="outline" size="lg">
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Privacy Notice */}
        <Card className="mt-8 p-6 bg-muted/50">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Your report helps everyone
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All reports are reviewed by municipal authorities. Your identity is kept confidential, 
            and you'll receive updates on the resolution progress. Thank you for making your community better!
          </p>
        </Card>
      </div>
    </div>
  );
};

export default ReportIssue;
