# Google OAuth Setup Guide for Kalp AI

## Overview
Google OAuth integration is now fully implemented in Kalp AI. Users can sign up and log in using their Google accounts instead of creating separate credentials.

## ✅ What's Already Implemented

### Backend
- ✅ Google OAuth endpoint: `POST /api/v2/auth/google`
- ✅ Automatic account creation/linking based on Google ID
- ✅ JWT token generation for authenticated sessions
- ✅ User profile and memory initialization for OAuth users
- ✅ Location: [Backend/controllers/enhancedAuth.controller.js](Backend/controllers/enhancedAuth.controller.js#L187)

### Frontend  
- ✅ Google Sign-In button on [LoginPage.jsx](Kalp%20Frontend/src/components/LoginPage.jsx)
- ✅ Google Sign-Up button on [RegisterPage.jsx](Kalp%20Frontend/src/components/RegisterPage.jsx)
- ✅ Google OAuth library loaded in [public/index.html](Kalp%20Frontend/public/index.html)
- ✅ AuthContext integration with `googleLogin()` function
- ✅ Location: [Kalp Frontend/src/contexts/AuthContext.js](Kalp%20Frontend/src/contexts/AuthContext.js#L134)

### Environment Configuration
- ✅ Backend: `GOOGLE_CLIENT_ID=139168155004-7kc5pgvf9n58nhi4f2accjfn1qu3n7lq.apps.googleusercontent.com`
- ✅ Frontend: `REACT_APP_GOOGLE_CLIENT_ID=139168155004-7kc5pgvf9n58nhi4f2accjfn1qu3n7lq.apps.googleusercontent.com`

## 🚀 Production Deployment Checklist

### Step 1: Update Vercel Environment Variables
Go to [Vercel Dashboard](https://vercel.com/dashboard) → Project Settings → Environment Variables

Add:
```
REACT_APP_GOOGLE_CLIENT_ID=139168155004-7kc5pgvf9n58nhi4f2accjfn1qu3n7lq.apps.googleusercontent.com
```

**Important:** This variable must be prefixed with `REACT_APP_` to be available to React.

### Step 2: Update Render Environment Variables
Go to [Render Dashboard](https://dashboard.render.com) → Backend Service → Environment

Ensure these are set:
```
GOOGLE_CLIENT_ID=139168155004-7kc5pgvf9n58nhi4f2accjfn1qu3n7lq.apps.googleusercontent.com
```

### Step 3: Configure Google OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select Project: "Kalp AI Development" 
3. Navigate to: APIs & Services → OAuth 2.0 Consent Screen
4. **Authorized domains:** Add your Vercel domain
   - `kalp-jade.vercel.app` (current)
   - Any custom domains you plan to use

5. Navigate to: APIs & Services → Credentials
6. Edit the OAuth 2.0 Client ID
7. Add authorized origins:
   ```
   https://kalp-jade.vercel.app
   http://localhost:3000
   ```
8. Add authorized redirect URIs:
   ```
   https://kalp-jade.vercel.app/chat
   https://kalp-jade.vercel.app/
   http://localhost:3000/chat
   http://localhost:3000/
   ```

### Step 4: Trigger Redeployment
After updating environment variables:

**Vercel:** 
- Go to Deployments → Select latest → Click "Redeploy"

**Render:**
- Go to Services → Backend → Notices → Trigger redeploy (or commit a code change)

## 🧪 Testing Google OAuth

### Local Testing
1. Start backend: `npm start` (from Backend folder)
2. Start frontend: `npm start` (from Kalp Frontend folder)
3. Go to http://localhost:3000
4. Click "Continue with Google" button
5. Select your Google account
6. Should redirect to chat interface after successful authentication

### Production Testing
1. Go to https://kalp-jade.vercel.app
2. Click "Continue with Google" on Login page
3. Select your Google account
4. Verify you're logged in and can access chat

## 🔍 Troubleshooting

### Issue: "Google OAuth not available" Error
**Solution:** 
- Check browser console for errors
- Verify `REACT_APP_GOOGLE_CLIENT_ID` is set in Vercel environment
- Clear browser cache and local storage
- Check that Google OAuth script loaded: `<script src="https://accounts.google.com/gsi/client" async defer></script>`

### Issue: "Google authentication failed" on Backend
**Solution:**
- Check Render logs for errors
- Verify `GOOGLE_CLIENT_ID` is set in Render environment
- Ensure MongoDB connection is working
- Check that `enhancedAuth.controller.js` is deployed correctly

### Issue: Token Not Saved to LocalStorage
**Solution:**
- Check browser DevTools → Application → LocalStorage
- Verify response contains `token` field
- Check AuthContext `googleLogin` function is properly handling response

### Issue: "Invalid Client ID" Error
**Solution:**
- Verify the Google Client ID is correct: `139168155004-7kc5pgvf9n58nhi4f2accjfn1qu3n7lq.apps.googleusercontent.com`
- Check your domain is in Google Console authorized domains
- Verify you're using correct environment variables for the correct environment

## 📝 API Reference

### Google Authentication Endpoint
**Endpoint:** `POST /api/v2/auth/google`

**Request Body:**
```json
{
  "googleId": "string (from Google JWT)",
  "email": "user@example.com",
  "displayName": "User Name",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Google authentication successful",
  "token": "jwt_token_string",
  "user": {
    "_id": "user_id",
    "username": "username",
    "email": "user@example.com",
    "displayName": "User Name",
    "googleId": "google_id",
    "avatar": "https://example.com/avatar.jpg",
    "isVerified": true,
    "createdAt": "2025-01-22T10:00:00Z"
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "message": "Error message"
}
```

## 🔐 Security Notes

1. **Client ID is Public:** The Google Client ID doesn't need to be secret - it's safe to expose in frontend code
2. **Token Validation:** Backend validates JWT token signature from Google
3. **User Linking:** If a user tries to sign in with Google using an email that already exists, their account gets linked
4. **Verified Users:** Google users are automatically marked as `isVerified: true`
5. **HTTPS Required:** In production, domain must be HTTPS for Google OAuth to work

## 📚 Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Web](https://developers.google.com/identity/gsi/web)
- [Backend OAuth Implementation](Backend/controllers/enhancedAuth.controller.js)
- [Frontend OAuth Context](Kalp%20Frontend/src/contexts/AuthContext.js)

## 🎯 Next Steps

1. **Immediate:** Add `REACT_APP_GOOGLE_CLIENT_ID` to Vercel environment variables
2. **Soon:** Configure authorized domains in Google Cloud Console
3. **Testing:** Test Google OAuth on staging/production environment
4. **Optional:** Add social sign-in buttons for Facebook, GitHub, etc.

---

**Last Updated:** January 22, 2025  
**Status:** ✅ Production Ready
