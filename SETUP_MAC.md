# Mac Setup Guide - Civic Hub

This is a step-by-step guide for setting up Civic Hub on macOS.

## Prerequisites Check

First, let's see what you already have installed:

```bash
# Check Node.js
node --version

# Check npm
npm --version

# Check Homebrew (package manager for Mac)
brew --version
```

If any of these fail, install them below.

## Step 1: Install Required Software

### Install Node.js (if needed)

**Option A: Using Homebrew (Recommended)**
```bash
brew install node
```

**Option B: Using Official Installer**
1. Download from [nodejs.org](https://nodejs.org/)
2. Double-click the `.pkg` file to install
3. Restart your terminal

### Install Homebrew (if needed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the on-screen instructions.

## Step 2: Choose Your Database

**Option A: MongoDB Atlas (Cloud) - EASIEST** ✅

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Sign Up" (free account)
3. Create a free cluster (choose AWS, closest region to you)
4. Create a database user:
   - Username: `civichub`
   - Password: (use a strong password, save it!)
5. Add your IP address (or 0.0.0.0/0 for testing)
6. Click "Connect" → "Connect your application"
7. Copy the connection string (looks like `mongodb+srv://...`)

Create `server/.env` file:
```bash
cd server
nano .env
```

Paste this (replace with YOUR connection string):
```
MONGODB_URI=mongodb+srv://civichub:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/civic-hub?retryWrites=true&w=majority
```

Press `Ctrl + X`, then `Y`, then `Enter` to save.

**Option B: Local MongoDB**

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
brew services list | grep mongodb
```

You should see it listed as "started". No `.env` file needed.

## Step 3: Navigate to Project

Open Terminal (Press `Cmd + Space`, type "Terminal")

```bash
cd ~/Downloads/civic-hub-main/civic-hub-main
```

(Adjust the path based on where you extracted the project)

## Step 4: Install Project Dependencies

**Install frontend dependencies:**
```bash
npm install
```

This will take 1-2 minutes. You'll see lots of output.

**Install backend dependencies:**
```bash
cd server
npm install
cd ..
```

## Step 5: Create Uploads Folder

```bash
mkdir -p server/uploads
```

This folder will store uploaded photos.

## Step 6: Run the Application

You need TWO terminal windows running.

### Terminal 1: Backend Server

```bash
cd server
npm run dev
```

You should see:
```
MongoDB connected
API listening on :5000
```

### Terminal 2: Frontend (NEW WINDOW!)

Open a new Terminal window (Press `Cmd + T` in existing Terminal)

```bash
cd ~/Downloads/civic-hub-main/civic-hub-main
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:8080/
```

## Step 7: Open in Browser

Click on `http://localhost:8080/` or type it in Safari/Chrome.

🎉 You're done! The app should be running.

## Troubleshooting

### "MongoDB connection error"

**If using Atlas:**
- Check your `.env` file has the correct connection string
- Make sure you added your IP address in Atlas settings
- Verify your password is correct

**If using local MongoDB:**
```bash
brew services list
brew services restart mongodb-community
```

### "Port 5000 already in use"

Kill whatever is using that port:
```bash
lsof -i :5000
kill -9 <PID>
```

### "Permission denied"

```bash
sudo npm install
```
(You may be asked for your Mac password)

### "Cannot find module 'multer'"

You probably only installed frontend dependencies. Make sure you ran:
```bash
cd server
npm install
```

### Photos not uploading

Check that `server/uploads` exists:
```bash
ls -la server/uploads
```

If it doesn't exist:
```bash
mkdir -p server/uploads
```

### App won't load / blank page

1. Check both terminals are running
2. Check for error messages in the terminals
3. Hard refresh browser: `Cmd + Shift + R`

## Next Steps

- Read [README.md](README.md) for full documentation
- Read [START_HERE.md](START_HERE.md) for quick reference
- Check the live demo: https://citizen-spark-engine.lovable.app/

## Stopping the App

Press `Ctrl + C` in both terminal windows.

## Need Help?

Common issues are documented in the main README.md file.
