import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, MapPin } from "lucide-react";
import NGONavbar from "@/components/NGONavbar";
import NGOIssuesList from "@/components/NGOIssuesList";
import NGOMapView from "@/components/NGOMapView";

const NGOIssues = () => {
  return (
    <div className="min-h-screen bg-background">
      <NGONavbar />
      <div className="container mx-auto px-4 pt-6 max-w-6xl">
        <div className="mb-6 rounded-md border p-4 bg-muted/30">
          <h2 className="text-xl font-semibold">Issues Management</h2>
          <p className="text-sm text-muted-foreground">
            View all issues reported by citizens. Use the list or map view to pick, triage, and resolve items.
          </p>
        </div>
        
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="list" className="gap-2">
              <List className="w-4 h-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <MapPin className="w-4 h-4" />
              Map View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <NGOIssuesList />
          </TabsContent>
          
          <TabsContent value="map">
            <NGOMapView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NGOIssues;


