# Firebase Authorized Domains - Verification Guide

**Issue:** Still getting `Firebase: Error (auth/unauthorized-domain)` after adding domain
**This means:** The domain was NOT added correctly to Firebase

---

## ✅ Step-by-Step Verification

### Step 1: Open Firebase Console (Correct Page)

**Direct Link:** https://console.firebase.google.com/project/islanderscricketclub/authentication/settings

You should see:
```
Firebase Console
└── Project: islanderscricketclub (verify this in top-left!)
    └── Authentication (left sidebar)
        └── Settings (tab at top)
            └── Scroll down to: Authorized domains
```

---

### Step 2: Check What's Currently Listed

In the **Authorized domains** section, you should see a table like this:

```
Domain                                          Status
───────────────────────────────────────────────────────
localhost                                       ✓ Active
islanderscricketclub.firebaseapp.com           ✓ Active
cricket-team-management-cotaa1d9h.vercel.app   ✓ Active  ← MUST BE HERE!
```

**If you DON'T see** `cricket-team-management-cotaa1d9h.vercel.app` **→ It wasn't added!**

---

### Step 3: Add Domain (Correct Format)

1. Click **"Add domain"** button

2. In the popup input field, type EXACTLY:
   ```
   cricket-team-management-cotaa1d9h.vercel.app
   ```

**CRITICAL - Common Mistakes:**

❌ **WRONG:** `https://cricket-team-management-cotaa1d9h.vercel.app`
❌ **WRONG:** `http://cricket-team-management-cotaa1d9h.vercel.app`
❌ **WRONG:** `cricket-team-management-cotaa1d9h.vercel.app/`
❌ **WRONG:** `www.cricket-team-management-cotaa1d9h.vercel.app`

✅ **CORRECT:** `cricket-team-management-cotaa1d9h.vercel.app`

**Copy this exact text:**
```
cricket-team-management-cotaa1d9h.vercel.app
```

3. Click **"Add"** button

4. Verify it appears in the list

---

### Step 4: Verify It Saved Correctly

After clicking "Add", refresh the page and check:

The domain should appear in the list WITHOUT any of these:
- No `https://` prefix
- No `http://` prefix
- No `/` at the end
- No `www.` at the start

**Correct display:**
```
cricket-team-management-cotaa1d9h.vercel.app   ✓ Active
```

---

### Step 5: Test Immediately

**No waiting needed for Firebase changes!**

1. **Clear browser cache:**
   ```
   Ctrl + Shift + Delete
   → Select "All time"
   → Check "Cached images and files"
   → Click "Clear data"
   ```

2. **Open in NEW incognito window:**
   ```
   Ctrl + Shift + N
   → Go to: https://cricket-team-management-cotaa1d9h.vercel.app/login
   ```

3. **Open browser console (keep it open):**
   ```
   Press F12
   → Go to "Console" tab
   ```

4. **Try login:**
   - Click "Continue with Google"
   - Watch the console for errors

---

## 🔍 Advanced Debugging

### Check Browser Console Error Details

When you see the error, it might show more details:

```javascript
Firebase: Error (auth/unauthorized-domain).
This domain (cricket-team-management-cotaa1d9h.vercel.app) is not authorized
to run this operation. Add it to the OAuth redirect domains list in the
Firebase console -> Auth section -> Sign in method tab.
```

**If you see a DIFFERENT domain in the error** → You're testing the wrong URL!

---

### Verify You're Testing the Right URL

1. **Check your browser address bar** - should show:
   ```
   https://cricket-team-management-cotaa1d9h.vercel.app/login
   ```

2. **NOT** any of these old deployments:
   ```
   ❌ https://cricket-team-management-b8eiy6jj5.vercel.app
   ❌ https://cricket-team-management-k6bjyqlwr.vercel.app
   ❌ https://cricket-team-management-ppzv72aia.vercel.app
   ```

3. **The deployment URL changes with every deploy!**
   - Latest: `cricket-team-management-cotaa1d9h.vercel.app`
   - Use this one!

---

### Check Firebase Project Name

Make absolutely sure you're in the RIGHT project:

1. Top-left of Firebase Console should show:
   ```
   🔥 islanderscricketclub
   ```

2. **NOT** any other project like:
   - ❌ My First Project
   - ❌ Test Project
   - ❌ Personal Project

---

## 🐛 Still Not Working? Checklist

Go through this checklist systematically:

- [ ] I'm in the correct Firebase project: **islanderscricketclub**
- [ ] I'm on the Authentication → Settings page
- [ ] I scrolled down to "Authorized domains" section
- [ ] I clicked "Add domain" button
- [ ] I typed EXACTLY: `cricket-team-management-cotaa1d9h.vercel.app`
- [ ] I did NOT include `https://`
- [ ] I did NOT include a trailing `/`
- [ ] I clicked "Add" and saw it appear in the list
- [ ] I refreshed the page and it's still there
- [ ] I cleared ALL browser cache
- [ ] I'm testing in incognito window
- [ ] I'm going to the correct URL: `https://cricket-team-management-cotaa1d9h.vercel.app/login`
- [ ] I have F12 console open to see exact error

---

## 📸 Screenshot Verification

### What to Screenshot:

1. **Firebase Authorized Domains List**
   - Shows all 3 domains including the new one
   - Path: Firebase Console → Authentication → Settings → Authorized domains

2. **Browser Address Bar**
   - Shows you're at: `cricket-team-management-cotaa1d9h.vercel.app/login`

3. **Browser Console Error**
   - F12 → Console tab → Full error message

**Send these 3 screenshots if still not working!**

---

## 💡 Pro Tip: Use Custom Domain

To avoid this every deployment:

1. **Buy a domain:** (e.g., `islanderscricket.com`)
2. **Add to Vercel:** Project Settings → Domains
3. **Add to Firebase:** Just once!
4. **Never worry again:** Every deployment uses same domain

---

## ✅ Expected Success

When domain is CORRECTLY added:

1. **Firebase Console** shows:
   ```
   cricket-team-management-cotaa1d9h.vercel.app   ✓ Active
   ```

2. **Login page** works:
   - Google popup opens
   - Select account
   - Redirect to `/profile`
   - No errors in console

3. **Console shows:**
   ```javascript
   Firebase: Successfully signed in
   User loaded: {uid: "...", email: "akhilreddydanda3@gmail.com"}
   ```

---

## 🆘 If This Guide Doesn't Work

**You'll need to provide:**

1. Screenshot of Firebase Authorized Domains list
2. Screenshot of browser address bar
3. Full error from browser console (F12)
4. Confirm: Which project in Firebase Console (top-left name)?

**Then I can diagnose the exact issue!**

---

✅ **The domain MUST be in Firebase authorized domains for auth to work!**
