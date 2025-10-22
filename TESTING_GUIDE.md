# 🧪 Complete Testing Guide - Islanders Cricket Club

## Server Information
- **URL**: http://localhost:6001
- **Admin Email**: akhilreddydanda3@gmail.com
- **Browser**: Chrome/Edge (F12 for Developer Tools)

## Test Checklist

### ✅ TEST 1: Admin Login & Dashboard (2 min)
1. Open http://localhost:6001
2. Click "Player Login" → "Sign in with Google"
3. Select akhilreddydanda3@gmail.com
4. Verify redirect to `/admin` dashboard
5. Check dashboard shows all stats
6. Check no console errors

**Expected**: Admin dashboard loads successfully

---

### ✅ TEST 2: Add a Player (3 min)
1. Admin dashboard → "Manage Players"
2. Click "Add Player"
3. Fill form: Name, Role, Position, Stats
4. Click "Save Player"
5. Verify success toast
6. Check player in list
7. Check player on Squad page

**Expected**: Player saves and appears everywhere

---

### ✅ TEST 3: Add a Match (2 min)
1. Admin dashboard → "View Matches"
2. Click "Add Match"
3. Fill: Date, Time, Opponent, Location
4. Click "Create Match"
5. Verify match in upcoming matches

**Expected**: Match scheduled successfully

---

### ✅ TEST 4: Add an Expense (2 min)
1. Admin dashboard → "View Budget"
2. Note current "Total Spent"
3. Click "Add Expense"
4. Fill: Date, Category, Amount, Description
5. Verify budget increases

**Expected**: Expense saved and budget updated

---

### ✅ TEST 5: Squad Page (1 min)
1. Go to Squad page
2. Verify all players display
3. Check player cards show correct info

**Expected**: Clean roster display

---

### ✅ TEST 6: Profile Claiming (3 min)
1. Open incognito window
2. Login with different Google account
3. Should redirect to claim-profile
4. Click on available player
5. Claim profile
6. Access player dashboard

**Expected**: Player claims profile successfully

---

### ✅ TEST 7: Request Approval (2 min)
1. Admin → "Review Requests"
2. Check pending requests
3. Approve a request
4. Verify it moves to processed

**Expected**: Approval workflow works

---

### ✅ TEST 8: Edit Player (2 min)
1. Admin → Players → Edit
2. Change some fields
3. Save changes
4. Verify changes persisted

**Expected**: Edit saves correctly

---

### ✅ TEST 9: Firebase Verification (3 min)
1. Open Firebase Console
2. Check players collection
3. Check matches collection
4. Check expenses collection
5. Verify all data exists

**Expected**: Data in Firebase

---

### ✅ TEST 10: Delete Player (1 min)
1. Admin → Players → Delete
2. Confirm deletion
3. Verify player removed everywhere

**Expected**: Complete deletion

---

## Test Results

| Test | Status | Notes |
|------|--------|-------|
| 1. Admin Login | ⬜ | |
| 2. Add Player | ⬜ | |
| 3. Add Match | ⬜ | |
| 4. Add Expense | ⬜ | |
| 5. Squad Page | ⬜ | |
| 6. Profile Claiming | ⬜ | |
| 7. Request Approval | ⬜ | |
| 8. Edit Player | ⬜ | |
| 9. Firebase Check | ⬜ | |
| 10. Delete Player | ⬜ | |

**Total Time**: ~20 minutes

---

## Common Issues

### Permission Denied
- Check Firebase rules allow authenticated writes

### Player Not Showing
- Verify `isActive: true` is set

### Can't Login
- Check Google provider enabled in Firebase Auth

---

## Next: AI Photo Analysis Feature
See implementation in player dashboard!
