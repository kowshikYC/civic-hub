import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// AI Assistant endpoint
router.post("/assistant", async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    console.log('AI Assistant query:', query);
    console.log('API Key available:', !!process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `You are a helpful AI assistant for CitizenSpark, a community engagement platform where citizens report issues, organize events, and collaborate to improve their neighborhoods.
    
    User question: "${query}"
    
    Provide a helpful, conversational response that:
    - Directly answers their question
    - Gives practical, actionable advice
    - Is encouraging and supportive
    - Relates to community engagement when relevant
    - Keeps responses natural and varied (avoid repetitive answers)
    
    Be conversational and helpful, not robotic. Answer any question they ask, not just civic engagement topics.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('AI Response:', text);
    res.json({ response: text });
  } catch (error) {
    console.error("AI Assistant error:", error);
    // Return fallback response instead of error
    res.json({ response: getFallbackResponse(req.body.query) });
  }
});

// Fallback responses for when AI is unavailable
function getFallbackResponse(query) {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('report') || lowerQuery.includes('issue')) {
    return "To report an issue effectively, include clear photos, exact location details, and a detailed description. This helps authorities prioritize and resolve problems faster. Consider following up with local representatives if the issue affects community safety.";
  }
  
  if (lowerQuery.includes('event') || lowerQuery.includes('organize')) {
    return "Start by identifying community needs and available resources. Create a simple plan with clear goals, timeline, and volunteer roles. Use social media and local networks to spread awareness and gather participants.";
  }
  
  if (lowerQuery.includes('community') || lowerQuery.includes('neighbor')) {
    return "Building strong communities starts with small actions. Attend local meetings, volunteer for causes you care about, and connect with neighbors. Regular communication and collaboration create lasting positive change.";
  }
  
  return "Great question! For community engagement, focus on identifying local needs, connecting with like-minded neighbors, and taking small but consistent actions. Every contribution, no matter how small, makes a difference in building stronger communities.";
}

// Smart issue analysis
router.post("/analyze-issue", async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Analyze this community issue and provide insights:
    
    Title: ${title}
    Category: ${category}
    Description: ${description}
    
    Provide a JSON response with:
    {
      "urgency": "low|medium|high|critical",
      "estimatedCost": "estimated cost range",
      "timeToResolve": "estimated time",
      "suggestedActions": ["action1", "action2"],
      "requiredResources": ["resource1", "resource2"],
      "preventionTips": "how to prevent similar issues"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up response to extract JSON
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    
    try {
      const analysis = JSON.parse(text);
      res.json(analysis);
    } catch (parseError) {
      // Fallback response if JSON parsing fails
      res.json({
        urgency: "medium",
        estimatedCost: "To be determined",
        timeToResolve: "1-2 weeks",
        suggestedActions: ["Contact local authorities", "Gather community support"],
        requiredResources: ["Community volunteers", "Basic tools"],
        preventionTips: "Regular maintenance and community awareness can help prevent similar issues."
      });
    }
  } catch (error) {
    console.error("Issue analysis error:", error);
    res.status(500).json({ error: "Failed to analyze issue" });
  }
});

// Event planning suggestions
router.post("/suggest-event", async (req, res) => {
  // Always provide fallback suggestions
  const fallbackEvents = [
    {
      title: "Community Cleanup Drive",
      description: "Organize neighbors to clean and beautify local streets and parks.",
      duration: "3 hours",
      participants: "20-50 people",
      materials: ["Trash bags", "Gloves", "Cleaning supplies"],
      impact: "Cleaner, more attractive neighborhood"
    },
    {
      title: "Neighborhood Safety Walk",
      description: "Community members walk together to identify safety concerns and build connections.",
      duration: "2 hours",
      participants: "15-30 people",
      materials: ["Clipboards", "Pens", "Safety vests"],
      impact: "Improved neighborhood safety awareness"
    },
    {
      title: "Community Garden Project",
      description: "Start a shared garden space where neighbors can grow food and flowers together.",
      duration: "4 hours",
      participants: "20-40 people",
      materials: ["Seeds", "Tools", "Soil", "Planters"],
      impact: "Sustainable food source and green space"
    }
  ];

  try {
    const { communityNeeds, season, availableResources, userContext } = req.body;
    
    // Try AI generation if API key is available
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY") {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `Suggest 3 community events for ${season || 'current season'}. Focus on ${communityNeeds || 'community improvement'}. 
      
      Respond with JSON only:
      {
        "events": [
          {
            "title": "Event Name",
            "description": "Brief description",
            "duration": "X hours",
            "participants": "X-Y people",
            "materials": ["item1", "item2"],
            "impact": "Community benefit"
          }
        ]
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      try {
        const suggestions = JSON.parse(text);
        if (suggestions.events && suggestions.events.length > 0) {
          return res.json(suggestions);
        }
      } catch (parseError) {
        console.log("AI response parsing failed, using fallback");
      }
    }
    
    // Return fallback suggestions
    res.json({ events: fallbackEvents });
    
  } catch (error) {
    console.error("Event suggestion error:", error);
    // Always return fallback on error
    res.json({ events: fallbackEvents });
  }
});

export default router;