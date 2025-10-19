# Google Auth "Unauthorized Domain" Error - Step-by-Step Fix

**Error:** "Unauthorized domain" when trying to sign in with Google
**Deployment:** https://cricket-team-management-cotaa1d9h.vercel.app
**Date:** October 19, 2025

---

## The Problem

Firebase Authentication uses Google OAuth, which requires domains to be authorized in **TWO places**:
1. ✅ Firebase Console (you already did this)
2. ❌ Google Cloud Console OAuth Client Settings (THIS is what's missing)

---

## Solution: Add Domain to Google Cloud Console

### Step 1: Open Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Make sure you're signed in with the account that owns the Firebase project
3. At the top, click the project dropdown
4. Select project: **islanderscricketclub**

---

### Step 2: Navigate to OAuth Credentials

1. In the left sidebar, expand **APIs & Services**
2. Click **Credentials**
3. You'll see a list of credentials

---

### Step 3: Find Your OAuth 2.0 Client ID

1. Look for an OAuth 2.0 Client ID in the list
2. It will show: `508141093989-jpvcvq7j5uobp4buou0cudd7f1gh6aj5.apps.googleusercontent.com`
3. Click the **pencil icon** (Edit) on the right side of this credential

---

### Step 4: Add Authorized JavaScript Origins

In the "Authorized JavaScript origins" section:

1. Click **+ ADD URI**
2. Add: `https://cricket-team-management-cotaa1d9h.vercel.app`
3. Click **+ ADD URI** again
4. Add: `https://islanderscricketclub.firebaseapp.com` (if not already there)

**Important:** Do NOT include trailing slashes!

---

### Step 5: Add Authorized Redirect URIs

In the "Authorized redirect URIs" section:

1. Click **+ ADD URI**
2. Add: `https://cricket-team-management-cotaa1d9h.vercel.app/__/auth/handler`
3. Click **+ ADD URI** again
4. Add: `https://islanderscricketclub.firebaseapp.com/__/auth/handler` (if not already there)

**Important:** These MUST include `/__/auth/handler` at the end!

---

### Step 6: Save Changes

1. Scroll to the bottom
2. Click **SAVE**
3. Wait for the "Credentials saved" confirmation

---

### Step 7: Verify Firebase Console (Double Check)

1. Go to: https://console.firebase.google.com/
2. Select project: **islanderscricketclub**
3. Click **Authentication** in left sidebar
4. Click **Settings** tab at the top
5. Scroll to **Authorized domains** section
6. Verify these domains are listed:
   - `islanderscricketclub.firebaseapp.com`
   - `cricket-team-management-cotaa1d9h.vercel.app`
   - `localhost` (for development)

If any are missing:
- Click **Add domain**
- Paste the domain
- Click **Add**

---

### Step 8: Test Google Sign-In

1. Open in **incognito/private window**: https://cricket-team-management-cotaa1d9h.vercel.app/login
2. Click "Continue with Google"
3. Select your Google account
4. Should successfully redirect to `/profile`

**If it still fails:**
- Clear browser cache completely (Ctrl+Shift+Delete)
- Wait 2-3 minutes (OAuth changes can take time to propagate)
- Try again in a fresh incognito window

---

## Expected OAuth Client Configuration

After following the steps above, your OAuth client should have:

**Authorized JavaScript origins:**
```
https://islanderscricketclub.firebaseapp.com
https://cricket-team-management-cotaa1d9h.vercel.app
http://localhost
http://localhost:5173
```

**Authorized redirect URIs:**
```
https://islanderscricketclub.firebaseapp.com/__/auth/handler
https://cricket-team-management-cotaa1d9h.vercel.app/__/auth/handler
http://localhost/__/auth/handler
http://localhost:5173/__/auth/handler
```

---

## Common Mistakes to Avoid

❌ **DON'T** add trailing slashes: `https://example.com/` (wrong)
✅ **DO** use exact URLs: `https://example.com` (correct)

❌ **DON'T** forget `/__/auth/handler` in redirect URIs
✅ **DO** include it: `https://example.com/__/auth/handler`

❌ **DON'T** add only to Firebase Console (needs both places!)
✅ **DO** add to BOTH Firebase AND Google Cloud Console

---

## Troubleshooting

### Error: "This app is blocked"

**Cause:** OAuth consent screen not configured or not published

**Fix:**
1. Google Cloud Console → **APIs & Services** → **OAuth consent screen**
2. If status is "Testing", click **PUBLISH APP**
3. Confirm publishing
4. OR add your email as a test user if keeping it in testing mode

---

### Error: "Invalid client ID"

**Cause:** Firebase config mismatch

**Fix:**
1. Check `.env` file has correct `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_APP_ID`
2. Verify these match Firebase Console → Project Settings → General → Your apps

---

### Login succeeds but redirects to wrong page

**Cause:** Navigation issue in code

**Fix:**
1. Check `src/pages/Login.tsx` - should redirect to `/profile` after login
2. Verify `src/contexts/AuthContext.tsx` is loading user data correctly

---

## Summary Checklist

Before testing, ensure:

- [ ] Domain added to Google Cloud Console **Authorized JavaScript origins**
- [ ] Redirect URI added to Google Cloud Console **Authorized redirect URIs**
- [ ] Domain added to Firebase Console **Authorized domains**
- [ ] Waited 2-3 minutes after making changes
- [ ] Testing in incognito/private browser window
- [ ] Browser cache cleared

---

## Additional Notes

- Every new Vercel deployment gets a new URL, so you'll need to repeat this process
- Consider setting up a custom domain (e.g., `islanders.cricket`) to avoid this
- You can add multiple domains to the OAuth client - they all work simultaneously

---

## Need More Help?

**Firebase Auth Documentation:**
https://firebase.google.com/docs/auth/web/google-signin

**Google OAuth Documentation:**
https://developers.google.com/identity/protocols/oauth2

**Vercel Custom Domains:**
https://vercel.com/docs/concepts/projects/domains

---

✅ **After completing these steps, Google authentication should work perfectly!**
