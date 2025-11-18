import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Zap, CheckCircle2 } from "lucide-react";

export type Issue = {
  _id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  status: "open" | "in_progress" | "resolved";
  issueType?: "large" | "small";
  points?: number;
  solverId?: string;
  solverRewarded?: boolean;
  createdAt: string;
};

const fetchIssues = async (): Promise<Issue[]> => {
  // Only fetch small issues for consumer section
  const res = await fetch("http://localhost:5000/api/issues?issueType=small");
  if (!res.ok) throw new Error("Failed to fetch issues");
  return res.json();
};

const resolveIssue = async ({ id, solverId }: { id: string; solverId: string }) => {
  const res = await fetch(`http://localhost:5000/api/issues/${id}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ solverId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.error || "Failed to resolve issue");
    (error as any).id = id;
    (error as any).details = errorData.details;
    throw error;
  }
  return res.json();
};

const IssuesList = () => {
  const { user, updateUserPoints } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({ 
    queryKey: ["issues", "small"], 
    queryFn: fetchIssues 
  });

  const resolveMutation = useMutation({
    mutationFn: resolveIssue,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["issues", "small"] });
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      if (data.pointsAwarded > 0) {
        // Update user points in the frontend
        if (updateUserPoints) {
          updateUserPoints(data.pointsAwarded);
        }
        toast.success(`Issue resolved! You earned ${data.pointsAwarded} points!`);
      } else {
        toast.success("Issue resolved!");
      }
    },
    onError: (error) => {
      let errorMessage = "Failed to resolve issue";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Use details if available
        if ((error as any).details) {
          errorMessage = `${errorMessage}: ${(error as any).details}`;
        }
      }
      toast.error("Failed to resolve issue", { description: errorMessage });
    },
  });

  const handleResolve = (issueId: string) => {
    if (!user?.id) {
      toast.error("Please login to resolve issues");
      return;
    }
    console.log("Resolving issue:", { issueId, solverId: user.id });
    resolveMutation.mutate({ id: issueId, solverId: user.id });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Issues</h1>
          <p className="text-muted-foreground mt-1">Small issues you can help solve and earn points!</p>
        </div>
      </div>
      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {error && <p className="text-destructive">{(error as Error).message}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {data?.map((issue) => {
          const canSolve = issue.status === "open" && user?.id;
          const isResolved = issue.status === "resolved";
          return (
          <Card
            key={issue._id}
            className={`p-4 space-y-3 border ${
              isResolved 
                ? "border-green-300 bg-green-50/40" 
                : canSolve 
                ? "border-primary/30 bg-primary/5" 
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">{issue.title}</h2>
              <Badge variant="secondary">{issue.category}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{issue.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{issue.location}</span>
              {issue.points && issue.points > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  +{issue.points} pts
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <Badge
                variant={
                  issue.status === "resolved"
                    ? "default"
                    : issue.status === "in_progress"
                    ? "outline"
                    : "secondary"
                }
              >
                {issue.status === "resolved" 
                  ? "Resolved" 
                  : issue.status === "in_progress" 
                  ? "In Progress" 
                  : "Open"}
              </Badge>
              {canSolve && (
                <Button
                  size="sm"
                  onClick={() => handleResolve(issue._id)}
                  disabled={resolveMutation.isPending}
                  className="flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Solve & Earn {issue.points || 0} Points
                </Button>
              )}
              {isResolved && issue.solverId === user?.id && issue.points && issue.points > 0 && (
                <p className="text-xs text-green-600 font-medium">
                  ✓ You earned {issue.points} points!
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{new Date(issue.createdAt).toLocaleString()}</p>
          </Card>
        );})}
        {!isLoading && !error && (!data || data.length === 0) && (
          <div className="col-span-2 text-center py-12">
            <p className="text-muted-foreground">No small issues available yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Large issues are automatically forwarded to NGOs.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuesList;


