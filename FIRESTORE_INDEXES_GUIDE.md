# Firestore Indexes Setup Guide

This guide will help you create all required Firestore indexes for the Islanders Cricket Club application.

## Why Do You Need Indexes?

Firestore requires composite indexes when queries combine:
- `.where()` with `.orderBy()` on different fields
- Multiple `.where()` clauses on different fields
- `array-contains` with `.orderBy()`

Without these indexes, you'll see errors like:
```
FirebaseError: The query requires an index.
```

---

## 📋 Required Indexes (14 Total)

### Request Collections (10 indexes)

All request collections follow the same pattern with 2 indexes each:

| Collection | Index 1 | Index 2 |
|------------|---------|---------|
| **playerUpdateRequests** | `requesterId` ↑ + `createdAt` ↓ | `status` ↑ + `createdAt` ↓ |
| **matchRequests** | `requesterId` ↑ + `createdAt` ↓ | `status` ↑ + `createdAt` ↓ |
| **practiceRequests** | `requesterId` ↑ + `createdAt` ↓ | `status` ↑ + `createdAt` ↓ |
| **equipmentRequests** | `requesterId` ↑ + `createdAt` ↓ | `status` ↑ + `createdAt` ↓ |
| **expenseRequests** | `requesterId` ↑ + `createdAt` ↓ | `status` ↑ + `createdAt` ↓ |

### Other Collections (4 indexes)

| Collection | Fields | Purpose |
|------------|--------|---------|
| **conversations** | `participants` (array-contains) + `updatedAt` ↓ | User's conversation list |
| **players** | `email` ↑ + `isClaimed` ↑ | Find unclaimed player profiles |
| **matches** | `status` ↑ + `date` ↑ | Upcoming scheduled matches |

**Legend:** ↑ = Ascending, ↓ = Descending

---

## 🚀 Option 1: Deploy All Indexes at Once (RECOMMENDED)

### Prerequisites:
1. Firebase CLI installed: `npm install -g firebase-tools`
2. Logged in to Firebase: `firebase login`
3. Firebase project initialized in this directory

### Steps:

1. **Initialize Firebase (if not already done):**
   ```bash
   firebase init firestore
   ```
   - Select your project: `islanderscricketclub`
   - Use default firestore rules file
   - Use default indexes file (we'll overwrite it)

2. **Deploy the indexes:**
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. **Wait for deployment:**
   - This will create all 14 indexes
   - Takes 2-5 minutes per index
   - You'll see progress in the console

4. **Verify in Firebase Console:**
   https://console.firebase.google.com/project/islanderscricketclub/firestore/indexes

---

## 🖱️ Option 2: Create Indexes Manually

If you prefer to create indexes one-by-one in the Firebase Console:

### Method A: Use Auto-Generated Links

1. **Run your application**
2. **Trigger the query** that needs an index
3. **Copy the error link** from the console
4. **Click the link** - Firebase will open with the index pre-configured
5. **Click "Create Index"**
6. **Repeat** for each error you encounter

### Method B: Create Manually in Console

1. **Go to Firebase Console:**
   https://console.firebase.google.com/project/islanderscricketclub/firestore/indexes

2. **Click "Create Index"**

3. **For each index, enter:**

   **Example: playerUpdateRequests - Index 1**
   ```
   Collection ID: playerUpdateRequests

   Fields to index:
   - Field: playerId
     Order: Ascending

   - Field: createdAt
     Order: Descending

   Query scope: Collection
   ```

4. **Click "Create"**

5. **Repeat** for all 14 indexes (see table above)

---

## 🔍 How to Check If Indexes Are Ready

### In Firebase Console:
1. Go to: https://console.firebase.google.com/project/islanderscricketclub/firestore/indexes
2. Look at the "Status" column:
   - ✅ **Enabled** = Index is ready to use
   - ⏳ **Building** = Index is being created (wait 2-5 minutes)
   - ❌ **Error** = Something went wrong (check configuration)

### In Your Application:
- If you see "index required" errors, that index isn't created yet
- Once all indexes are enabled, errors will disappear
- App features will work normally

---

## 🎯 Quick Deployment Commands

```bash
# Login to Firebase
firebase login

# Initialize Firestore (if needed)
firebase init firestore

# Deploy indexes only
firebase deploy --only firestore:indexes

# Check deployment status
firebase firestore:indexes

# Deploy everything (indexes + rules)
firebase deploy --only firestore
```

---

## 📊 Index Status Checklist

Use this to track which indexes you've created:

### Request Collections:
- [ ] playerUpdateRequests - requesterId + createdAt
- [ ] playerUpdateRequests - status + createdAt
- [ ] matchRequests - requesterId + createdAt
- [ ] matchRequests - status + createdAt
- [ ] practiceRequests - requesterId + createdAt
- [ ] practiceRequests - status + createdAt
- [ ] equipmentRequests - requesterId + createdAt
- [ ] equipmentRequests - status + createdAt
- [ ] expenseRequests - requesterId + createdAt
- [ ] expenseRequests - status + createdAt

### Other Collections:
- [ ] conversations - participants (array) + updatedAt
- [ ] players - email + isClaimed
- [ ] matches - status + date

---

## 🐛 Troubleshooting

### "Index already exists"
- This means the index is already created
- Check Firebase Console to verify it's **Enabled**, not just **Building**

### "Permission denied"
- Make sure you're logged in: `firebase login`
- Verify you have owner/editor role on the Firebase project

### "Collection not found"
- The collection will be created automatically when you first write data to it
- Indexes can be created before the collection exists

### Indexes still building after 10+ minutes
- This is normal for large datasets
- Check Firebase Console for status
- If "Error" status, delete and recreate the index

---

## 📝 Notes

- **Indexes are free** for most use cases (Google provides generous free tier)
- **Indexes persist** - you only need to create them once
- **Production vs Development** - Indexes work across all environments
- **Backup** - Keep `firestore.indexes.json` in version control

---

## 🆘 Need Help?

1. Check Firebase Console for error messages
2. Review the query causing the error in your code
3. Verify index field names match your query exactly
4. Contact: canderson@hssmedicine.com

---

**Generated for:** Islanders Cricket Club
**Firebase Project:** islanderscricketclub
**Last Updated:** 2025-10-21
