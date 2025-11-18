import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';

dotenv.config();

const sampleEvents = [
  {
    title: "Community Cleanup Drive",
    description: "Join us for a neighborhood cleanup to make our streets cleaner and greener. Bring gloves and bags!",
    category: "cleanup",
    date: "June 15, 2024",
    time: "9:00 AM - 12:00 PM",
    location: "Central Park",
    maxParticipants: 50,
    organizer: "Green Earth NGO",
    organizerId: "sample-organizer-1",
    points: 50,
    featured: true,
    priority: "high",
    status: "upcoming",
    participants: []
  },
  {
    title: "Tree Plantation Drive",
    description: "Help us plant 100 trees along the riverside. Contribute to a greener tomorrow!",
    category: "environment",
    date: "June 20, 2024",
    time: "7:00 AM - 11:00 AM",
    location: "Riverside Park",
    maxParticipants: 30,
    organizer: "Save Our Planet",
    organizerId: "sample-organizer-2",
    points: 75,
    featured: false,
    priority: "urgent",
    status: "upcoming",
    participants: []
  },
  {
    title: "Food Donation Drive",
    description: "Collect and distribute food to families in need. Every contribution counts!",
    category: "donation",
    date: "June 18, 2024",
    time: "2:00 PM - 6:00 PM",
    location: "Community Center",
    maxParticipants: 40,
    organizer: "Hope Foundation",
    organizerId: "sample-organizer-3",
    points: 60,
    featured: true,
    priority: "medium",
    status: "ongoing",
    participants: []
  },
  {
    title: "Street Art Workshop",
    description: "Beautify public spaces with community art. All skill levels welcome!",
    category: "community",
    date: "June 22, 2024",
    time: "3:00 PM - 7:00 PM",
    location: "Downtown Plaza",
    maxParticipants: 25,
    organizer: "Arts for All",
    organizerId: "sample-organizer-4",
    points: 40,
    featured: false,
    priority: "low",
    status: "upcoming",
    participants: []
  }
];

async function seedEvents() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/civic-hub";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Clear existing events
    await Event.deleteMany({});
    console.log("Cleared existing events");

    // Insert sample events
    await Event.insertMany(sampleEvents);
    console.log("Sample events inserted successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding events:", error);
    process.exit(1);
  }
}

seedEvents();