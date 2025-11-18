import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/contributions");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  },
});

// Initialize Gemini API
// Note: In production, use environment variables for API keys
const API_KEY = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY"; 
const genAI = new GoogleGenerativeAI(API_KEY);

// Import the ML-based image recognition utility (optional)
let analyzeImage = null;
let imageRecognitionLoaded = false;

async function loadImageRecognition() {
  if (imageRecognitionLoaded) {
    return analyzeImage !== null;
  }
  
  imageRecognitionLoaded = true;
  try {
    const imageRecognitionModule = await import('../utils/imageRecognition.js');
    analyzeImage = imageRecognitionModule.analyzeImage;
    return true;
  } catch (error) {
    console.warn('Image recognition module not available:', error.message);
    analyzeImage = null;
    return false;
  }
}

// Try to load in background (non-blocking)
loadImageRecognition().catch(() => {});

// Helper function to analyze image with ML model
const analyzeImageWithML = async (imagePath, description) => {
  try {
    // Try to load image recognition if not already loaded
    await loadImageRecognition();
    
    // Check if image analysis is available
    if (!analyzeImage) {
      console.warn("ML features disabled - accepting contribution without ML validation");
      return {
        valid: true,
        category: determineCategory(description, []),
        points: determinePoints(description, []),
        message: determineMessage(description, []),
        detections: [],
        mlDisabled: true
      };
    }
    
    // Use ML model to detect plants and people in the image
    const { hasPerson, hasPlant, detections, error, mlDisabled } = await analyzeImage(imagePath);
    
    // If ML is disabled, skip ML validation but still allow contribution
    if (mlDisabled) {
      console.warn("ML features disabled - accepting contribution without ML validation");
      // Fall back to description-based validation
      return {
        valid: true,
        category: determineCategory(description, []),
        points: determinePoints(description, []),
        message: determineMessage(description, []),
        detections: [],
        mlDisabled: true
      };
    }
    
    if (error && !mlDisabled) {
      console.error("ML analysis error:", error);
      return {
        valid: false,
        reason: "Failed to analyze image with ML model"
      };
    }
    
    console.log("ML Detection results:", { hasPerson, hasPlant, detections });
    
    // Validate based on ML detection results
    // For a valid civic contribution, we need both a person and a plant in the image
    const isValid = hasPerson && hasPlant;
    
    if (!isValid) {
      return {
        valid: false,
        reason: !hasPerson && !hasPlant ? "No person or plant detected in the image" :
                !hasPerson ? "No person detected in the image" : 
                !hasPlant ? "No plant detected in the image" : "Image does not show a valid civic contribution"
      };
    }
    
    // If valid, determine category, points, and message
    return {
      valid: true,
      category: determineCategory(description, detections),
      points: determinePoints(description, detections),
      message: determineMessage(description, detections),
      detections: detections
    };
  } catch (error) {
    console.error("Error in ML image analysis:", error);
    return {
      valid: false,
      reason: "Failed to process image: " + error.message
    };
  }
};

// Helper functions for category, points, and message determination
const determineCategory = (description, detections = []) => {
  // First check if we can determine category from ML detections
  const hasTree = detections.some(d => ['potted plant', 'tree'].includes(d.class));
  const hasTrash = detections.some(d => ['bottle', 'cup', 'bowl', 'fork', 'knife', 'spoon'].includes(d.class));
  
  if (hasTree) return "tree-planting";
  if (hasTrash) return "cleanup";
  
  // Fall back to text-based category detection
  const desc = description.toLowerCase();
  if (desc.includes("cleanup") || desc.includes("clean up") || desc.includes("litter")) return "cleanup";
  if (desc.includes("plant") || desc.includes("tree") || desc.includes("garden")) return "tree-planting";
  if (desc.includes("recycl") || desc.includes("waste") || desc.includes("plastic")) return "recycling";
  if (desc.includes("community") || desc.includes("volunteer") || desc.includes("event")) return "community-event";
  if (desc.includes("repair") || desc.includes("build") || desc.includes("infrastructure")) return "infrastructure";
  
  // Default to tree-planting if we detected plants but no specific category
  return "tree-planting";
};

const determinePoints = (description, detections = []) => {
  // Calculate points based on ML detection confidence and number of relevant objects
  let basePoints = 50; // Base points for a valid contribution
  
  // Add points for plant detection quality
  const plantDetections = detections.filter(d => 
    ['potted plant', 'tree', 'flower', 'plant'].includes(d.class)
  );
  
  if (plantDetections.length > 0) {
    // Add points based on confidence and number of plants
    const avgConfidence = plantDetections.reduce((sum, d) => sum + d.score, 0) / plantDetections.length;
    const plantBonus = Math.round(avgConfidence * 30) + (plantDetections.length > 1 ? 10 : 0);
    basePoints += plantBonus;
  }
  
  // Cap points at 100
  return Math.min(100, basePoints);
};

const determineMessage = (description, detections = []) => {
  // Generate a more personalized message based on ML detections
  const plantTypes = detections
    .filter(d => ['potted plant', 'tree', 'flower'].includes(d.class))
    .map(d => d.class);
  
  if (plantTypes.includes('tree')) {
    return "Thank you for planting trees! Your contribution to urban forestry is making a real difference.";
  } else if (plantTypes.includes('potted plant')) {
    return "Great job with your plant contribution! Every plant helps improve our environment.";
  }
  
  // Fall back to category-based messages
  const category = determineCategory(description, detections);
  const messages = {
    "cleanup": "Thank you for helping clean up your community!",
    "tree-planting": "Your contribution to urban forestry is appreciated!",
    "recycling": "Great job promoting sustainable waste management!",
    "community-event": "Your participation in community events makes a difference!",
    "infrastructure": "Thanks for helping improve local infrastructure!"
  };
  
  return messages[category] || "Thank you for your civic contribution!";
};

// Analyze contribution image and award points
router.post("/analyze-contribution", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // Get image description from request body
    const description = req.body.description || "";
    
    // Analyze the image using our ML-based function
    const analysisResult = await analyzeImageWithML(req.file.path, description);
    
    // If the image is not valid, delete it and return error
    if (!analysisResult.valid) {
      // Delete the invalid image
      fs.unlinkSync(req.file.path);
      
      return res.status(400).json({
        error: analysisResult.reason || "Invalid contribution image. Please upload a photo showing both a person and plants for a valid civic contribution.",
        valid: false
      });
    }
    
    // Return the analysis result for valid images
    return res.status(200).json({
      points: analysisResult.points,
      category: analysisResult.category,
      message: analysisResult.message,
      valid: true,
      imagePath: req.file.path,
      detections: analysisResult.detections.map(d => ({
        class: d.class,
        confidence: Math.round(d.score * 100) / 100
      }))
    });
    
  } catch (error) {
    console.error("Error analyzing contribution:", error);
    return res.status(500).json({ error: "Failed to analyze contribution" });
  }
});

export default router;