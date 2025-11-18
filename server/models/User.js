import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["reporter", "solver"], required: true },
    organizationType: { type: String, enum: ["government", "municipality", "ngo", "volunteer", "other"] },
    organizationName: { type: String },
    loginCount: { type: Number, default: 0 },
    lastLogin: { type: Date },
    eventsCompleted: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    issuesReported: { type: Number, default: 0 },
    impactScore: { type: Number, default: 0 },
    profilePhoto: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
