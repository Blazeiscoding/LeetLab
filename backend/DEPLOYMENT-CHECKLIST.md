# 🚀 Render Deployment Checklist

## Pre-Deployment

- [ ] All code is committed and pushed to Git repository
- [ ] All TypeScript compilation errors are fixed
- [ ] Build runs successfully locally: `npm run build`
- [ ] Application starts successfully locally: `npm start`
- [ ] All environment variables are documented

## Render Setup

### 1. Database
- [ ] Created PostgreSQL database on Render
- [ ] Copied Internal Database URL
- [ ] Database is in same region as web service

### 2. Web Service
- [ ] Created new Web Service on Render
- [ ] Connected Git repository
- [ ] Selected correct branch (usually `main`)

### 3. Build Configuration
- [ ] **Build Command**: `npm install && npx prisma generate && npm run build`
- [ ] **Start Command**: `npm start`
- [ ] **Node Version**: 20.18.0 (or compatible)

### 4. Environment Variables

Add these in Render Dashboard → Environment tab:

#### Required ✅
```
NODE_ENV=production
DATABASE_URL=<your-postgres-internal-url>
JWT_SECRET=<strong-random-secret>
```

#### Recommended ⚠️
```
RENDER_EXTERNAL_URL=<auto-set-by-render-or-manual>
RESEND_API_KEY=<if-using-email>
RESEND_FROM_EMAIL=<your-email>
RAPIDAPI_KEY=<if-using-rapidapi>
RAPIDAPI_BASE_URL=https://judge0-ce.p.rapidapi.com
RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
JUDGE0_API_URL=<if-using-direct-judge0>
JUDGE0_AUTH=<if-using-direct-judge0>
COOKIE_DOMAIN=<your-domain.com>
ALLOWED_ORIGINS=<comma-separated-list>
```

**Generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

### 5. Deploy
- [ ] Click "Create Web Service" (or "Apply" for Blueprint)
- [ ] Monitor build logs
- [ ] Wait for deployment to complete

## Post-Deployment Verification

- [ ] Service is running (no crashes in logs)
- [ ] Health check works: `https://your-service.onrender.com/api/v1/health`
- [ ] Ping endpoint works: `https://your-service.onrender.com/api/v1/ping`
- [ ] Database connection successful (check logs)
- [ ] Prisma migrations completed (check build logs)
- [ ] Environment variables are set correctly
- [ ] CORS is configured properly

## Testing Endpoints

Test these endpoints after deployment:

1. **Health Check**: `GET /api/v1/health`
2. **Ping**: `GET /api/v1/ping`
3. **Register**: `POST /api/v1/auth/register`
4. **Login**: `POST /api/v1/auth/login`

## Troubleshooting Common Issues

### ❌ Build Fails
- Check build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version matches `.nvmrc`

### ❌ Service Crashes on Start
- Check application logs
- Verify `JWT_SECRET` is set
- Ensure `DATABASE_URL` is correct
- Check that `dist/` folder exists after build

### ❌ Database Connection Failed
- Verify `DATABASE_URL` uses Internal Database URL
- Check database is not paused (free tier)
- Ensure database is in same region

### ❌ Prisma Errors
- Check `postinstall` script runs
- Verify migrations ran in build
- Check Prisma schema matches database

### ❌ 502 Bad Gateway
- Service may have crashed - check logs
- Free tier services spin down after inactivity
- Wait for service to spin back up (30-60 seconds)

## Performance Optimization

- [ ] Upgrade to Starter plan for production (better performance)
- [ ] Enable health checks in Render dashboard
- [ ] Set up monitoring/alerting
- [ ] Configure auto-deploy only for main branch
- [ ] Consider using Render's PostgreSQL for better latency

## Security Checklist

- [ ] `JWT_SECRET` is strong and unique
- [ ] Database URL uses Internal Database URL (not external)
- [ ] CORS origins are restricted to your domains
- [ ] Environment variables are marked as secret in Render
- [ ] No sensitive data in code or logs

## Documentation

- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide available

---

**Need Help?** Check the detailed guide in `README-DEPLOY.md`

