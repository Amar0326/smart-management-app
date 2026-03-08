# Complaint Fetching Issues - Troubleshooting Guide

## Problem
"Failed to fetch complaints" error when trying to load user complaints.

## Solutions Implemented

### 1. ✅ User Validation Fixed
- Added `if (!currentUser) return;` check before fetching
- Wrapped in `useEffect` with `[currentUser]` dependency
- Prevents API calls when user is not authenticated

### 2. ✅ Correct Firestore Query
```javascript
const q = query(
  collection(db, "complaints"),
  where("userId", "==", user.uid),
  orderBy("createdAt", "desc")
);
```
- Uses `user.uid` (not `user.id`)
- Proper composite query with where + orderBy

### 3. ✅ Enhanced Error Handling
```javascript
catch (error) {
  console.error("Error fetching complaints:", error.message);
  toast.error('Unable to load complaints');
}
```
- Detailed console logging
- User-friendly toast message

### 4. ✅ Firestore Security Rules Updated
```javascript
match /complaints/{complaintId} {
  allow read: if request.auth != null &&
    (resource.data.userId == request.auth.uid ||
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
}
```
- Users can read their own complaints
- Admins can read all complaints

### 5. ✅ Complaint Creation Uses Correct User ID
```javascript
const complaintData = {
  userId: currentUser.uid,  // ✅ Correct: uses uid
  userEmail: currentUser.email,
  ...formData
};
```

### 6. ✅ Index Requirements
- Added comment about Firestore composite index requirement
- If "requires index" error appears, create index from Firebase console link

### 7. ✅ Loading States
- Proper loading spinner before fetch
- Loading state cleared after fetch completes
- Error state handled properly

## Additional Troubleshooting Steps

### Step 1: Check Firebase Authentication
1. Go to Firebase Console → Authentication
2. Verify user exists in Users tab
3. Check user has correct `role` field in Firestore

### Step 2: Verify Firestore Rules
1. Go to Firebase Console → Firestore → Rules
2. Deploy the updated rules from `firestore.rules`
3. Wait 1-2 minutes for rules to propagate

### Step 3: Check Network Connection
1. Open browser DevTools → Network tab
2. Check for failed Firestore requests
3. Verify internet connectivity

### Step 4: Clear Browser Cache
1. Clear browser cache and localStorage
2. Refresh the application
3. Try logging out and back in

### Step 5: Check Console for Specific Errors
1. Open browser DevTools → Console
2. Look for specific error messages
3. Check for Firebase SDK errors

## Common Error Messages & Solutions

### "Missing or insufficient permissions"
- **Cause**: Firestore rules not deployed correctly
- **Solution**: Deploy updated security rules

### "The query requires an index"
- **Cause**: Composite query needs index
- **Solution**: Click the link in error message to create index

### "User is not authenticated"
- **Cause**: Auth state not properly loaded
- **Solution**: Wait for auth to load before making requests

### "Network error"
- **Cause**: Connection issues
- **Solution**: Check internet connection and Firebase status

## Production Deployment Notes

1. **Environment Variables**: Ensure `.env` has correct Firebase config
2. **Firebase Project**: Verify correct project ID and API keys
3. **Domain Whitelist**: Add production domain to Firebase Auth domains
4. **Firestore Rules**: Deploy production-ready security rules

## Testing Checklist

- [ ] User is logged in and `currentUser` exists
- [ ] `currentUser.uid` is available
- [ ] Firestore rules are deployed
- [ ] Network requests are successful
- [ ] No console errors
- [ ] Loading states work correctly
- [ ] Error messages are user-friendly

## Support

If issues persist:
1. Check browser console for specific error details
2. Verify Firebase project configuration
3. Ensure all dependencies are installed
4. Test with different user accounts
