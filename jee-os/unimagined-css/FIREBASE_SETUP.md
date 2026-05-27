# Firebase Setup Guide for JEE OS

This guide will walk you through setting up Firebase authentication and deploying to Render.

## Prerequisites

- A Google account
- A Firebase project (create one at [console.firebase.google.com](https://console.firebase.google.com))
- A Render account (for deployment)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name (e.g., "jee-os")
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get started"
3. Enable **Google** sign-in:
   - Click on "Google"
   - Set "Project support email" to your email
   - Click "Save"
4. (Optional) Enable **Anonymous** sign-in for testing

## Step 3: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register app with nickname "JEE OS Web"
5. Copy the `firebaseConfig` object values

## Step 4: Configure Environment Variables

### For Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Firebase config values in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### For Render Deployment

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. In Render dashboard, go to **Environment** tab
5. Add the following environment variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

6. Deploy!

## Step 5: Configure Firebase Security Rules

### Firestore Rules

Go to **Build** → **Firestore Database** → **Rules** and set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /user-data/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Storage Rules (if using storage)

Go to **Build** → **Storage** → **Rules**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 6: Configure Authorized Domains

1. In Firebase Console, go to **Build** → **Authentication** → **Settings**
2. Under "Authorized domains", add your Render domain:
   - `your-app.onrender.com`
3. Click "Add domain"

## Testing

### Test Locally

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. You should be redirected to `/login`
4. Click "Continue with Google" or "Continue Anonymously"
5. You should be redirected to the dashboard

### Test on Render

1. After deployment, visit your Render URL
2. You should see the login page
3. Log in with Google
4. Your data should sync to Firestore

## Troubleshooting

### "Firebase configuration is incomplete" warning

- Make sure all 6 environment variables are set
- Check that variable names are exactly as specified
- Restart the development server after changing `.env.local`

### Login fails with "Operation not supported"

- Check that Google sign-in is enabled in Firebase Console
- Verify your domain is in the authorized domains list
- Clear browser cache and try again

### Data not syncing

- Check browser console for errors
- Verify Firestore rules allow read/write
- Make sure user is authenticated

### Build fails on Render

- Check Render logs for error messages
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

## Optional: Firebase Emulator for Local Development

For offline development, you can use Firebase Emulator:

1. Install Firebase Tools:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```

4. Start emulators:
   ```bash
   firebase emulators:start
   ```

5. Update `lib/firebase.ts` to use emulator:
   ```typescript
   import { connectAuthEmulator } from 'firebase/auth'
   import { connectFirestoreEmulator } from 'firebase/firestore'

   if (process.env.NODE_ENV === 'development') {
     connectAuthEmulator(auth, 'http://127.0.0.1:9099')
     connectFirestoreEmulator(db, '127.0.0.1', 8080)
   }
   ```

## Support

If you encounter issues:

1. Check [Firebase Documentation](https://firebase.google.com/docs)
2. Check [Next.js Documentation](https://nextjs.org/docs)
3. Review browser console for errors
4. Check Firebase Console logs

## Features

Once set up, your JEE OS will have:

- ✅ Google authentication
- ✅ Anonymous authentication option
- ✅ Cloud data sync with Firestore
- ✅ Multi-device sync
- ✅ Automatic data backup
- ✅ User-specific data isolation
- ✅ Logout functionality

## Security Notes

- User data is isolated by UID in Firestore
- Security rules prevent unauthorized access
- Environment variables are never exposed to client
- Firebase handles secure authentication

Happy tracking! 🚀