import { Router } from "express";
import Issue from "../models/Issue.js";
import User from "../models/User.js";

const router = Router();

// Get real-time statistics
router.get("/", async (req, res) => {
  try {
    // Get user ID from request if available (for personalized stats)
    const userId = req.query.userId;
    
    // Calculate real statistics from database
    // Active citizens: count of unique users who have logged in (loginCount > 0)
    const activeCitizens = await User.countDocuments({ loginCount: { $gt: 0 } });
    
    // Events completed: if user logged in, show their personal count, otherwise total
    let eventsCompleted = 0;
    if (userId) {
      // Try to find user by _id first, then by email if userId is not a MongoDB ObjectId
      let user = null;
      try {
        user = await User.findById(userId);
      } catch (err) {
        // If userId is not a valid ObjectId, try finding by email or other field
        user = await User.findOne({ email: userId }).catch(() => null);
      }
      eventsCompleted = user?.eventsCompleted || 0;
    } else {
      // For non-logged in users, show total events completed by all users
      const result = await User.aggregate([
        { $group: { _id: null, total: { $sum: "$eventsCompleted" } } }
      ]);
      eventsCompleted = result.length > 0 ? result[0].total : 0;
    }
    
    // Issues resolved: count from issues collection (from NGO portal)
    const issuesResolved = await Issue.countDocuments({ status: "resolved" });
    
    // NGOs partnered: count of users with role "solver" who have logged in
    const ngosPartnered = await User.countDocuments({ 
      role: "solver", 
      loginCount: { $gt: 0 } 
    });
    
    // Return real-time stats
    return res.json({
      activeCitizens: Math.max(0, activeCitizens),
      eventsCompleted: Math.max(0, eventsCompleted),
      issuesResolved: Math.max(0, issuesResolved),
      ngosPartnered: Math.max(0, ngosPartnered)
    });
  } catch (err) {
    console.error("Error fetching statistics:", err);
    // Fallback to default values if database query fails
    res.json({
      activeCitizens: 0,
      eventsCompleted: 0,
      issuesResolved: 0,
      ngosPartnered: 0
    });
  }
});

export default router;