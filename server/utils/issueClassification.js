import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const API_KEY = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Classify an issue as large or small using Gemini API
 * @param {string} title - Issue title
 * @param {string} description - Issue description
 * @param {string} category - Issue category
 * @returns {Promise<{issueType: 'large'|'small', points: number, reasoning: string}>}
 */
export async function classifyIssue(title, description, category) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `You are an expert in civic issue classification. Analyze the following issue and determine if it should be classified as "large" or "small".

Issue Title: ${title}
Category: ${category}
Description: ${description}

Classification Guidelines:
- LARGE issues: Require professional expertise, significant resources, infrastructure changes, government intervention, or pose safety risks. Examples: major potholes requiring road repairs, broken sewage systems, collapsed structures, electrical hazards, major flooding, structural damage.

- SMALL issues: Can be resolved by community members with minimal resources, simple fixes, or local action. Examples: small garbage piles, minor graffiti, broken street lights (if simple bulb replacement), small potholes, minor drainage issues, litter cleanup.

For small issues, assign points based on difficulty:
- Very easy (5-15 points): Simple cleanup, minor fixes
- Easy (15-30 points): Requires basic tools, minor repairs
- Moderate (30-50 points): Requires some skill or effort

Respond in this EXACT JSON format (no markdown, no extra text):
{
  "issueType": "large" or "small",
  "points": number (0 for large, 5-50 for small based on difficulty),
  "reasoning": "brief explanation"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (handle markdown code blocks if present)
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }
    
    const classification = JSON.parse(jsonText);
    
    // Validate and ensure proper format
    const issueType = classification.issueType === "large" ? "large" : "small";
    
    // Ensure points are properly parsed and set
    let points = 0;
    if (issueType === "small") {
      const parsedPoints = parseInt(classification.points);
      // If points is NaN, undefined, null, or 0, set a default based on category
      if (isNaN(parsedPoints) || parsedPoints <= 0) {
        // Default points based on category difficulty
        const categoryLower = (category || "").toLowerCase();
        if (categoryLower.includes("garbage") || categoryLower.includes("waste")) {
          points = 10; // Easy cleanup
        } else if (categoryLower.includes("streetlight") || categoryLower.includes("light")) {
          points = 20; // Requires some effort
        } else if (categoryLower.includes("pothole")) {
          points = 35; // Moderate difficulty
        } else if (categoryLower.includes("drainage") || categoryLower.includes("sewage")) {
          points = 40; // More complex
        } else {
          points = 25; // Default moderate
        }
      } else {
        points = Math.max(5, Math.min(50, parsedPoints));
      }
    }
    
    return {
      issueType,
      points,
      reasoning: classification.reasoning || "Automated classification"
    };
  } catch (error) {
    console.error("Error classifying issue with Gemini:", error);
    // Default to small issue with moderate points on error
    return {
      issueType: "small",
      points: 25,
      reasoning: "Classification failed, defaulted to small issue"
    };
  }
}
