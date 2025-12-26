# 🚨 URGENT: Fix Render Build Command

## The Problem

Your Render service is **NOT using render.yaml** because you manually configured the build command in the dashboard. The dashboard settings **OVERRIDE** render.yaml.

**Current build command (WRONG):**
```
npm install && npx prisma generate && npx prisma migrate deploy
```

This is failing because migrations timeout during build.

## IMMEDIATE ACTION REQUIRED

You **MUST** update the build command directly in Render Dashboard:

### Step-by-Step:

1. **Go to Render Dashboard**
   - https://dashboard.render.com
   - Click on your **leetlab-backend** service

2. **Click "Settings" tab** (top navigation)

3. **Find "Build Command" section**
   - Scroll to **"Build & Deploy"** section
   - Look for **"Build Command"** field

4. **REPLACE the build command:**
   ```
   npm install && npx prisma generate && npm run build
   ```
   ⚠️ **REMOVE** `npx prisma migrate deploy` from this command!

5. **Find "Start Command" section**
   - Look for **"Start Command"** field (below Build Command)

6. **REPLACE the start command:**
   ```
   npm run migrate:force && npm start
   ```

7. **Scroll down and click "Save Changes"**

8. **Service will auto-redeploy** - watch the logs!

## Why This Is Happening

- Render dashboard settings **OVERRIDE** render.yaml
- Your manually set build command includes migrations
- Migrations fail during build (database timeout)
- Build never completes, so `dist` folder is never created
- Service can't start because `dist/index.js` doesn't exist

## After Fixing

Build logs should show:
```
==> Running build command 'npm install && npx prisma generate && npm run build'...
✔ Generated Prisma Client
✅ Build completed
```

Start logs should show:
```
==> Running start command 'npm run migrate:force && npm start'...
Running migrations...
Server is running on port...
```

## Visual Guide

In Render Settings, you should see:

```
Build Command:
┌─────────────────────────────────────────────────────────────┐
│ npm install && npx prisma generate && npm run build        │
└─────────────────────────────────────────────────────────────┘

Start Command:
┌─────────────────────────────────────────────────────────────┐
│ npm run migrate:force && npm start                         │
└─────────────────────────────────────────────────────────────┘
```

## Alternative: Delete and Recreate Service

If updating doesn't work, you can:

1. **Delete the current service** (keeps database)
2. **Create new service** using **"Blueprint"**
3. Connect your repository
4. Render will automatically use `render.yaml`
5. Add environment variables

---

**This fix is CRITICAL - without it, your deployment will continue to fail!** 🚨

