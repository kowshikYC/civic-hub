import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    maxParticipants: { type: Number, required: true },
    organizer: { type: String, required: true },
    organizerId: { type: String, required: true }, // Event handler's user ID
    points: { type: Number, default: 50 },
    featured: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
    participants: [{ 
      userId: { type: String },
      userName: { type: String },
      userEmail: { type: String },
      joinedAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
