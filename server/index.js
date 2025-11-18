import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import issuesRouter from './routes/issues.js';
import statsRouter from './routes/stats.js';
import contributionsRouter from './routes/contributions.js';
import usersRouter from './routes/users.js';
import eventsRouter from './routes/events.js';
import aiRouter from './routes/ai.js';

dotenv.config();

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan("dev"));
app.use("/api/issues", issuesRouter);
app.use("/api/stats", statsRouter);
app.use("/api/users", usersRouter);
app.use("/api/events", eventsRouter);
app.use("/api/ai", aiRouter);
app.use("/api", contributionsRouter);
// serve uploaded files
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/test-upload", (_req, res) => {
  res.json({ 
    uploadsPath: path.resolve(process.cwd(), "uploads"),
    profilesPath: path.resolve(process.cwd(), "uploads/profiles"),
    message: "Upload paths configured"
  });
});
app.get("/api/db-status", (_req, res) => {
  const state = mongoose.connection.readyState; // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  res.json({ state });
});

async function start() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/civic-hub";
  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err?.message || err);
    process.exit(1);
  }
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`API listening on :${port}`));
}

start();
