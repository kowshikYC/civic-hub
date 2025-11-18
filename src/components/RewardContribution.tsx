import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Award, Image as ImageIcon, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const RewardContribution = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    points: number;
    message: string;
    category: string;
    valid: boolean;
    detections?: Array<{class: string, confidence: number}>;
  } | null>(null);
  const { toast } = useToast();
  const { user, updateUserPoints } = useAuth();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      setImage(selectedImage);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedImage);
      
      // Reset result when new image is selected
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!image) {
      toast({
        title: "No image selected",
        description: "Please select an image to analyze",
        variant: "destructive",
      });
      return;
    }
    
    // Reset previous results and errors
    setResult(null);
    setValidationError(null);
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("description", description);
      if (user?.id) {
        formData.append("userId", user.id);
      }
      
      const response = await fetch("http://localhost:5000/api/analyze-contribution", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setValidationError(data.error || "Failed to analyze image");
        toast({
          title: "Validation Failed",
          description: data.error || "This doesn't appear to be a valid civic contribution",
          variant: "destructive",
        });
        return;
      }
      
      setResult(data);
      
      // Only update points if the image is valid
      if (data.valid && data.points && updateUserPoints) {
        updateUserPoints(data.points);
        toast({
          title: "Points awarded!",
          description: `You've earned ${data.points} points for your contribution!`,
        });
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        title: "Error",
        description: "Failed to analyze your contribution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Earn Rewards for Your Contributions
        </CardTitle>
        <CardDescription>
          Upload an image of your civic contribution to earn points and badges
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contribution-image">Upload Contribution Image</Label>
            <div className="flex items-center gap-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Input
                  id="contribution-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                  className="cursor-pointer"
                />
              </div>
              {preview && (
                <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Describe Your Contribution</Label>
            <Textarea
              id="description"
              placeholder="Describe what civic contribution you made (e.g., community cleanup, tree planting, etc.)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Adding a clear description helps us validate your contribution and award appropriate points.
            </p>
          </div>
          
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Failed</AlertTitle>
              <AlertDescription>
                {validationError}
              </AlertDescription>
            </Alert>
          )}
          
          {preview && (
            <div className="mt-2 relative aspect-video rounded-lg border overflow-hidden bg-muted">
              <img 
                src={preview} 
                alt="Contribution preview" 
                className="object-cover w-full h-full"
              />
            </div>
          )}
          
          <Button
            type="submit"
            className="w-full"
            disabled={!image || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Submit Contribution
              </>
            )}
          </Button>
          
          {result && (
            <div className="mt-4 p-4 rounded-lg border bg-muted/50">
              <div className="font-medium text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                {result.points} Points Earned!
              </div>
              <p className="text-sm mt-1">{result.message}</p>
              
              {/* Category tag */}
              <div className="mt-2">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                  {result.category}
                </span>
              </div>
              
              {/* ML Detection Results */}
              {result.detections && result.detections.length > 0 && (
                <div className="mt-3 border-t pt-3">
                  <h4 className="text-sm font-medium mb-2">ML Detection Results:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {result.detections.map((detection, index) => (
                      <div key={index} className="flex items-center justify-between bg-background rounded p-2 text-xs">
                        <span className="font-medium">{detection.class}</span>
                        <span className="text-muted-foreground">{(detection.confidence * 100).toFixed(0)}% confidence</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Badge earned */}
              {result.badge && (
                <div className="mt-4 border rounded-lg p-3 bg-background">
                  <div className="flex items-center gap-3">
                    {/* Display the appropriate icon based on badge type */}
                    {result.badge.icon === "trash-2" && <Trash2 className="h-8 w-8 text-primary" />}
                    {result.badge.icon === "tree" && <Tree className="h-8 w-8 text-green-600" />}
                    {result.badge.icon === "recycle" && <Recycle className="h-8 w-8 text-blue-600" />}
                    {result.badge.icon === "users" && <Users className="h-8 w-8 text-purple-600" />}
                    {result.badge.icon === "tool" && <Tool className="h-8 w-8 text-orange-600" />}
                    {result.badge.icon === "award" && <Award className="h-8 w-8 text-yellow-600" />}
                    
                    <div>
                      <h4 className="font-semibold">Badge Earned: {result.badge.name}</h4>
                      <p className="text-xs text-muted-foreground">{result.badge.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Images are analyzed using AI to verify and categorize your contribution
      </CardFooter>
    </Card>
  );
};

export default RewardContribution;