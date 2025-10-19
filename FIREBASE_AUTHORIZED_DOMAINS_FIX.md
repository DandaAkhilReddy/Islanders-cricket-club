# Fix: Firebase Error (auth/unauthorized-domain)

**Error Message:** `Firebase: Error (auth/unauthorized-domain)`
**Deployment:** https://cricket-team-management-cotaa1d9h.vercel.app
**Fix Time:** 2 minutes
**Date:** October 19, 2025

---

## 🎯 What This Error Means

Firebase is blocking authentication because your Vercel deployment URL is not in Firebase's authorized domains list.

**This is DIFFERENT from Google Cloud OAuth settings!**

You need to authorize domains in **TWO places**:
1. ✅ Firebase Console Authorized Domains ← **THIS IS THE ISSUE**
2. ✅ Google Cloud OAuth Client (you already did this)

---

## ⚡ Quick Fix (2 Minutes)

### Step 1: Open Firebase Console

**Direct Link:** https://console.firebase.google.com/project/islanderscricketclub/authentication/settings

Or manually:
1. Go to https://console.firebase.google.com/
2. Click on **islanderscricketclub** project

---

### Step 2: Navigate to Authorized Domains

1. In the left sidebar, click **Authentication** (lock icon)
2. At the top, click the **Settings** tab
3. Scroll down to the **Authorized domains** section

You should see a list like:
```
✅ localhost
✅ islanderscricketclub.firebaseapp.com
❌ cricket-team-management-cotaa1d9h.vercel.app  ← MISSING!
```

---

### Step 3: Add Your Vercel Domain

1. Click the **Add domain** button
2. In the popup, paste exactly:
   ```
   cricket-team-management-cotaa1d9h.vercel.app
   ```
3. Click **Add**

**IMPORTANT:**
- ❌ Do NOT include `https://`
- ❌ Do NOT include trailing `/`
- ✅ Just the domain: `cricket-team-management-cotaa1d9h.vercel.app`

---

### Step 4: Verify It Was Added

After clicking Add, you should see:
```
✅ localhost
✅ islanderscricketclub.firebaseapp.com
✅ cricket-team-management-cotaa1d9h.vercel.app  ← ADDED!
```

---

### Step 5: Test Login (Instant!)

**No waiting needed - Firebase applies changes instantly!**

1. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Select "Cached images and files"
   - Click "Clear data"

2. **Open in incognito window:**
   - https://cricket-team-management-cotaa1d9h.vercel.app/login

3. **Click "Continue with Google"**

4. **Select your Google account**

5. **Should successfully redirect to `/profile`** ✅

---

## ✅ Expected Result

**Before fix:**
```
❌ Firebase: Error (auth/unauthorized-domain)
```

**After fix:**
```
✅ Google sign-in popup opens
✅ Select account
✅ Redirect to /profile
✅ See your name and admin access
```

---

## 🔍 If Still Not Working

### Check Browser Console (F12)

1. Press `F12` to open DevTools
2. Go to **Console** tab
3. Try login again
4. Look for any new errors

### Common Issues:

**Error: "popup_blocked"**
- **Fix:** Allow popups for the site
- Chrome: Click popup icon in address bar → "Always allow"

**Error: "auth/popup-closed-by-user"**
- **Fix:** Don't close the popup manually
- If it closes automatically, there's another underlying error

**Error: Origin not allowed (from Google, not Firebase)**
- **Fix:** You also need to add domains to Google Cloud OAuth client
- See `GOOGLE_AUTH_FIX_GUIDE.md`

---

## 📋 Complete Checklist

For auth to work, you need domains authorized in **3 places**:

### 1. Firebase Authorized Domains ✅
**Location:** Firebase Console → Authentication → Settings
**Domains to add:**
- [x] `localhost`
- [x] `islanderscricketclub.firebaseapp.com`
- [x] `cricket-team-management-cotaa1d9h.vercel.app`

### 2. Google OAuth JavaScript Origins ✅
**Location:** Google Cloud Console → APIs & Services → Credentials → OAuth Client
**Origins to add:**
- [x] `https://islanderscricketclub.firebaseapp.com`
- [x] `https://cricket-team-management-cotaa1d9h.vercel.app`
- [x] `http://localhost`
- [x] `http://localhost:5173`

### 3. Google OAuth Redirect URIs ✅
**Location:** Same as above
**URIs to add:**
- [x] `https://islanderscricketclub.firebaseapp.com/__/auth/handler`
- [x] `https://cricket-team-management-cotaa1d9h.vercel.app/__/auth/handler`
- [x] `http://localhost/__/auth/handler`
- [x] `http://localhost:5173/__/auth/handler`

---

## 🚀 Why This Happens

Every time you deploy to Vercel, you get a **new unique URL**:
- `cricket-team-management-abc123.vercel.app` (old)
- `cricket-team-management-def456.vercel.app` (new)

Each new deployment needs to be added to Firebase authorized domains.

**Solution for the future:**
- Use a custom domain (e.g., `islanders.cricket`)
- Add it once, never worry about it again!

---

## 📸 Visual Guide

### Firebase Console - Where to Click

```
Firebase Console (https://console.firebase.google.com)
└── Select Project: islanderscricketclub
    └── Left Sidebar: Authentication (🔒)
        └── Top Tab: Settings ⚙️
            └── Scroll Down: Authorized domains
                └── Button: Add domain
                    └── Input: cricket-team-management-cotaa1d9h.vercel.app
                        └── Button: Add ✅
```

---

## 🎉 Success!

Once you've added the domain to Firebase authorized domains:
1. ✅ No more `auth/unauthorized-domain` error
2. ✅ Google sign-in popup works
3. ✅ Successful redirect to `/profile`
4. ✅ Full admin access for `akhilreddydanda3@gmail.com`

---

## 📞 Additional Resources

**Firebase Auth Documentation:**
https://firebase.google.com/docs/auth/web/google-signin

**Authorized Domains Info:**
https://firebase.google.com/docs/auth/web/redirect-best-practices

**Direct Link to Settings:**
https://console.firebase.google.com/project/islanderscricketclub/authentication/settings

---

✅ **This fix takes 2 minutes and auth will work immediately!**
