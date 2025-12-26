# ⚠️ CRITICAL: Update Render Dashboard Build Command

## The Problem
Your Render service has a **manually set build command** that overrides the `render.yaml` file. 

**Current (WRONG) build command in Render:**
```
npm install && npx prisma generate && npx prisma migrate deploy
```

**Should be:**
```
npm install && npx prisma generate && npm run build
```

## Quick Fix (Do This Now!)

### Step 1: Open Render Dashboard
1. Go to [render.com](https://render.com)
2. Navigate to your **leetlab-backend** service
3. Click on **"Settings"** tab (top navigation)

### Step 2: Update Build Command
1. Scroll down to **"Build & Deploy"** section
2. Find **"Build Command"** field
3. **REPLACE** the entire command with:
   ```
   npm install && npx prisma generate && npm run build
   ```
4. **IMPORTANT**: Remove `npx prisma migrate deploy` from the build command

### Step 3: Update Start Command
1. Find **"Start Command"** field (below Build Command)
2. **REPLACE** with:
   ```
   npm run migrate:force && npm start
   ```

### Step 4: Save and Deploy
1. Click **"Save Changes"** button (bottom of page)
2. Render will automatically trigger a new deployment
3. Watch the build logs - it should now succeed!

## What This Does

**Build Phase:**
- ✅ Installs dependencies
- ✅ Generates Prisma Client
- ✅ Compiles TypeScript to `dist/` folder
- ❌ **NO migrations** (database not needed)

**Start Phase:**
- ✅ Runs migrations (database is available)
- ✅ Starts the Node.js server

## Verification

After updating, check the build logs. You should see:
```
==> Running build command 'npm install && npx prisma generate && npm run build'...
✔ Generated Prisma Client...
Built successfully
```

And in start logs:
```
==> Running start command 'npm run migrate:force && npm start'...
Running migrations...
Server is running on port...
```

## Why This Happens

When you create a service manually in Render (not using Blueprint), the dashboard settings override `render.yaml`. You must update the commands in the dashboard manually.

## Alternative: Use Blueprint (Future)

To avoid this issue in the future, you can:
1. Delete the current service
2. Create a new service using **"Blueprint"**
3. Connect your repository
4. Render will automatically use `render.yaml`

---

**After updating, push this commit and the next deployment should work!** 🚀

