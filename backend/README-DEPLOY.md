# Deployment Guide for Render

This guide will help you deploy the LeetLab Backend to Render.

## Prerequisites

1. A Render account (sign up at [render.com](https://render.com))
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. A PostgreSQL database (can be created on Render)

## Step-by-Step Deployment

### 1. Push Your Code to Git

Make sure all your code is committed and pushed to your Git repository:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Create a PostgreSQL Database on Render

1. Go to your Render Dashboard
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `leetlab-db` (or your preferred name)
   - **Database**: `leetlab`
   - **User**: Auto-generated
   - **Region**: Choose closest to your users
   - **Plan**: Choose based on your needs (Free tier available for testing)
4. Click **"Create Database"**
5. Copy the **Internal Database URL** (starts with `postgresql://`)

### 3. Deploy the Web Service

#### Option A: Using render.yaml (Recommended)

1. Go to Render Dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your repository
4. Render will automatically detect `render.yaml` and use those settings
5. Update environment variables (see Step 4)

#### Option B: Manual Setup

1. Go to Render Dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your repository
4. Configure:
   - **Name**: `leetlab-backend`
   - **Environment**: `Node`
   - **Region**: Same as your database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `/` (leave empty)
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Choose based on your needs

### 4. Configure Environment Variables

In your Render service dashboard, go to **"Environment"** tab and add these variables:

#### Required Variables:

```
NODE_ENV=production
DATABASE_URL=<your-postgres-internal-url>
JWT_SECRET=<generate-a-strong-secret-key>
```

#### Optional but Recommended:

```
RENDER_EXTERNAL_URL=<auto-populated-by-render>
RESEND_API_KEY=<your-resend-api-key>
RESEND_FROM_EMAIL=<your-email@domain.com>
RAPIDAPI_KEY=<your-rapidapi-key>
RAPIDAPI_BASE_URL=https://judge0-ce.p.rapidapi.com
RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
JUDGE0_API_URL=<your-judge0-url-if-not-using-rapidapi>
JUDGE0_AUTH=<your-judge0-auth-token>
COOKIE_DOMAIN=<your-domain.com>
ALLOWED_ORIGINS=<comma-separated-origins>
```

**Note**: 
- `DATABASE_URL` should use the **Internal Database URL** from Render (starts with `postgresql://`)
- `RENDER_EXTERNAL_URL` is automatically set by Render if you use the render.yaml blueprint
- Generate a strong `JWT_SECRET` (you can use: `openssl rand -base64 32`)

### 5. Deploy

1. Click **"Create Web Service"** (or **"Apply"** if using Blueprint)
2. Render will start building and deploying your service
3. Monitor the build logs
4. Once deployed, your service URL will be shown (e.g., `https://leetlab-backend.onrender.com`)

### 6. Update CORS Origins

After deployment, update your `ALLOWED_ORIGINS` environment variable to include:
- Your frontend URL (e.g., `https://your-frontend.vercel.app`)
- Your production domain

## Post-Deployment Checklist

- [ ] Service is running (check health endpoint: `https://your-service.onrender.com/api/v1/health`)
- [ ] Database migrations ran successfully (check build logs)
- [ ] Environment variables are set correctly
- [ ] CORS is configured for your frontend
- [ ] Keep-alive cron job is scheduled (check logs at 9 AM UTC)

## Monitoring

- **Logs**: View in Render Dashboard → Your Service → Logs
- **Metrics**: Available in Render Dashboard → Your Service → Metrics
- **Health Check**: Your service has a health endpoint at `/api/v1/health`

## Troubleshooting

### Build Fails

1. Check build logs for errors
2. Ensure `package.json` scripts are correct
3. Verify Node.js version (should be 20.18.0 or compatible)
4. Check that all dependencies are in `dependencies`, not just `devDependencies`

### Database Connection Issues

1. Verify `DATABASE_URL` uses the Internal Database URL
2. Check database is in the same region
3. Ensure database is not paused (free tier pauses after inactivity)

### Service Crashes

1. Check application logs
2. Verify all required environment variables are set
3. Ensure `JWT_SECRET` is set
4. Check that port binding is correct (Render uses `PORT` env var)

### Prisma Issues

1. Ensure `postinstall` script runs (`npx prisma generate`)
2. Check that migrations run in build command
3. Verify database schema matches Prisma schema

## Performance Tips

1. **Use Starter plan or higher** for production (free tier has limitations)
2. **Enable auto-deploy** only for main branch
3. **Set up health checks** in Render dashboard
4. **Use Render PostgreSQL** for best performance (same network)

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Prisma with Render](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-render)
- [Node.js on Render](https://render.com/docs/node-version)

