# Vercel Deployment Configuration for Frontend

## Environment Variables to Set in Vercel Dashboard:

### API Configuration
REACT_APP_API_URL=https://your-backend-app.onrender.com
REACT_APP_WEBSOCKET_URL=https://your-backend-app.onrender.com

### App Configuration
REACT_APP_APP_NAME=Kalp AI
REACT_APP_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production

### OAuth (Optional)
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here

### Analytics (Optional)
REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX

## Vercel Project Settings:
- **Framework Preset:** Create React App
- **Build Command:** `cd "Kalp Frontend" && npm run build`
- **Output Directory:** `Kalp Frontend/build`
- **Install Command:** `cd "Kalp Frontend" && npm install`
- **Root Directory:** Leave empty (uses root)

## Domain Configuration:
1. Set custom domain in Vercel dashboard
2. Update FRONTEND_URL in backend environment variables
3. Update CORS settings in backend

## Build Configuration:
- **Node.js Version:** 18.x
- **Package Manager:** npm
- **Build Timeout:** 15 minutes

## Deployment Steps:
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure build settings
4. Deploy from main branch
5. Set up custom domain (optional)

## Post-Deployment:
1. Update backend FRONTEND_URL with your Vercel domain
2. Test authentication flow
3. Verify WebSocket connections
4. Check CORS configuration
