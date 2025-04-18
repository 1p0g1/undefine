# Deployment Guide

## Prerequisites
- Node.js 16+
- A Supabase account and project
- A Render account

## Deploy to Render
1. **Create a new Web Service** in Render
   - Connect your GitHub repository
   - Use these settings:
     - **Name**: undefine-app
     - **Environment**: Node
     - **Build Command**: `npm install && npm run build && cd client && npm install && npm run build`
     - **Start Command**: `npm start`

2. **Set up environment variables** in Render dashboard:
   - `NODE_ENV` = `production`
   - `SUPABASE_URL` = your Supabase URL
   - `SUPABASE_ANON_KEY` = your Supabase anon key

3. **Deploy your service**:
   - Wait for the build to complete
   - Your app will be available at `https://undefine-app.onrender.com`

4. **Update frontend config**:
   - After your backend is deployed, update `client/.env.production`:
     ```
     VITE_API_URL=https://your-service-name.onrender.com
     ```
   - Commit and push this change

## Testing Locally Before Deployment
You can simulate a production build locally:

```bash
# Build both backend and frontend
./scripts/build-test.sh
```

Access your app at http://localhost:3001

## Troubleshooting
- **API not found**: Check if `VITE_API_URL` is set correctly
- **Database connection issues**: Verify Supabase credentials
- **Build failing**: Check build logs in Render dashboard 