# Backend Setup and Initialization Guide

## Overview
This guide explains how to set up and initialize the CivicHub backend server with MongoDB.

## Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## Step 1: Install Dependencies

Navigate to the `server` directory and install all dependencies:

```bash
cd server
npm install
```

This will install:
- Express.js (web framework)
- Mongoose (MongoDB ODM)
- Multer (file upload handling)
- CORS (cross-origin resource sharing)
- Morgan (HTTP request logger)
- Google Generative AI (for issue classification)
- Other required dependencies

## Step 2: Set Up Environment Variables

Create a `.env` file in the `server` directory:

```bash
# In server directory
touch .env
```

Add the following environment variables to `.env`:

```env
# MongoDB Connection
MONGODB_URI=mongodb://127.0.0.1:27017/civic-hub
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civic-hub

# Server Port (default: 5000)
PORT=5000

# Google Gemini API Key (for issue classification)
GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting a Gemini API Key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and add it to your `.env` file

## Step 3: Start MongoDB

### Option A: Local MongoDB
If you have MongoDB installed locally:

```bash
# On Windows
mongod

# On macOS/Linux
sudo systemctl start mongod
# or
mongod --dbpath /path/to/your/db
```

### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

## Step 4: Initialize the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will:
- Connect to MongoDB
- Start listening on port 5000 (or your specified PORT)
- Log: `MongoDB connected` and `API listening on :5000`

## Step 5: Verify Server is Running

Test the server health endpoint:

```bash
# Using curl
curl http://localhost:5000/api/health

# Or visit in browser
http://localhost:5000/api/health
```

Expected response:
```json
{
  "ok": true,
  "time": "2024-01-01T12:00:00.000Z"
}
```

Check database connection:
```bash
curl http://localhost:5000/api/db-status
```

Expected response:
```json
{
  "state": 1
}
```
(State 1 = connected, 0 = disconnected)

## Backend API Endpoints

### Event Handler Endpoints

#### Get Events by Organizer
```
GET /api/events/organizer/:organizerId
```
Returns all events created by a specific event handler.

#### Get Event Participants
```
GET /api/events/:id/participants
```
Returns all participants enrolled in a specific event.

#### Get All Participants for Organizer
```
GET /api/events/organizer/:organizerId/participants
```
Returns all participants across all events for an organizer.

#### Get Organizer Statistics
```
GET /api/events/organizer/:organizerId/stats
```
Returns statistics:
- totalEvents
- totalParticipants
- upcomingEvents
- pastEvents

#### Create Event
```
POST /api/events
Content-Type: application/json

{
  "title": "Event Title",
  "description": "Event Description",
  "category": "cleanup",
  "date": "2024-06-15",
  "time": "9:00 AM - 12:00 PM",
  "location": "Central Park",
  "maxParticipants": 50,
  "organizer": "Event Handler Name",
  "organizerId": "user_id_string",
  "points": 50,
  "featured": false
}
```

### Issue Resolution Endpoints

#### Get Issues
```
GET /api/issues?issueType=small&status=open
```
Query parameters:
- `issueType`: "large" or "small"
- `status`: "open", "in_progress", or "resolved"

#### Report Issue
```
POST /api/issues
Content-Type: application/json

{
  "title": "Issue Title",
  "category": "pothole",
  "description": "Issue description",
  "location": "Location address",
  "coordinates": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "userId": "user_id"
}
```

Or with file upload:
```
POST /api/issues
Content-Type: multipart/form-data

Form data:
- title
- category
- description
- location
- lat (optional)
- lng (optional)
- photos (files)
```

#### Resolve Issue (for Citizens)
```
POST /api/issues/:id/resolve
Content-Type: application/json

{
  "solverId": "user_id"
}
```

**What happens:**
1. Issue status changes to "resolved"
2. If issue is "small" and not already rewarded:
   - Points are awarded to the solver
   - User points are updated in database
   - User level is recalculated
   - Impact score is recalculated
3. Returns issue with `pointsAwarded` field

#### Update Issue Status (for NGOs)
```
PATCH /api/issues/:id
Content-Type: application/json

{
  "status": "in_progress"
}
```

### User Endpoints

#### Track User Login
```
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "User Name",
  "role": "reporter",
  "organizationType": "ngo"
}
```

#### Update Events Completed
```
POST /api/users/:id/event-completed
```

## Database Models

### Event Model
- `title`: String (required)
- `description`: String (required)
- `category`: String (required)
- `date`: String (required)
- `time`: String (required)
- `location`: String (required)
- `maxParticipants`: Number (required)
- `organizer`: String (required)
- `organizerId`: String (required) - Event handler's user ID
- `points`: Number (default: 50)
- `featured`: Boolean (default: false)
- `participants`: Array of objects with:
  - `userId`: String
  - `userName`: String
  - `userEmail`: String
  - `joinedAt`: Date

### Issue Model
- `title`: String (required)
- `category`: String (required)
- `description`: String (required)
- `location`: String (required)
- `coordinates`: Object with `lat` and `lng`
- `photos`: Array of file paths
- `userId`: String
- `status`: String (enum: "open", "in_progress", "resolved", default: "open")
- `issueType`: String (enum: "large", "small")
- `points`: Number (default: 0)
- `solverId`: String (ID of user who resolved it)
- `solverRewarded`: Boolean (default: false)

### User Model
- `email`: String (required, unique)
- `name`: String (required)
- `role`: String (enum: "reporter", "solver")
- `organizationType`: String (optional)
- `organizationName`: String (optional)
- `loginCount`: Number (default: 0)
- `lastLogin`: Date
- `eventsCompleted`: Number (default: 0)
- `points`: Number (default: 0)
- `level`: Number (default: 1)
- `issuesReported`: Number (default: 0)
- `impactScore`: Number (default: 0)

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network/firewall settings for MongoDB Atlas

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process using port 5000:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # macOS/Linux
  lsof -ti:5000 | xargs kill
  ```

### File Upload Issues
- Ensure `uploads` directory exists (created automatically)
- Check file size limits in multer configuration
- Verify CORS settings

### Gemini API Issues
- Verify API key is correct in `.env`
- Check API quota/limits
- Ensure internet connection for API calls

## File Structure

```
server/
├── index.js              # Main server file
├── package.json          # Dependencies
├── .env                  # Environment variables (create this)
├── models/
│   ├── Event.js         # Event model
│   ├── Issue.js         # Issue model
│   └── User.js          # User model
├── routes/
│   ├── events.js        # Event endpoints
│   ├── issues.js        # Issue endpoints
│   ├── users.js         # User endpoints
│   └── stats.js         # Statistics endpoints
├── utils/
│   ├── issueClassification.js  # Gemini API integration
│   └── imageRecognition.js     # Image processing
└── uploads/              # Uploaded files directory (auto-created)
```

## Next Steps

1. Start the backend server
2. Start the frontend development server
3. Test the API endpoints using:
   - Browser (for GET requests)
   - Postman
   - curl commands
   - Frontend application

## Support

If you encounter issues:
1. Check server console logs
2. Verify MongoDB connection
3. Check environment variables
4. Review API endpoint documentation above

