import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import User from "../models/User.js";

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads/profiles directory exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file
  },
  fileFilter: (req, file, cb) => {
    console.log('File filter - mimetype:', file.mimetype, 'originalname:', file.originalname);
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
    }
  }
});

const router = Router();

// Track user login
router.post("/login", async (req, res) => {
  try {
    const { email, name, role, organizationType, organizationName, userId } = req.body;
    
    if (!email || !name || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Find or create user
    let user = null;
    
    // If userId is provided and it's a valid MongoDB ObjectId, try to find by ID first
    if (userId) {
      try {
        user = await User.findById(userId);
      } catch (err) {
        // If userId is not a valid ObjectId, continue to find by email
      }
    }
    
    // If not found by ID, find by email
    if (!user) {
      user = await User.findOne({ email });
    }
    
    if (user) {
      // Update login count and last login
      user.loginCount = (user.loginCount || 0) + 1;
      user.lastLogin = new Date();
      // Update other fields if they changed
      if (name) user.name = name;
      if (role) user.role = role;
      if (organizationType !== undefined) user.organizationType = organizationType;
      if (organizationName !== undefined) user.organizationName = organizationName;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        email,
        name,
        role,
        organizationType: organizationType || null,
        organizationName: organizationName || null,
        loginCount: 1,
        lastLogin: new Date(),
        eventsCompleted: 0,
        points: 0,
        level: 1,
        issuesReported: 0,
        impactScore: 0
      });
    }
    
    res.json({ 
      success: true, 
      userId: user._id.toString(),
      loginCount: user.loginCount 
    });
  } catch (err) {
    console.error("Error tracking login:", err);
    res.status(500).json({ error: "Failed to track login" });
  }
});

// Update user points
router.post("/:id/update-points", async (req, res) => {
  try {
    const { id } = req.params;
    const { points, type } = req.body; // type: 'issue', 'event', 'redeem'
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    user.points = (user.points || 0) + points;
    user.level = Math.floor(user.points / 100) + 1;
    
    if (type === 'issue') {
      user.issuesReported = (user.issuesReported || 0) + 1;
    } else if (type === 'event') {
      user.eventsCompleted = (user.eventsCompleted || 0) + 1;
    }
    
    // Recalculate impact score
    user.impactScore = Math.min(100, Math.floor((user.points / 20) + (user.eventsCompleted * 5) + (user.issuesReported * 3)));
    
    await user.save();
    
    res.json({ 
      success: true, 
      points: user.points,
      level: user.level,
      eventsCompleted: user.eventsCompleted,
      issuesReported: user.issuesReported,
      impactScore: user.impactScore
    });
  } catch (err) {
    console.error("Error updating user points:", err);
    res.status(500).json({ error: "Failed to update points" });
  }
});

// Upload profile photo
router.post("/:id/profile-photo", (req, res) => {
  upload.single('profilePhoto')(req, res, async (err) => {
    try {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({ error: err.message || "File upload error" });
      }
      
      const { id } = req.params;
      console.log('Upload request for user:', id);
      
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      console.log('File uploaded:', req.file.filename);
      
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      user.profilePhoto = req.file.filename;
      await user.save();
      
      console.log('Profile photo saved for user:', user.name);
      
      res.json({ 
        success: true, 
        profilePhoto: req.file.filename,
        photoUrl: `/uploads/profiles/${req.file.filename}`
      });
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      res.status(500).json({ error: "Failed to upload profile photo" });
    }
  });
});

// Get leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ points: -1 })
      .limit(10)
      .select('name email points level eventsCompleted issuesReported');
    
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      name: user.name || 'Community Member',
      points: user.points || 0,
      level: user.level || 1,
      eventsCompleted: user.eventsCompleted || 0,
      issuesReported: user.issuesReported || 0,
      _id: user._id
    }));
    
    res.json(leaderboard);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
