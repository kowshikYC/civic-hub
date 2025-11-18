import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, MessageCircle, Lightbulb, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const AIAssistant = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    if (!query.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setLoading(true);
    
    // Simple responses for common queries
    const lowerQuery = query.toLowerCase().trim();
    
    if (lowerQuery === 'hi' || lowerQuery === 'hello' || lowerQuery === 'hey') {
      setResponse("Hello! I'm your AI community assistant. I can help you with reporting issues, organizing events, earning points, and making your community better. What would you like to know?");
      setLoading(false);
      return;
    }
    
    if (lowerQuery.includes('how are you')) {
      setResponse("I'm doing great! I'm here to help you make your community better. You can ask me about reporting issues, organizing events, earning points, or any civic engagement topics. How can I assist you today?");
      setLoading(false);
      return;
    }
    
    if (lowerQuery.includes('thank')) {
      setResponse("You're welcome! I'm always here to help with community engagement. Feel free to ask me anything about making your neighborhood better!");
      setLoading(false);
      return;
    }
    
    if (lowerQuery.includes('air pollution') || lowerQuery.includes('pollution')) {
      setResponse("To reduce air pollution in your community: 1) Organize car-free days and promote cycling/walking, 2) Plant trees and create green spaces, 3) Report industrial pollution through CitizenSpark, 4) Advocate for public transportation, 5) Start community gardens to improve air quality. Every small action helps!");
      setLoading(false);
      return;
    }
    
    if (lowerQuery.includes('environment') || lowerQuery.includes('green') || lowerQuery.includes('climate')) {
      setResponse("For environmental action: Start local cleanup drives, organize tree planting events, create recycling programs, report environmental issues through our platform, and connect with green NGOs. Community-level environmental action creates real impact!");
      setLoading(false);
      return;
    }

    try {
      console.log('Sending query to AI:', query);
      const response = await fetch('http://localhost:5000/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.response) {
        setResponse(data.response);
      } else {
        throw new Error(data.error || 'No response from AI');
      }
    } catch (error) {
      console.error('AI API Error:', error);
      // Use varied fallback responses
      setResponse(getVariedResponse(query));
    } finally {
      setLoading(false);
    }
  };
  
  const getVariedResponse = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    // Environmental topics
    if (lowerQuery.includes('pollution') || lowerQuery.includes('air quality')) {
      return "To tackle air pollution: promote cycling, plant trees, report industrial pollution, advocate for clean transport, and organize car-free community events. Small actions create big environmental impact!";
    }
    
    if (lowerQuery.includes('waste') || lowerQuery.includes('garbage') || lowerQuery.includes('trash')) {
      return "For waste reduction: organize cleanup drives, start recycling programs, report illegal dumping, promote composting, and educate neighbors about waste management. Clean communities start with us!";
    }
    
    // Safety and security
    if (lowerQuery.includes('safety') || lowerQuery.includes('crime') || lowerQuery.includes('security')) {
      return "Improve community safety by: organizing neighborhood watch groups, reporting safety issues, improving street lighting, creating safe walking routes, and building strong neighbor relationships. Safety is a community effort!";
    }
    
    // Events and activities
    if (lowerQuery.includes('event') || lowerQuery.includes('activity') || lowerQuery.includes('organize')) {
      return "To organize successful community events: identify local needs, set clear goals, recruit volunteers, promote through social media, partner with local businesses, and follow up with participants. Start small and build momentum!";
    }
    
    // Technology and apps
    if (lowerQuery.includes('app') || lowerQuery.includes('technology') || lowerQuery.includes('digital')) {
      return "CitizenSpark uses GPS for precise issue reporting, AI for smart classification, photo uploads for evidence, real-time maps for tracking, and gamification to encourage participation. Technology makes civic engagement easier and more effective!";
    }
    
    // Points and rewards
    if (lowerQuery.includes('point') || lowerQuery.includes('reward') || lowerQuery.includes('earn')) {
      return "Earn points by: reporting issues (25 pts), joining events (50+ pts), helping solve problems, and engaging with your community. Redeem points for vouchers at local businesses. Higher engagement = better rewards!";
    }
    
    // General questions (what, how, why, etc.)
    if (lowerQuery.includes('what') || lowerQuery.includes('how') || lowerQuery.includes('why')) {
      const whatResponses = [
        "That's a great question! For community engagement, I recommend starting with identifying local needs and connecting with neighbors who share your interests.",
        "Excellent question! The best approach is to start small, be consistent, and collaborate with local organizations and fellow residents.",
        "Good question! Focus on issues you're passionate about, use available tools like CitizenSpark, and don't be afraid to take the first step.",
        "Interesting question! Community change happens through persistent effort, clear communication, and building relationships with stakeholders."
      ];
      const index = query.length % whatResponses.length;
      return whatResponses[index];
    }
    
    // Default varied responses for other questions
    const responses = [
      "I'm here to help with community engagement! Whether it's reporting issues, organizing events, or earning points, I can guide you through making your neighborhood better.",
      "That's an interesting topic! Community building involves identifying needs, taking action, and collaborating with neighbors and local organizations.",
      "Great point! Effective civic engagement requires both individual initiative and collective effort from community members.",
      "I'd be happy to assist! The key to successful community work is consistent participation, clear goals, and celebrating progress together.",
      "Excellent topic! Building stronger communities starts with small actions that grow into meaningful change through collaboration."
    ];
    
    // Use a combination of query length and content for variety
    const index = (query.length + query.charCodeAt(0)) % responses.length;
    return responses[index];
  };

  const getFallbackResponse = (query: string) => {
    // Use varied response function for consistency
    return getVariedResponse(query);
  };
  
  const getOriginalFallbackResponse = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    // Civic engagement topics
    if (lowerQuery.includes('report') || lowerQuery.includes('issue') || lowerQuery.includes('problem')) {
      return "To report an issue effectively, include clear photos, exact location details, and a detailed description. This helps authorities prioritize and resolve problems faster. Consider following up with local representatives if the issue affects community safety.";
    }
    
    if (lowerQuery.includes('event') || lowerQuery.includes('organize') || lowerQuery.includes('volunteer')) {
      return "Start by identifying community needs and available resources. Create a simple plan with clear goals, timeline, and volunteer roles. Use social media and local networks to spread awareness and gather participants.";
    }
    
    if (lowerQuery.includes('community') || lowerQuery.includes('neighbor') || lowerQuery.includes('local')) {
      return "Building strong communities starts with small actions. Attend local meetings, volunteer for causes you care about, and connect with neighbors. Regular communication and collaboration create lasting positive change.";
    }
    
    if (lowerQuery.includes('points') || lowerQuery.includes('reward') || lowerQuery.includes('redeem')) {
      return "Earn points by reporting issues (25 pts), joining community events (50+ pts), and helping solve problems. Redeem points for vouchers at local businesses. Higher engagement leads to better community impact and personal rewards.";
    }
    
    // General questions
    if (lowerQuery.includes('how') || lowerQuery.includes('what') || lowerQuery.includes('why') || lowerQuery.includes('when') || lowerQuery.includes('where')) {
      return "I'm here to help with community engagement questions! Whether you want to report issues, organize events, connect with neighbors, or earn rewards through civic participation, I can provide guidance on making your community better.";
    }
    
    // Safety and emergency
    if (lowerQuery.includes('emergency') || lowerQuery.includes('danger') || lowerQuery.includes('urgent')) {
      return "For emergencies, always call 911 first. For non-emergency community issues, use CitizenSpark to report problems with photos and location details. This helps authorities respond appropriately and track resolution progress.";
    }
    
    // Government and authorities
    if (lowerQuery.includes('government') || lowerQuery.includes('authority') || lowerQuery.includes('official') || lowerQuery.includes('council')) {
      return "CitizenSpark connects you directly with local authorities and NGOs. Report issues through our platform to ensure proper routing to the right departments. Attend town halls, contact representatives, and stay informed about local policies.";
    }
    
    // Environment and sustainability
    if (lowerQuery.includes('environment') || lowerQuery.includes('green') || lowerQuery.includes('clean') || lowerQuery.includes('recycle')) {
      return "Environmental action starts locally! Organize cleanup drives, tree planting events, and recycling programs. Report environmental issues through CitizenSpark and connect with green NGOs in your area for larger impact.";
    }
    
    // Technology and platform
    if (lowerQuery.includes('app') || lowerQuery.includes('platform') || lowerQuery.includes('website') || lowerQuery.includes('technology')) {
      return "CitizenSpark uses AI to classify issues, GPS for precise reporting, and gamification to encourage participation. Upload photos, track your impact, earn points, and see real-time progress on community improvements.";
    }
    
    // Greetings
    if (lowerQuery.includes('hi') || lowerQuery.includes('hello') || lowerQuery.includes('hey')) {
      return "Hello! I'm your AI community assistant. I can help you with reporting issues, organizing events, earning points, and making your community better. What would you like to know?";
    }
    
    // Default comprehensive response
    return "I'm your AI community assistant! I can help with reporting issues, organizing events, connecting with neighbors, earning rewards, environmental action, and civic engagement. Ask me anything about making your community better - from practical tips to platform features!";
  };

  const quickQuestions = [
    "What are the most urgent issues in our community?",
    "Suggest events to improve neighborhood safety",
    "How can we reduce waste in our area?",
    "What's the best way to organize a cleanup drive?"
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold">AI Community Assistant</h3>
        <Badge variant="secondary" className="text-xs">Powered by Gemini</Badge>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Ask about community issues, events, or solutions:</label>
          <Textarea
            placeholder="e.g., What are the best practices for organizing community events?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleAskAI} disabled={loading} className="gap-2">
            <MessageCircle className="w-4 h-4" />
            {loading ? "Thinking..." : "Ask AI"}
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Quick Questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery(question);
                  // Auto-ask the AI after setting the question
                  setTimeout(async () => {
                    setLoading(true);
                    try {
                      const response = await fetch('http://localhost:5000/api/ai/assistant', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: question })
                      });

                      const data = await response.json();
                      if (response.ok) {
                        setResponse(data.response);
                      } else {
                        if (question.toLowerCase().includes('hi') || question.toLowerCase().includes('hello')) {
                          setResponse("Hello! I'm your AI community assistant. I can help you with reporting issues, organizing events, earning points, and making your community better. What would you like to know?");
                        } else {
                          setResponse(getFallbackResponse(question));
                        }
                      }
                    } catch (error) {
                      console.error('Error:', error);
                      setResponse(getFallbackResponse(question));
                    } finally {
                      setLoading(false);
                    }
                  }, 100);
                }}
                className="text-xs"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        {response && (
          <Card className="p-4 bg-muted/30">
            <div className="flex items-start gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-primary mt-1" />
              <p className="text-sm font-medium">AI Suggestion:</p>
            </div>
            <p className="text-sm leading-relaxed">{response}</p>
          </Card>
        )}
      </div>
    </Card>
  );
};

export default AIAssistant;