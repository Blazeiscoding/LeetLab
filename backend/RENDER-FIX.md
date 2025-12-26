# Render Deployment Fix

## Issue
Error: `Cannot find module '/opt/render/project/src/dist/index.js'`

## Root Cause
The `dist` folder is created at the project root, but the error suggests a path mismatch. This can happen if:
1. Build fails before creating dist folder
2. Working directory is incorrect
3. Migrations fail during build and stop the process

## Solution Applied

1. **Separated migrations from build**: Migrations now run at startup, not during build
   - Build command: Only compiles TypeScript
   - Start command: Runs migrations first, then starts the app

2. **Updated render.yaml**:
   - `buildCommand`: `npm install && npx prisma generate && npm run build`
   - `startCommand`: `npm run migrate && npm start`

3. **Updated package.json scripts**:
   - `build`: Only runs `tsc` (TypeScript compilation)
   - `migrate`: Runs Prisma migrations separately

## Why This Works

- TypeScript compilation always completes (no database dependency)
- `dist` folder is guaranteed to exist before start command runs
- Migrations run when database is available (at startup)
- If migrations fail, you'll see the error in logs, but the build will have succeeded

## Next Steps

1. Commit and push these changes:
   ```bash
   git add .
   git commit -m "Fix Render deployment - separate migrations from build"
   git push origin main
   ```

2. On Render:
   - The service will auto-redeploy
   - Or manually trigger a new deployment
   - Watch the build logs to ensure `dist` folder is created
   - Watch start logs to see migrations run

3. Verify:
   - Build logs should show: "Built successfully" or similar
   - Start logs should show: Migration output, then "Server is running on port..."
   - Health endpoint should work: `https://your-service.onrender.com/api/v1/health`

## Troubleshooting

If the issue persists:

1. **Check build logs**: Look for TypeScript compilation errors
2. **Verify dist folder**: In build logs, you should see files being created
3. **Check start logs**: See if migrations are running successfully
4. **Verify DATABASE_URL**: Must be set correctly for migrations

If `dist` folder still doesn't exist after build:
- Check TypeScript compilation errors
- Verify `tsconfig.json` is correct
- Ensure `src` folder structure is correct

