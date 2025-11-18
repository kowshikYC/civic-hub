import { Router } from "express";
import Event from "../models/Event.js";

const router = Router();

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Get events by organizer
router.get("/organizer/:organizerId", async (req, res) => {
  try {
    const { organizerId } = req.params;
    console.log("Fetching events for organizerId:", organizerId);
    
    // Find events by organizerId (string match, not ObjectId)
    const events = await Event.find({ organizerId: String(organizerId) }).sort({ createdAt: -1 });
    console.log("Found events:", events.length);
    res.json(events);
  } catch (err) {
    console.error("Error fetching organizer events:", err);
    res.status(500).json({ error: "Failed to fetch events", details: err.message });
  }
});

// Get event participants
router.get("/:id/participants", async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json({ participants: event.participants || [] });
  } catch (err) {
    console.error("Error fetching participants:", err);
    res.status(500).json({ error: "Failed to fetch participants" });
  }
});

// Join event
router.post("/:id/join", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName, userEmail } = req.body;
    
    if (!userId || !userName || !userEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    // Check if user already joined
    const alreadyJoined = event.participants.some(p => p.userId === userId);
    if (alreadyJoined) {
      return res.status(400).json({ error: "Already joined this event" });
    }
    
    // Check if event is full
    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ error: "Event is full" });
    }
    
    // Add participant
    event.participants.push({
      userId,
      userName,
      userEmail,
      joinedAt: new Date()
    });
    
    await event.save();
    
    res.json({ 
      success: true, 
      message: "Successfully joined event",
      participantsCount: event.participants.length
    });
  } catch (err) {
    console.error("Error joining event:", err);
    res.status(500).json({ error: "Failed to join event" });
  }
});

// Create event
router.post("/", async (req, res) => {
  try {
    const { title, description, category, date, time, location, maxParticipants, organizer, organizerId, points, featured } = req.body;
    
    if (!title || !description || !category || !date || !time || !location || !maxParticipants || !organizer || !organizerId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const event = await Event.create({
      title,
      description,
      category,
      date,
      time,
      location,
      maxParticipants,
      organizer,
      organizerId,
      points: points || 50,
      featured: featured || false,
      participants: []
    });
    
    res.status(201).json(event);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(400).json({ error: "Failed to create event" });
  }
});

// Get all participants for an organizer (across all their events)
router.get("/organizer/:organizerId/participants", async (req, res) => {
  try {
    const { organizerId } = req.params;
    const events = await Event.find({ organizerId: String(organizerId) });
    
    // Aggregate all participants from all events
    const allParticipants = [];
    events.forEach(event => {
      if (event.participants && event.participants.length > 0) {
        event.participants.forEach(participant => {
          allParticipants.push({
            ...participant.toObject(),
            eventId: event._id,
            eventTitle: event.title,
            eventDate: event.date,
          });
        });
      }
    });
    
    res.json({ participants: allParticipants, totalEvents: events.length });
  } catch (err) {
    console.error("Error fetching organizer participants:", err);
    res.status(500).json({ error: "Failed to fetch participants" });
  }
});

// Get event statistics for an organizer
router.get("/organizer/:organizerId/stats", async (req, res) => {
  try {
    const { organizerId } = req.params;
    const events = await Event.find({ organizerId: String(organizerId) });
    
    const stats = {
      totalEvents: events.length,
      totalParticipants: events.reduce((sum, event) => sum + (event.participants?.length || 0), 0),
      upcomingEvents: events.filter(e => new Date(e.date) >= new Date()).length,
      pastEvents: events.filter(e => new Date(e.date) < new Date()).length,
    };
    
    res.json(stats);
  } catch (err) {
    console.error("Error fetching organizer stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
