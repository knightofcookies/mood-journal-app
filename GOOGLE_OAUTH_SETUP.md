# Google OAuth Setup

## Steps to Configure Google Sign-In

1. **Go to Google Cloud Console**
   - Visit https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable Google APIs**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add name: "Mood Journal"

4. **Configure Authorized Redirect URIs**
   - Add for local development: `http://localhost:5173/auth/google/callback`
   - Add for local development (alternate port): `http://localhost:5174/auth/google/callback`
   - For production, add your production URL: `https://yourdomain.com/auth/google/callback`

5. **Copy Credentials to .env**

   ```
   GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   ```

6. **Restart your dev server**
   ```bash
   npm run dev
   ```

## Testing

1. Navigate to http://localhost:5173/auth/login
2. Click "Continue with Google"
3. Sign in with your Google account
4. You should be redirected to /journal after successful authentication

## Notes

- Users are automatically created on first sign-in
- Avatar is fetched from Google profile
- Username is generated from email
- No password is required for Google users
