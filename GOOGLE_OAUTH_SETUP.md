# Google OAuth Setup Guide for QuickBite

## Overview
Google OAuth has been integrated into your QuickBite application. Users can now sign in using their Google account in addition to the traditional email/password method.

## What's Been Implemented

### Backend Changes:
1. **User Model** (`backend/models/User.js`)
   - Added `googleId` field to store Google user IDs
   - Made `password` field optional (since Google users don't need passwords)

2. **Auth Routes** (`backend/routes/auth.routes.js`)
   - Added `/api/auth/google` endpoint for Google OAuth login
   - Verifies Google tokens using Google Auth Library
   - Creates new users or logs in existing users

3. **Dependencies Installed:**
   - `google-auth-library` - For verifying Google tokens
   - `passport` and `passport-google-oauth20` - For OAuth support

### Frontend Changes:
1. **Login Page** (`frontend/src/pages/auth/Login.jsx`)
   - Added Google Sign-In button
   - Integrated `@react-oauth/google` library (already installed)
   - Added "Or continue with email" divider
   - Handles Google authentication flow

2. **Environment Variables** (`frontend/.env`)
   - Added `VITE_GOOGLE_CLIENT_ID` placeholder

## Setup Instructions

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Create a new project or select an existing one:
   - Click on the project dropdown at the top
   - Click "New Project"
   - Name it "QuickBite" or similar
   - Click "Create"

3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen:
     - Choose "External" user type
     - Fill in app name: "QuickBite"
     - Add your email as support email
     - Add authorized domains (for production)
     - Click "Save and Continue"
   
5. Create OAuth Client ID:
   - Application type: "Web application"
   - Name: "QuickBite Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Add your production URL when deploying
   - Authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - Add your production URL when deploying
   - Click "Create"

6. Copy the credentials:
   - You'll see a popup with your Client ID and Client Secret
   - **Copy the Client ID** - you'll need this for both frontend and backend

### Step 2: Configure Backend

1. Open `backend/.env` file (you'll need to ask the user to share this or add it manually)

2. Add the following line:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

3. Replace `your_google_client_id_here` with the Client ID from Step 1

### Step 3: Configure Frontend

1. Open `frontend/.env` file

2. Update the Google Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

3. Replace `your_google_client_id_here` with the same Client ID from Step 1

### Step 4: Restart Your Servers

1. Stop both backend and frontend servers (Ctrl+C)

2. Restart backend:
   ```bash
   cd backend
   npm start
   ```

3. Restart frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## How It Works

### User Flow:

1. **New User with Google:**
   - User clicks "Sign in with Google" button
   - Google authentication popup appears
   - User selects their Google account
   - Backend receives Google token
   - Backend verifies token with Google
   - New user account is created with Google ID
   - User is logged in and redirected to dashboard

2. **Existing User with Google:**
   - User clicks "Sign in with Google" button
   - Google authentication popup appears
   - User selects their Google account
   - Backend finds existing user by email or Google ID
   - User is logged in and redirected to dashboard

3. **Linking Google to Existing Account:**
   - If a user registered with email/password and later uses Google with the same email
   - The system automatically links the Google ID to their existing account

### Security Features:

- Google tokens are verified server-side using Google's official library
- Tokens are validated against your Google Client ID
- User data is only extracted from verified tokens
- JWT tokens are generated for session management
- All existing security measures remain in place

## Testing

1. Navigate to the login page: `http://localhost:5173`

2. Click the "Sign in with Google" button

3. Select a Google account

4. You should be logged in and redirected to the appropriate dashboard

5. Check the database to see the new user with `googleId` field populated

## Troubleshooting

### "Google login failed" error:
- Check that GOOGLE_CLIENT_ID is correctly set in both `.env` files
- Ensure the Client ID matches exactly (no extra spaces)
- Verify that `http://localhost:5173` is in authorized origins

### "Invalid Google token" error:
- The token verification failed
- Check backend logs for more details
- Ensure google-auth-library is installed: `npm install google-auth-library`

### Google button doesn't appear:
- Check that VITE_GOOGLE_CLIENT_ID is set in frontend/.env
- Restart the frontend development server
- Check browser console for errors

### CORS errors:
- Ensure your backend CORS configuration allows requests from `http://localhost:5173`
- Check `backend/server.js` CORS settings

## Production Deployment

When deploying to production:

1. Update Google Cloud Console:
   - Add your production domain to authorized JavaScript origins
   - Add your production domain to authorized redirect URIs

2. Update environment variables:
   - Set `GOOGLE_CLIENT_ID` in your production backend environment
   - Set `VITE_GOOGLE_CLIENT_ID` in your production frontend build

3. Rebuild frontend:
   ```bash
   npm run build
   ```

## Additional Features You Can Add

1. **Role Selection During Google Sign-In:**
   - Currently defaults to 'user' role
   - Can add a role selection modal before completing Google sign-in

2. **Profile Picture:**
   - Google provides profile picture URL in the token payload
   - Can be stored and displayed in user profile

3. **Email Verification:**
   - Google accounts are already verified
   - Can skip email verification for Google users

4. **Account Linking UI:**
   - Add UI to link/unlink Google account from user settings
   - Allow users to add password to Google-only accounts

## Files Modified

### Backend:
- `models/User.js` - Added googleId field
- `routes/auth.routes.js` - Added Google OAuth endpoint
- `package.json` - Added dependencies

### Frontend:
- `pages/auth/Login.jsx` - Added Google Sign-In button
- `.env` - Added Google Client ID

## Support

If you encounter any issues:
1. Check the browser console for frontend errors
2. Check the backend terminal for server errors
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed
5. Make sure Google Cloud Console is configured correctly

---

**Note:** Keep your Google Client ID and Client Secret secure. Never commit them to version control. Always use environment variables.
