import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

type Issue = {
  _id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  status: "open" | "in_progress" | "resolved";
  issueType?: "large" | "small";
  points?: number;
  createdAt: string;
};

const fetchIssues = async (): Promise<Issue[]> => {
  // Fetch all issues for NGO section
  const res = await fetch("/api/issues");
  if (!res.ok) throw new Error("Failed to fetch issues");
  return res.json();
};

const updateIssue = async ({ id, status }: { id: string; status: Issue["status"] }) => {
  const res = await fetch(`/api/issues/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update issue");
  return res.json();
};

const NGOIssuesList = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({ 
    queryKey: ["issues"], 
    queryFn: fetchIssues,
    refetchInterval: 5000 // Refetch every 5 seconds for real-time updates
  });
  const mutation = useMutation({
    mutationFn: updateIssue,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["issues"] }),
  });
  
  // Track progress percentages for each issue
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  
  // Update progress based on status
  useEffect(() => {
    if (data) {
      const newProgressMap: Record<string, number> = {};
      data.forEach(issue => {
        if (issue.status === "open") newProgressMap[issue._id] = 0;
        else if (issue.status === "in_progress") newProgressMap[issue._id] = 50;
        else if (issue.status === "resolved") newProgressMap[issue._id] = 100;
      });
      setProgressMap(newProgressMap);
    }
  }, [data]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <h1 className="text-3xl font-bold">Community Issues - NGO Workspace</h1>
      <p className="text-muted-foreground">All reported issues from citizens requiring attention</p>
      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {error && <p className="text-destructive">{(error as Error).message}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {data?.map((issue) => {
          const isVeryImportant = issue.status === "open";
          return (
          <Card
            key={issue._id}
            className={`p-4 space-y-3 border ${isVeryImportant ? "border-red-300 bg-red-50/40" : ""}`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">{issue.title}</h2>
              <Badge variant="secondary">{issue.category}</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">{issue.description}</p>
            
            {/* Status and Progress Tracking */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{issue.location}</span>
                <div className="flex items-center gap-2">
                  {issue.status === "open" && <AlertCircle className="h-4 w-4 text-red-500" />}
                  {issue.status === "in_progress" && <Clock className="h-4 w-4 text-amber-500" />}
                  {issue.status === "resolved" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  <Badge
                    className={isVeryImportant ? "bg-red-600 text-white" : undefined}
                    variant={
                      issue.status === "resolved"
                        ? "default"
                        : issue.status === "in_progress"
                        ? "outline"
                        : "secondary"
                    }
                  >
                    {issue.status === "open" ? "Needs Attention" : 
                     issue.status === "in_progress" ? "Solving" : "Solved"}
                  </Badge>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-1">
                <Progress value={progressMap[issue._id] || 0} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Reported</span>
                  <span>In Progress</span>
                  <span>Resolved</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">View details</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{issue.title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">Category: {issue.category}</div>
                    <div className="text-sm">{issue.description}</div>
                    <div className="text-sm text-muted-foreground">Location: {issue.location}</div>
                    <div className="text-xs text-muted-foreground">Reported: {new Date(issue.createdAt).toLocaleString()}</div>
                    
                    {/* Status Progress Tracking */}
                    <div className="space-y-2 pt-2 border-t">
                      <h3 className="text-sm font-medium">Progress Tracking</h3>
                      <Progress value={progressMap[issue._id] || 0} className="h-3" />
                      
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <Button 
                          variant={issue.status === "open" ? "default" : "outline"} 
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => mutation.mutate({ id: issue._id, status: "open" })}
                          disabled={mutation.isPending}
                        >
                          <AlertCircle className="h-4 w-4" />
                          <span>Needs Attention</span>
                        </Button>
                        
                        <Button 
                          variant={issue.status === "in_progress" ? "default" : "outline"} 
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => mutation.mutate({ id: issue._id, status: "in_progress" })}
                          disabled={mutation.isPending}
                        >
                          <Clock className="h-4 w-4" />
                          <span>Solving</span>
                        </Button>
                        
                        <Button 
                          variant={issue.status === "resolved" ? "default" : "outline"} 
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => mutation.mutate({ id: issue._id, status: "resolved" })}
                          disabled={mutation.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Solved</span>
                        </Button>
                      </div>
                    </div>
                    
                    {isVeryImportant && (
                      <p className="text-xs font-medium text-red-700">Very important to solve</p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex gap-2">
                {issue.status === "open" && (
                  <Button
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => mutation.mutate({ id: issue._id, status: "in_progress" })}
                    disabled={mutation.isPending}
                  >
                    <Clock className="h-4 w-4" />
                    Start Solving
                  </Button>
                )}
                {issue.status === "in_progress" && (
                  <Button
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => mutation.mutate({ id: issue._id, status: "resolved" })}
                    disabled={mutation.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Solved
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );})}
        {!isLoading && !error && (!data || data.length === 0) && (
          <p className="text-muted-foreground">No reports yet.</p>
        )}
      </div>
    </div>
  );
};

export default NGOIssuesList;


