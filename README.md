# CitizenSpark - Community Engagement Platform

A comprehensive civic engagement platform where citizens can report local issues, organize community events, track impact on real-time maps, and collaborate with NGOs and authorities.

**Project**: CitizenSpark - Igniting Community Action

## Features

- 📍 **Interactive Map**: View all reported issues and events in real-time
- 📸 **Photo Upload**: Upload multiple photos to document issues
- 📱 **GPS Integration**: Use device location or search for an address
- 🔄 **Real-time Updates**: Map refreshes every 10 seconds with new reports
- 🏷️ **Issue Tracking**: Track issues from "open" to "in_progress" to "resolved"
- 👥 **Multi-user Support**: Separate portals for reporters, solvers, and NGOs

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm installed - [download here](https://nodejs.org/)
- MongoDB installed locally OR a MongoDB Atlas account

### Installation Steps

1. **Clone the repository**
   
   **Windows (PowerShell or CMD):**
   ```bash
   git clone <YOUR_GIT_URL>
   cd civic-hub-main\civic-hub-main
   ```
   
   **Mac/Linux (Terminal):**
   ```bash
   git clone <YOUR_GIT_URL>
   cd civic-hub-main/civic-hub-main
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```
   
   **Note for Mac users:** If you encounter permission errors, try:
   ```bash
   sudo npm install
   ```

4. **Set up MongoDB**
   
   **Option A: Local MongoDB**
   
   **On Mac (using Homebrew):**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb/brew/mongodb-community
   ```
   MongoDB will run on `mongodb://127.0.0.1:27017` by default
   
   **On Windows:**
   - Install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Follow the installation wizard
   
   **Option B: MongoDB Atlas (Cloud) - Recommended for Mac**
   - Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster and get your connection string
   - Create a `.env` file in the `server` folder:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civic-hub
     ```

5. **Create uploads directory**
   
   **Mac/Linux:**
   ```bash
   mkdir -p server/uploads
   ```
   
   **Windows (PowerShell):**
   ```bash
   mkdir server\uploads
   ```

6. **Run the application**

   **Two Terminal Windows Method (Recommended)**
   
   Open two terminal windows:
   
   **Terminal 1 - Backend Server:**
   ```bash
   cd server
   npm start
   ```
   Server will start on http://localhost:5000
   
   **Terminal 2 - Frontend Development Server:**
   ```bash
   npm run dev
   ```
   
   The application will be available at:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:5000

   **Option 2: One Terminal with Background Jobs (Mac/Linux)**
   ```bash
   cd server && npm run dev &
   cd .. && npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:8080](http://localhost:8080)

### Troubleshooting

**Mac-specific Issues:**

- **MongoDB connection error**: If using local MongoDB, ensure it's running:
  ```bash
  brew services list  # Check if MongoDB is running
  brew services start mongodb/brew/mongodb-community  # Start if needed
  ```

- **Port already in use**: 
  ```bash
  # Check what's using port 5000
  lsof -i :5000
  # Kill the process if needed
  kill -9 <PID>
  ```

- **Permission denied errors**: Prepend commands with `sudo` if needed

**General Issues:**

- **npm install fails**: Clear cache and reinstall:
  ```bash
  npm cache clean --force
  rm -rf node_modules package-lock.json
  npm install
  ```

- **Module not found**: Make sure you've installed dependencies in BOTH root AND server folder

- **Google Maps not loading**: Check that the API key is valid and has Places API enabled

### Project Structure

```
civic-hub-main/
├── src/                    # Frontend React code
│   ├── pages/              # Page components
│   │   ├── MapView.tsx     # Interactive map with real-time updates
│   │   ├── ReportIssue.tsx # Issue reporting form with GPS & photos
│   │   └── ...
│   ├── components/         # Reusable UI components
│   └── contexts/           # React contexts (Auth, etc.)
├── server/                 # Backend Express API
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── uploads/            # Uploaded photos directory
│   └── index.js            # Server entry point
└── public/                 # Static assets
```

### API Endpoints

- `GET /api/issues` - Get all issues
- `POST /api/issues` - Create new issue (with photos)
- `PATCH /api/issues/:id` - Update issue status
- `GET /api/health` - Health check
- `GET /api/db-status` - Database connection status

### Environment Variables

Create `server/.env` for custom configuration:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/civic-hub
PORT=5000
```

## How to Edit Code

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

**Frontend:**
- React + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn-ui
- Google Maps API (places and maps)
- React Router
- React Query

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Multer (file uploads)
- CORS enabled

## How can I deploy this project?

This project can be deployed to any hosting platform that supports Node.js applications:

- **Frontend**: Deploy to Vercel, Netlify, or any static hosting
- **Backend**: Deploy to Railway, Render, Heroku, or any Node.js hosting
- **Database**: Use MongoDB Atlas for cloud database

## Environment Setup

Make sure to set up your environment variables:
- `MONGODB_URI`: Your MongoDB connection string
- `GEMINI_API_KEY`: Google Gemini API key for AI features
- `PORT`: Server port (default: 5000)
