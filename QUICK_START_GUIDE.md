# Quick Start Guide - Exact Paths and Commands

## Project Structure

```
C:\Users\veryh\OneDrive\Documents\civichub2\     ← ROOT DIRECTORY (Frontend)
│
├── server\                                        ← BACKEND DIRECTORY
│   ├── index.js
│   ├── package.json
│   ├── .env (you need to create this)
│   └── ...
│
└── src\                                           ← Frontend source files
    └── ...
```

---

## PART 1: Backend Setup (Run from SERVER directory)

### Step 1: Navigate to Server Directory

**Open Terminal/PowerShell/Command Prompt and run:**

```bash
cd "C:\Users\veryh\OneDrive\Documents\civichub2\server"
```

**Or if you're already in the root directory:**
```bash
cd server
```

**Verify you're in the right place:**
- You should see files like: `index.js`, `package.json`, `models/`, `routes/`
- Run: `dir` (Windows) or `ls` (if using Git Bash)

---

### Step 2: Install Backend Dependencies

**While in the `server` directory, run:**

```bash
npm install
```

**This installs:**
- Express.js, Mongoose, Multer, CORS, Morgan, etc.
- Creates `node_modules` folder in `server` directory

**Expected output:** Shows list of installed packages, takes 1-2 minutes

---

### Step 3: Create Environment File

**While still in the `server` directory, create `.env` file:**

**Windows PowerShell:**
```powershell
New-Item -Path .env -ItemType File
```

**Windows Command Prompt:**
```cmd
type nul > .env
```

**Or manually create:** Create a new file named `.env` in the `server` folder

**Then open `.env` file and add:**

```env
MONGODB_URI=mongodb://127.0.0.1:27017/civic-hub
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

**Replace `your_gemini_api_key_here` with your actual Gemini API key**
- Get it from: https://makersuite.google.com/app/apikey

---

### Step 4: Start MongoDB (if using local MongoDB)

**Option A: If MongoDB is installed locally**

**Open a NEW Terminal/PowerShell window and run:**

```bash
mongod
```

Keep this window open - MongoDB must be running!

**Option B: If using MongoDB Atlas (Cloud)**
- Skip this step - just use the connection string from Atlas in your `.env` file

---

### Step 5: Start Backend Server

**Go back to your terminal in the `server` directory and run:**

**Development mode (auto-reload on changes):**
```bash
npm run dev
```

**OR Production mode:**
```bash
npm start
```

**Expected output:**
```
MongoDB connected
API listening on :5000
```

**Keep this terminal window open!** The server must keep running.

---

## PART 2: Frontend Setup (Run from ROOT directory)

### Step 1: Navigate to Root Directory

**Open a NEW Terminal/PowerShell/Command Prompt window and run:**

```bash
cd "C:\Users\veryh\OneDrive\Documents\civichub2"
```

**Verify you're in the right place:**
- You should see: `src/`, `package.json`, `vite.config.ts`, `server/`
- Run: `dir` (Windows) or `ls` (if using Git Bash)

---

### Step 2: Install Frontend Dependencies (if not already done)

**While in the root directory, run:**

```bash
npm install
```

**Note:** If you already ran this before, you can skip this step.

---

### Step 3: Start Frontend Development Server

**While in the root directory, run:**

```bash
npm run dev
```

**Expected output:**
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Keep this terminal window open too!**

---

## Summary: What Should Be Running

You should have **3 terminal windows** open:

1. **Terminal 1** (MongoDB):
   ```bash
   cd "C:\Users\veryh\OneDrive\Documents\civichub2"
   mongod
   ```
   - Shows MongoDB connection logs

2. **Terminal 2** (Backend Server):
   ```bash
   cd "C:\Users\veryh\OneDrive\Documents\civichub2\server"
   npm run dev
   ```
   - Shows: `API listening on :5000`

3. **Terminal 3** (Frontend Server):
   ```bash
   cd "C:\Users\veryh\OneDrive\Documents\civichub2"
   npm run dev
   ```
   - Shows: `Local: http://localhost:5173/`

---

## Verification Steps

### 1. Check Backend is Running
Open browser and visit:
```
http://localhost:5000/api/health
```

Should return:
```json
{"ok":true,"time":"2024-..."}
```

### 2. Check Frontend is Running
Open browser and visit:
```
http://localhost:5173
```

Should show the CivicHub homepage.

---

## Common Issues & Solutions

### Issue: "Cannot find module"
**Solution:** Make sure you're in the correct directory and ran `npm install`

### Issue: "Port 5000 already in use"
**Solution:** 
- Change `PORT=5001` in `server/.env` file
- Or kill the process:
  ```bash
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

### Issue: "MongoDB connection error"
**Solution:**
- Make sure MongoDB is running (Terminal 1)
- Check MongoDB connection string in `server/.env`
- Verify MongoDB is installed: `mongod --version`

### Issue: "npm command not found"
**Solution:** 
- Install Node.js from https://nodejs.org/
- Restart terminal after installation

---

## Quick Command Reference

### Backend Commands (run from `server` directory):
```bash
cd "C:\Users\veryh\OneDrive\Documents\civichub2\server"
npm install              # Install dependencies (first time only)
npm run dev             # Start development server
npm start               # Start production server
```

### Frontend Commands (run from root directory):
```bash
cd "C:\Users\veryh\OneDrive\Documents\civichub2"
npm install              # Install dependencies (first time only)
npm run dev             # Start development server
npm run build           # Build for production
```

---

## File Locations Summary

| File/Directory | Full Path |
|---------------|-----------|
| Backend `.env` | `C:\Users\veryh\OneDrive\Documents\civic-hub2\server\.env` |
| Backend `package.json` | `C:\Users\veryh\OneDrive\Documents\civic-hub2\server\package.json` |
| Frontend `package.json` | `C:\Users\veryh\OneDrive\Documents\civic-hub2\package.json` |
| Server entry point | `C:\Users\veryh\OneDrive\Documents\civic-hub2\server\index.js` |

---

## Next Steps After Setup

1. ✅ Backend server running on `http://localhost:5000`
2. ✅ Frontend server running on `http://localhost:5173`
3. ✅ MongoDB running (Terminal 1)
4. ✅ Test the application in browser
5. ✅ Check API health endpoint
6. ✅ Test user registration/login
7. ✅ Test issue reporting
8. ✅ Test event creation (as event handler)

---

## Stopping the Servers

**To stop any server:**
- Press `Ctrl + C` in the terminal window
- Close the terminal window

**To stop MongoDB:**
- Press `Ctrl + C` in the MongoDB terminal window

---

## Need Help?

- Check `BACKEND_SETUP.md` for detailed backend documentation
- Check server terminal for error messages
- Verify all environment variables are set correctly
- Ensure MongoDB is running before starting backend

