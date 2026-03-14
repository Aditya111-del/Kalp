# Kalp AI - Local Development Setup

## Current Configuration

Your environment is now configured for **LOCAL DEVELOPMENT**. This allows you to:
- Test changes locally before deploying
- Develop new features safely
- Debug issues in a controlled environment

## Environment Configuration

### Frontend (.env)
```properties
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WEBSOCKET_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
```

### Backend (.env)
```properties
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## How to Run Locally

### 1. Start Backend Server
```bash
cd Backend
npm install
npm start
# Backend will run on http://localhost:5000
```

### 2. Start Frontend Server
```bash
cd "Kalp Frontend"
npm install
npm start
# Frontend will run on http://localhost:3000
```

## AI Model Configuration

The AI model is already configured to remember:
- **Identity**: Kalp AI
- **Developer**: Helmer Technologies
- **Personality**: Helpful, knowledgeable, and engaging

## When Ready to Deploy

### For Production Deployment:

1. **Update Frontend .env for Production:**
```properties
REACT_APP_API_URL=https://kalp-backend.onrender.com
REACT_APP_WEBSOCKET_URL=https://kalp-backend.onrender.com
REACT_APP_ENVIRONMENT=production
```

2. **Set Environment Variables on Vercel:**
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add all REACT_APP_* variables with production URLs

3. **Set Environment Variables on Render:**
- Go to Render Dashboard → Your Backend Service → Environment
- Add all backend environment variables

## Testing Your Changes

1. Make changes to your code
2. Test locally at http://localhost:3000
3. Once satisfied, commit and push:
```bash
git add .
git commit -m "Your change description"
git push origin main
```

4. Deploy to production by updating environment variables on Vercel/Render

## AI Model Behavior

The AI will now identify itself as:
- "I am Kalp, developed by Helmer Technologies"
- Will mention Helmer Technologies when asked about its creator
- Maintains professional and helpful personality

## Important Notes

- **MongoDB**: Using production database (shared between local and production)
- **OpenRouter API**: Remember to set your real API key in Render environment variables
- **CORS**: Configured for both local development and production URLs