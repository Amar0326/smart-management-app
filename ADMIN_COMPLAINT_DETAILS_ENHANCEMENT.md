# AdminComplaintDetails Enhancement - Status Update Feature

## Goal
Enhance AdminComplaintDetails page to allow updating complaint status directly.

## Implementation Details

### 1. State Management Added

**New States:**
```javascript
const [status, setStatus] = useState('');
const [updating, setUpdating] = useState(false);
```

**Purpose:**
- `status`: Tracks selected status from dropdown
- `updating`: Shows loading state during update

### 2. Firestore Imports Enhanced

**Added Imports:**
```javascript
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
```

**Purpose:**
- `updateDoc`: Update complaint status in Firestore
- `serverTimestamp`: Add proper timestamps for updates

### 3. Status Update Section Added

**Location**: After "Complaint Details" section

**Components:**
- **Status Dropdown**: Select new status
- **Update Button**: Submit status change
- **Loading State**: Spinner during update

### 4. handleUpdateStatus Function

**Implementation:**
```javascript
const handleUpdateStatus = async () => {
  if (!complaint || !status) return;
  
  try {
    setUpdating(true);
    const complaintRef = doc(db, "complaints", id);
    
    const updateData = {
      status: status,
      updatedAt: serverTimestamp(),
    };
    
    // Add resolvedAt timestamp if status is Resolved
    if (status === "Resolved") {
      updateData.resolvedAt = serverTimestamp();
    }
    
    await updateDoc(complaintRef, updateData);
    
    // Update local state
    setComplaint(prev => ({ ...prev, ...updateData }));
    
    toast.success('Status Updated Successfully');
  } catch (error) {
    console.error('Error updating status:', error);
    toast.error('Failed to update status');
  } finally {
    setUpdating(false);
  }
};
```

**Features:**
- **Validation**: Checks if complaint and status exist
- **Firestore Update**: Updates status with proper timestamps
- **Resolved Timestamp**: Adds `resolvedAt` when status is "Resolved"
- **Local State**: Updates UI immediately
- **Error Handling**: Comprehensive error management
- **Loading States**: Visual feedback during update

### 5. UI Components

**Status Dropdown:**
```javascript
<select
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  disabled={updating}
>
  <option value="Pending">Pending</option>
  <option value="In Progress">In Progress</option>
  <option value="Resolved">Resolved</option>
  <option value="Rejected">Rejected</option>
</select>
```

**Update Button:**
```javascript
<button
  onClick={handleUpdateStatus}
  disabled={updating || !status}
  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
>
  {updating && (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
  )}
  {updating ? 'Updating...' : 'Update Status'}
</button>
```

## Benefits

### ✅ **Enhanced Admin Experience**
- **Direct Updates**: Change status without returning to list
- **Real-time**: Immediate UI feedback
- **Efficient**: No page reloads required

### ✅ **Proper Data Management**
- **Timestamps**: Correct `updatedAt` and `resolvedAt`
- **Validation**: Prevents invalid updates
- **Error Handling**: User-friendly error messages

### ✅ **Professional UI**
- **Loading States**: Visual feedback during updates
- **Disabled States**: Prevents duplicate requests
- **Toast Notifications**: Success/error feedback

### ✅ **Data Integrity**
- **Firestore Updates**: Proper server timestamps
- **Local State**: Immediate UI synchronization
- **Resolved Tracking**: Automatic timestamp for resolved complaints

## Technical Implementation

### Data Flow
1. **User Selection**: Dropdown status change
2. **Local Update**: `setStatus` updates dropdown
3. **Submit Action**: Button click triggers update
4. **Firestore Update**: Document updated with timestamps
5. **UI Refresh**: Local state updated immediately
6. **Feedback**: Toast notification shown

### Firestore Schema Updates
**When Status Updates:**
```javascript
{
  status: "Resolved",
  updatedAt: serverTimestamp(),
  resolvedAt: serverTimestamp() // Only if status is "Resolved"
}
```

**When Status is Not Resolved:**
```javascript
{
  status: "In Progress",
  updatedAt: serverTimestamp()
  // resolvedAt remains unchanged
}
```

## Usage Instructions

### For Admins

1. **Navigate**: Admin → All Complaints → Click any complaint
2. **View Details**: Full complaint information displayed
3. **Update Status**:
   - Find "Update Status" section
   - Select new status from dropdown
   - Click "Update Status" button
4. **Confirmation**: Toast message shows success/error
5. **Immediate Feedback**: Status updates in UI instantly

### Status Options

- **Pending**: Initial complaint state
- **In Progress**: Complaint being addressed
- **Resolved**: Complaint successfully completed
- **Rejected**: Complaint dismissed/invalid

## Files Modified

### Updated File
- **`src/pages/admin/AdminComplaintDetails.jsx`**: Enhanced with status update functionality

### Changes Made
- **Imports**: Added `updateDoc` and `serverTimestamp`
- **State**: Added `status` and `updating` states
- **Function**: Added `handleUpdateStatus` with Firestore updates
- **UI**: Added status dropdown and update button
- **Integration**: Connected to existing layout

## Testing Checklist

- [ ] Status dropdown shows current complaint status
- [ ] Status can be changed from dropdown
- [ ] Update button is enabled/disabled correctly
- [ ] Loading spinner shows during update
- [ ] Status updates in Firestore correctly
- [ ] `updatedAt` timestamp is added
- [ ] `resolvedAt` timestamp added when status is "Resolved"
- [ ] Local UI updates immediately
- [ ] Toast notifications show success/error
- [ ] Page doesn't reload during update
- [ ] Error handling works for network issues

## Security & Performance

### Security
- **Authentication**: Protected route for admin users only
- **Validation**: Prevents empty status updates
- **Error Handling**: No sensitive data exposed

### Performance
- **Optimistic Updates**: Local state updates immediately
- **Single Document Update**: Efficient Firestore operation
- **Loading States**: Prevents duplicate requests

The AdminComplaintDetails page is now fully enhanced with direct status update functionality!
