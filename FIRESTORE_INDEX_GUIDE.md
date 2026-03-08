# Firestore Composite Index Setup Guide

## Problem
"The query requires an index" error occurs when using `where` + `orderBy` together.

## Solution: Create Composite Index

### Required Index for User Complaints

**Collection**: `complaints`

**Fields**:
1. `userId` → **Ascending** (ASC)
2. `createdAt` → **Descending** (DESC)

**Query Scope**: Collection

### Step-by-Step Index Creation

#### Method 1: From Error Message Link
1. Run the application
2. Look at the browser console error
3. Click the provided Firestore console link
4. Click "Create Index"
5. Wait for index to build (usually 1-5 minutes)

#### Method 2: Manual Creation

1. **Go to Firebase Console**
   - Open [Firebase Console](https://console.firebase.google.com/)
   - Select project: `smart-management-afd9d`
   - Go to **Firestore Database**

2. **Navigate to Indexes**
   - Click **Indexes** tab (or "Composite Indexes")
   - Click **Add Index**

3. **Configure Index**
   ```
   Collection: complaints
   Field 1: userId → Ascending
   Field 2: createdAt → Descending
   Query scope: Collection
   ```

4. **Create Index**
   - Click **Create**
   - Wait for index to build (shows "Building" status)

### Verify Index Creation

1. **Check Status**
   - Index should show "Enabled" when ready
   - Building typically takes 1-5 minutes

2. **Test Application**
   - Refresh your app at `http://localhost:5175`
   - Try loading complaints
   - Should work without index error

## Additional Indexes (Optional)

### For Admin Filtering
If you add filters like department or status, create additional indexes:

```
Collection: complaints
Fields:
- userId → Ascending
- department → Ascending  
- createdAt → Descending
```

```
Collection: complaints
Fields:
- userId → Ascending
- status → Ascending
- createdAt → Descending
```

### For Priority Filtering
```
Collection: complaints
Fields:
- userId → Ascending
- priority → Ascending
- createdAt → Descending
```

## Query Requirements

### ✅ Working Query (Matches Index)
```javascript
const q = query(
  collection(db, "complaints"),
  where("userId", "==", user.uid),
  orderBy("createdAt", "desc")
);
```

### ❌ Queries That Need Additional Indexes

```javascript
// This needs userId + department + createdAt index
where("userId", "==", user.uid)
where("department", "==", "Road & Transport")
orderBy("createdAt", "desc")

// This needs userId + status + createdAt index  
where("userId", "==", user.uid)
where("status", "==", "Pending")
orderBy("createdAt", "desc")
```

## Fallback Logic Implementation

The application now includes automatic fallback:

```javascript
try {
  // Primary query with orderBy (requires index)
  const q = query(
    collection(db, "complaints"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc")
  );
} catch (error) {
  if (error.message.includes("requires an index")) {
    // Fallback query without orderBy (no index needed)
    const fallbackQuery = query(
      collection(db, "complaints"),
      where("userId", "==", user.uid)
    );
  }
}
```

## Production Deployment Checklist

- [ ] Composite index created for userId + createdAt
- [ ] Index status shows "Enabled"
- [ ] Application tested without index errors
- [ ] Fallback logic working as expected
- [ ] Error handling provides user feedback
- [ ] Console logging for debugging

## Troubleshooting

### Index Still Not Working
1. **Double-check field order**: userId (ASC) + createdAt (DESC)
2. **Verify collection name**: Exactly "complaints"
3. **Check field names**: Exactly "userId" and "createdAt"
4. **Wait longer**: Some indexes take up to 10 minutes
5. **Clear cache**: Browser cache + Firebase SDK cache

### Multiple Index Errors
- Create all required indexes one by one
- Test each filter combination separately
- Use fallback logic during development

## Best Practices

1. **Plan indexes ahead**: Create before deploying features
2. **Use fallback logic**: Graceful degradation for users
3. **Monitor console**: Catch index errors early
4. **Test thoroughly**: Verify all query combinations
5. **Document indexes**: Keep track of created indexes
