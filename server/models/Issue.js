import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    photos: [{ type: String }],
    userId: { type: String },
    reporterName: { type: String },
    reporterEmail: { type: String },
    reporterId: { type: String },
    status: { type: String, enum: ["open", "in_progress", "resolved"], default: "open" },
    issueType: { type: String, enum: ["large", "small"], default: "small" },
    points: { type: Number, default: 0 },
    solverId: { type: String },
    solverRewarded: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.Issue || mongoose.model("Issue", IssueSchema);
