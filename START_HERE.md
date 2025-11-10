# Quick Start Guide

Welcome! This guide will get you up and running in 5 minutes.

## Step 1: Install Node.js

**Mac:** Download from [nodejs.org](https://nodejs.org/) or use Homebrew:
```bash
brew install node
```

**Windows:** Download installer from [nodejs.org](https://nodejs.org/)

## Step 2: Choose Your Database

**Easiest Option - MongoDB Atlas (Cloud):**
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Skip to Step 4

**Or install MongoDB locally:**

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Windows:** Download from [mongodb.com](https://www.mongodb.com/try/download/community)

## Step 3: Open Terminal

**Mac:** Press `Cmd + Space`, type "Terminal", press Enter

**Windows:** Press `Win + R`, type `cmd`, press Enter

Navigate to this folder:
```bash
cd /path/to/civic-hub-main/civic-hub-main
```

## Step 4: Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
cd ..
```

**Create uploads folder:**

**Mac/Linux:**
```bash
mkdir -p server/uploads
```

**Windows:**
```bash
mkdir server\uploads
```

**If using MongoDB Atlas:** Create `server/.env`:
```
MONGODB_URI=mongodb+srv://your-connection-string-here
```

## Step 5: Run the App

Open **TWO terminal windows**

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

## Step 6: Open Browser

Go to: **http://localhost:8080**

That's it! 🎉

---

## Common Issues

**"MongoDB connection error"**
- If using local MongoDB: Make sure it's running
- If using Atlas: Check your `.env` file has the correct connection string

**"Port already in use"**
- Mac: `lsof -i :5000` then `kill -9 <PID>`
- Windows: Close the program using that port

**Photos not uploading**
- Make sure `server/uploads` folder exists
- Check your terminal for error messages

---

**Need help?** Check the full [README.md](README.md) for detailed setup instructions.
