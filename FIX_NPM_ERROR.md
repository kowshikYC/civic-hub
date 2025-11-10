# Fix: npm ENOENT Error - Solution

## Problem
You're getting this error because npm is trying to run from the wrong directory (`C:\Users\veryh\` instead of your project directory).

## Solution: Navigate to Correct Directory First

### For Frontend (Root Directory)

**Open PowerShell/Command Prompt and run these commands ONE BY ONE:**

```powershell
# Step 1: Navigate to your project
cd "C:\Users\veryh\OneDrive\Documents\civichub2"

# Step 2: Verify you're in the right place (should show package.json)
dir package.json

# Step 3: Now run npm commands
npm install
npm run dev
```

---

### For Backend (Server Directory)

**Open PowerShell/Command Prompt and run these commands:**

```powershell
# Step 1: Navigate to server folder
cd "C:\Users\veryh\OneDrive\Documents\civichub2\server"

# Step 2: Verify you're in the right place (should show package.json and index.js)
dir package.json
dir index.js

# Step 3: Now run npm commands
npm install
npm run dev
```

---

## Quick Copy-Paste Commands

### Setup Backend (Run these in order):

```powershell
cd "C:\Users\veryh\OneDrive\Documents\civichub2\server"
npm install
npm run dev
```

### Setup Frontend (Run these in order):

```powershell
cd "C:\Users\veryh\OneDrive\Documents\civichub2"
npm install
npm run dev
```

---

## How to Know You're in the Right Directory

**Check your PowerShell prompt - it should show:**
```
PS C:\Users\veryh\OneDrive\Documents\civichub2>          ← For frontend
PS C:\Users\veryh\OneDrive\Documents\civichub2\server>  ← For backend
```

**If it shows something like:**
```
PS C:\Users\veryh>     ← WRONG! You need to cd to the project
```

---

## Visual Guide

```
❌ WRONG Location:
PS C:\Users\veryh> npm install
(Error: Cannot find package.json)

✅ CORRECT Location for Frontend:
PS C:\Users\veryh\OneDrive\Documents\civichub2> npm install
(Success!)

✅ CORRECT Location for Backend:
PS C:\Users\veryh\OneDrive\Documents\civichub2\server> npm install
(Success!)
```

---

## Step-by-Step Fix

1. **Open PowerShell** (Windows Key + X, then select PowerShell)

2. **Type this exactly:**
   ```powershell
   cd "C:\Users\veryh\OneDrive\Documents\civichub2"
   ```

3. **Press Enter** - You should see the path change in your prompt

4. **Verify you're in the right place:**
   ```powershell
   ls package.json
   ```
   Should show: `package.json` file exists

5. **Now run:**
   ```powershell
   npm install
   ```

---

## Common Mistakes to Avoid

❌ **Don't run npm from:**
- `C:\Users\veryh\`
- `C:\Users\veryh\Desktop\`
- Any folder without `package.json`

✅ **Always run npm from:**
- `C:\Users\veryh\OneDrive\Documents\civichub2\` (for frontend)
- `C:\Users\veryh\OneDrive\Documents\civichub2\server\` (for backend)

---

## Verification Commands

**To check if you're in the right directory:**

```powershell
# Show current directory
Get-Location

# Check if package.json exists
Test-Path package.json

# List files
dir
```

---

## Still Having Issues?

1. **Copy the exact path from File Explorer:**
   - Open File Explorer
   - Navigate to: `C:\Users\veryh\OneDrive\Documents\civichub2`
   - Click in the address bar
   - Copy the full path
   - Use it in PowerShell: `cd "PASTE_PATH_HERE"`

2. **Use File Explorer:**
   - Navigate to the folder
   - Right-click in the folder
   - Select "Open in Terminal" or "Open PowerShell window here"

3. **Check your project structure:**
   - Make sure `package.json` exists in the root
   - Make sure `server\package.json` exists for backend

---

## Need to Install for Both Frontend and Backend?

**Terminal 1 (Backend):**
```powershell
cd "C:\Users\veryh\OneDrive\Documents\civichub2\server"
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```powershell
cd "C:\Users\veryh\OneDrive\Documents\civichub2"
npm install
npm run dev
```

**Terminal 3 (MongoDB - if needed):**
```powershell
mongod
```

---

That's it! The key is always being in the correct directory before running npm commands.

