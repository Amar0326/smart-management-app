# Firebase OAuth Domain Setup

## Issue
The current domain `127.0.0.1` is not authorized for OAuth operations, which prevents sign-in methods from working properly.

## Solution

### 1. Go to Firebase Console
- Open [Firebase Console](https://console.firebase.google.com/)
- Select your project: `smart-management-afd9d`

### 2. Navigate to Authentication Settings
- Go to **Authentication** from the left sidebar
- Click on **Settings** (gear icon)
- Select the **Authorized domains** tab

### 3. Add Local Development Domain
- Click **Add domain**
- Enter: `127.0.0.1`
- Click **Add**

### 4. Add Additional Domains (Optional)
For production deployment, also add:
- `localhost` (for local development)
- Your production domain (e.g., `yourapp.com`)

### 5. Save Changes
- Click **Save** to apply the changes

## What This Fixes
After adding the authorized domain, the following will work:
- ✅ Email/Password authentication
- ✅ Sign in with redirect
- ✅ Sign in with popup
- ✅ Link with popup
- ✅ Link with redirect

## Testing
After updating the domains:
1. Refresh your application at `http://localhost:5175`
2. Try registering a new user
3. Try logging in with existing credentials

## Production Deployment
For production deployment:
1. Add your production domain to authorized domains
2. Update Firebase configuration in `.env` file
3. Deploy your application

## Note
It may take a few minutes for the changes to propagate across Firebase servers.
