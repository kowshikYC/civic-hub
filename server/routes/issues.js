import { Router } from "express";
import Issue from "../models/Issue.js";
import User from "../models/User.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { classifyIssue } from "../utils/issueClassification.js";

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || "");
    cb(null, `${unique}${ext}`);
  },
});
const upload = multer({ storage });

// Get issues with optional filtering
router.get("/", async (req, res) => {
  try {
    const { issueType, status } = req.query;
    const query = {};
    
    // Filter by issue type if provided
    if (issueType === "large" || issueType === "small") {
      query.issueType = issueType;
    }
    
    // Filter by status if provided
    if (status && ["open", "in_progress", "resolved"].includes(status)) {
      query.status = status;
    }
    
    const issues = await Issue.find(query).sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    console.error("Error fetching issues:", err);
    res.status(500).json({ error: "Failed to list issues" });
  }
});

router.post("/", upload.array("photos", 6), async (req, res) => {
  try {
    const { title, category, description, location, userId, coordinates, lat, lng, reporterName, reporterEmail, reporterId, status } = req.body || {};
    let coordObj = coordinates;
    if (!coordObj && lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      if (!Number.isNaN(latNum) && !Number.isNaN(lngNum)) coordObj = { lat: latNum, lng: lngNum };
    }
    const photos = (req.files || []).map((f) => `/uploads/${path.basename(f.path)}`);
    
    // Classify issue using Gemini API
    const classification = await classifyIssue(title, description, category);
    
    // Log classification for debugging
    console.log("Issue Classification:", {
      title,
      category,
      issueType: classification.issueType,
      points: classification.points
    });
    
    const issue = await Issue.create({ 
      title, 
      category, 
      description, 
      location, 
      userId, 
      reporterName,
      reporterEmail,
      reporterId,
      coordinates: coordObj, 
      photos,
      status: status || "open",
      issueType: classification.issueType,
      points: classification.points || (classification.issueType === "small" ? 25 : 0)
    });
    
    res.status(201).json({
      ...issue.toObject(),
      classification: {
        issueType: classification.issueType,
        points: classification.points,
        reasoning: classification.reasoning
      }
    });
  } catch (err) {
    console.error("Error creating issue:", err);
    res.status(400).json({ error: "Failed to create issue" });
  }
});

// Update issue status or fields
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ["title", "category", "description", "location", "status", "coordinates", "solverId"];
    const update = Object.fromEntries(
      Object.entries(req.body || {}).filter(([k]) => allowed.includes(k))
    );
    const updated = await Issue.findByIdAndUpdate(id, update, { new: true });
    if (!updated) return res.status(404).json({ error: "Issue not found" });
    res.json(updated);
  } catch (err) {
    console.error("Error updating issue:", err);
    res.status(400).json({ error: "Failed to update issue" });
  }
});

// Mark issue as resolved and award points to solver
router.post("/:id/resolve", async (req, res) => {
  try {
    const { id } = req.params;
    const { solverId } = req.body;
    
    console.log("Resolve request received:", { id, solverId });
    
    if (!solverId) {
      return res.status(400).json({ error: "Solver ID is required" });
    }
    
    if (!id) {
      return res.status(400).json({ error: "Issue ID is required" });
    }
    
    let issue;
    try {
      // Try to find issue by ID
      issue = await Issue.findById(id);
      if (!issue) {
        // Try finding by any field that might match
        issue = await Issue.findOne({ _id: id }).catch(() => null);
      }
    } catch (err) {
      console.error("Error finding issue:", err);
      return res.status(400).json({ 
        error: "Invalid issue ID format",
        details: err instanceof Error ? err.message : "Unknown error"
      });
    }
    
    if (!issue) {
      console.error("Issue not found with ID:", id);
      return res.status(404).json({ error: "Issue not found" });
    }
    
    console.log("Issue found:", { 
      id: issue._id, 
      status: issue.status, 
      issueType: issue.issueType, 
      points: issue.points,
      solverRewarded: issue.solverRewarded 
    });
    
    // Check if already resolved
    if (issue.status === "resolved") {
      return res.status(400).json({ error: "Issue is already resolved" });
    }
    
    // Only award points for small issues that haven't been rewarded yet
    let pointsAwarded = 0;
    if (issue.issueType === "small" && !issue.solverRewarded && issue.points > 0) {
      pointsAwarded = issue.points;
      issue.solverRewarded = true;
    }
    
    issue.status = "resolved";
    if (solverId) {
      issue.solverId = solverId;
    }
    
    await issue.save();
    
    // Update user points in the database
    if (pointsAwarded > 0 && solverId) {
      try {
        // Try to find user by MongoDB ObjectId or by string ID
        let solver = await User.findById(solverId).catch(() => null);
        if (!solver) {
          // Try finding by email or other identifier if ID format doesn't match
          solver = await User.findOne({ email: solverId }).catch(() => null);
        }
        
        if (solver) {
          const currentPoints = solver.points || 0;
          const newPoints = currentPoints + pointsAwarded;
          solver.points = newPoints;
          
          // Calculate level (simple calculation: 1 level per 100 points)
          solver.level = Math.floor(newPoints / 100) + 1;
          
          // Recalculate impact score
          const calculateImpactScore = (points, events, issues) => {
            return Math.floor((points * 0.4) + (events * 20) + (issues * 15));
          };
          solver.impactScore = calculateImpactScore(
            newPoints,
            solver.eventsCompleted || 0,
            solver.issuesReported || 0
          );
          
          await solver.save();
          console.log("User points updated:", { solverId: solver._id, pointsAwarded, newPoints });
        } else {
          console.log("User not found in database for solverId:", solverId);
        }
      } catch (userErr) {
        console.error("Error updating user points:", userErr);
        // Don't fail the request if user update fails
      }
    }
    
    console.log("Issue resolved successfully:", { pointsAwarded });
    
    res.json({
      ...issue.toObject(),
      pointsAwarded,
      message: pointsAwarded > 0 ? `Points awarded: ${pointsAwarded}` : "No points awarded (large issue or already rewarded)"
    });
  } catch (err) {
    console.error("Error resolving issue:", err);
    res.status(400).json({ 
      error: "Failed to resolve issue",
      details: err instanceof Error ? err.message : "Unknown error"
    });
  }
});

export default router;
