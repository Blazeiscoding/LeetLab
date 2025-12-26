# 🔧 URGENT: Fix Render Build Command

## Problem
Your Render build is failing because migrations are running during build. The build command shown in logs is:
```
npm install && npx prisma generate && npx prisma migrate deploy
```

But it should be:
```
npm install && npx prisma generate && npm run build
```

## Solution: Update Build Command in Render Dashboard

**IMPORTANT**: If you manually set the build command in Render dashboard, it overrides `render.yaml`. You need to update it manually:

### Steps:

1. **Go to Render Dashboard**
   - Navigate to your service
   - Click on **"Settings"** tab

2. **Find Build Command**
   - Scroll to **"Build Command"** section

3. **Update Build Command**
   - **Remove**: `npx prisma migrate deploy` from the build command
   - **Change to**: `npm install && npx prisma generate && npm run build`

4. **Update Start Command**
   - Find **"Start Command"** section
   - **Change to**: `npm run migrate && npm start`

5. **Save Changes**
   - Click **"Save Changes"**
   - Service will auto-redeploy

## Why This Happens

When you manually set build/start commands in Render dashboard, they override the `render.yaml` file. You need to either:

**Option A**: Update manually in dashboard (fastest)
**Option B**: Delete the service and recreate using Blueprint (uses render.yaml)

## Verification

After updating, the build logs should show:
```
==> Running build command 'npm install && npx prisma generate && npm run build'...
```

And the start logs should show:
```
==> Running start command 'npm run migrate && npm start'...
Running migrations...
Starting server...
```

## Alternative: Make Migrations Resilient

If you want migrations to run during build but handle timeouts gracefully, we can update the migrate script to be more resilient. However, it's better to run migrations at startup.

