# OAuth Configuration Verification Checklist

**Issue:** Still getting "Origin not allowed" error after configuration
**Date:** October 19, 2025
**Deployment:** https://cricket-team-management-cotaa1d9h.vercel.app

---

## ✅ Complete OAuth Client Configuration

### Step 1: Verify Google Cloud Console OAuth Client

1. **Open Google Cloud Console**
   - URL: https://console.cloud.google.com/apis/credentials
   - Project: **islanderscricketclub**

2. **Find OAuth 2.0 Client ID**
   - Look for: `508141093989-jpvcvq7j5uobp4buou0cudd7f1gh6aj5.apps.googleusercontent.com`
   - Click the **Edit** (pencil) icon

3. **Verify Authorized JavaScript origins has ALL of these:**
   ```
   https://islanderscricketclub.firebaseapp.com
   https://cricket-team-management-cotaa1d9h.vercel.app
   http://localhost
   http://localhost:5173
   ```

   **CRITICAL:** The Firebase domain (`islanderscricketclub.firebaseapp.com`) MUST be included!

4. **Verify Authorized redirect URIs has ALL of these:**
   ```
   https://islanderscricketclub.firebaseapp.com/__/auth/handler
   https://cricket-team-management-cotaa1d9h.vercel.app/__/auth/handler
   http://localhost/__/auth/handler
   http://localhost:5173/__/auth/handler
   ```

   **CRITICAL:** Each must end with `/__/auth/handler`

5. **Save and wait 10 minutes**
   - OAuth changes take time to propagate globally
   - Don't test immediately!

---

## ✅ Verify Firebase Console Settings

1. **Open Firebase Console**
   - URL: https://console.firebase.google.com/
   - Project: **islanderscricketclub**

2. **Check Authentication → Sign-in method**
   - Click **Google** provider
   - Ensure it's **Enabled**
   - Check **Web SDK configuration** shows:
     ```
     Client ID: 508141093989-jpvcvq7j5uobp4buou0cudd7f1gh6aj5.apps.googleusercontent.com
     ```
   - If different, this is the problem!

3. **Check Authentication → Settings → Authorized domains**
   - Should include:
     ```
     islanderscricketclub.firebaseapp.com
     cricket-team-management-cotaa1d9h.vercel.app
     localhost
     ```

---

## 🧪 Testing Procedure (After 10 Minute Wait)

### Step 1: Clear Browser Completely

**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete`
2. Select "All time"
3. Check:
   - ✅ Cookies and other site data
   - ✅ Cached images and files
   - ✅ Site settings
4. Click "Clear data"

**Or use Incognito:**
- `Ctrl + Shift + N` (Chrome)
- `Ctrl + Shift + P` (Firefox/Edge)

### Step 2: Test Login with Console Open

1. **Open deployment in incognito:**
   - https://cricket-team-management-cotaa1d9h.vercel.app/login

2. **Open Browser Console:**
   - Press `F12`
   - Go to **Console** tab
   - Keep it open

3. **Click "Continue with Google"**

4. **Watch for errors in console:**
   - Copy any error messages
   - Take screenshots of errors

### Step 3: Check Network Tab

1. **In F12, switch to Network tab**
2. **Filter:** `auth`
3. **Try login again**
4. **Look for failed requests (red)**
5. **Click failed request → Headers tab**
6. **Check "Request URL" - does it match an authorized domain?**

---

## 🐛 Common Error Messages & Fixes

### Error: "Origin not allowed: https://cricket-team-management-cotaa1d9h.vercel.app"

**Cause:** Domain not in OAuth JavaScript origins

**Fix:**
- Verify domain is in Google Cloud OAuth client
- Check for typos in the URL
- Ensure no trailing slash
- Wait 10 minutes after adding

---

### Error: "Redirect URI mismatch"

**Cause:** Missing or incorrect redirect URI

**Fix:**
- Verify `https://cricket-team-management-cotaa1d9h.vercel.app/__/auth/handler` is in redirect URIs
- Check Firebase domain redirect is also added
- Ensure `/__/auth/handler` path is included

---

### Error: "idpiframe_initialization_failed"

**Cause:** Third-party cookies blocked

**Fix:**
- Enable third-party cookies in browser
- Chrome: Settings → Privacy → Cookies → Allow all cookies (temporarily)
- Or add exception for `accounts.google.com`

---

### Error: "popup_closed_by_user" (but you didn't close it!)

**Cause:** Popup blocked or closed automatically due to auth error

**Fix:**
- Check popup blocker settings
- Try again after OAuth propagation wait
- Check console for underlying error

---

## 🔍 Advanced Debugging

### Get Browser Console Errors

1. **F12 → Console tab**
2. **Try login**
3. **Right-click any error → "Save as..."**
4. **Send to developer**

### Check OAuth Flow in Network Tab

1. **F12 → Network tab**
2. **Try login**
3. **Look for requests to:**
   - `accounts.google.com/o/oauth2/`
   - `islanderscricketclub.firebaseapp.com/__/auth/`
4. **Check response codes:**
   - 200 = Success ✅
   - 400 = Bad request (check redirect URI)
   - 403 = Forbidden (check origins)

### Verify Firebase Config in Code

1. **F12 → Console tab**
2. **Type and run:**
   ```javascript
   console.log(import.meta.env.VITE_FIREBASE_API_KEY)
   console.log(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)
   console.log(import.meta.env.VITE_FIREBASE_PROJECT_ID)
   ```
3. **Verify values match Firebase Console**

---

## ✅ Expected Successful Login Flow

When working correctly, you should see:

1. **Click "Continue with Google"**
2. **Popup opens showing Google account selection**
3. **Select account**
4. **Popup closes automatically**
5. **Redirect to `/profile` page**
6. **See your name and admin access**

Console should show:
```
Firebase: Successfully signed in
User: {uid: "...", email: "..."}
```

---

## 🚨 If Still Not Working After All Steps

### Checklist Before Asking for Help:

- [ ] Waited full 10 minutes after OAuth client changes
- [ ] Cleared all browser data
- [ ] Tested in incognito window
- [ ] Verified ALL URLs are in OAuth client (including Firebase domain)
- [ ] Verified redirect URIs have `/__/auth/handler` path
- [ ] Checked Firebase Console shows correct client ID
- [ ] Checked browser console for errors
- [ ] Third-party cookies enabled

### Information to Provide:

1. **Screenshot of OAuth client configuration** (JavaScript origins + Redirect URIs)
2. **Screenshot of Firebase Google provider settings**
3. **Screenshot of browser console error**
4. **Screenshot of Network tab showing failed request**
5. **Exact error message text**

---

## 🎯 Most Common Solution

**90% of the time, the fix is:**

1. Add `https://islanderscricketclub.firebaseapp.com` to JavaScript origins
2. Add `https://islanderscricketclub.firebaseapp.com/__/auth/handler` to redirect URIs
3. Wait 10 minutes
4. Clear browser cache
5. Test in incognito

**Firebase ALWAYS redirects through its own domain first**, so that domain MUST be authorized even if you're using a custom domain!

---

## 📞 Additional Resources

**Firebase Auth Troubleshooting:**
https://firebase.google.com/docs/auth/web/google-signin#troubleshooting

**Google OAuth Error Codes:**
https://developers.google.com/identity/sign-in/web/troubleshooting

**Check OAuth Client Status:**
https://console.cloud.google.com/apis/credentials

---

✅ **Follow this checklist systematically and auth WILL work!**
