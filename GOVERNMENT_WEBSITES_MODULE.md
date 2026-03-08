# Government Websites Module - Complete Implementation

## Overview
A comprehensive Government Websites module for React + Firebase app with role-based access, expiry management, and clean responsive design.

## ✅ **1. Firestore Collection Structure**

### Government Websites Collection
```javascript
govt_websites/{websiteId}
{
  name: string,           // Website name
  url: string,            // Website URL
  endDate: timestamp,     // Expiry date (null for no expiry)
  createdAt: timestamp    // Creation timestamp
}
```

### ✅ **Security Rules**
```javascript
// Government Websites collection with role-based permissions
match /govt_websites/{websiteId} {
  // All logged-in users can read websites
  allow read: if request.auth != null;
  
  // Only admin can create, update, delete websites
  allow create: if request.auth.token.role == 'admin';
  allow update: if request.auth.token.role == 'admin';
  allow delete: if request.auth.token.role == 'admin';
}
```

## ✅ **2. AdminGovtWebsites.jsx - Full Admin Interface**

### 🎯 **Features:**
- **Add/Edit/Delete Websites**: Full CRUD operations for admins
- **Search Functionality**: Filter by name or URL
- **Expiry Management**: Set expiry dates or leave as permanent
- **Expired Website Highlighting**: Grey background + EXPIRED badge
- **URL Validation**: Ensures valid URL format
- **Modal Interface**: Clean add/edit modal
- **Responsive Grid Layout**: Modern card-based UI

### 🔧 **Key Functions:**
```javascript
// Add/Edit Website
const handleSubmit = async (e) => {
  // URL validation
  try {
    new URL(formData.url);
  } catch {
    toast.error('Please enter a valid URL (e.g., https://example.com)');
    return;
  }
  
  // Save to Firestore
  const websiteData = {
    ...formData,
    url: formData.url.trim(),
    createdAt: editingWebsite ? editingWebsite.createdAt : serverTimestamp()
  };
};

// Delete Website
const handleDelete = async (websiteId) => {
  if (window.confirm('Are you sure you want to delete this website?')) {
    await deleteDoc(doc(db, "govt_websites", websiteId));
  }
};

// Check if expired
const isExpired = (endDate) => {
  if (!endDate) return false;
  const now = new Date();
  const expiry = endDate.toDate ? endDate.toDate() : new Date(endDate);
  return expiry < now;
};

// Format timestamp safely
const formatDate = (timestamp) => {
  if (!timestamp) return 'No expiry';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Search/Filter
const filteredWebsites = websites.filter(website => 
  website.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  website.url?.toLowerCase().includes(searchTerm.toLowerCase())
);
```

### 🎨 **UI Components:**
- **Header**: Gradient header with "Add Website" button
- **Search Bar**: Real-time search filtering
- **Website Cards**: Expired websites highlighted in grey
- **Action Buttons**: Edit and delete buttons per website
- **Modal Form**: Add/edit website with URL validation

## ✅ **3. UserGovtWebsites.jsx - User Viewing Interface**

### 🎯 **Features:**
- **View Websites**: Read-only access for all logged-in users
- **Search Functionality**: Filter by name or URL
- **Expired Website Highlighting**: Grey background + EXPIRED badge
- **Clickable Links**: Direct links to government websites
- **Safe Rendering**: Handles null/undefined cases
- **Responsive Layout**: Modern card-based UI

### 🔧 **Key Functions:**
```javascript
// Check if expired
const isExpired = (endDate) => {
  if (!endDate) return false;
  const now = new Date();
  const expiry = endDate.toDate ? endDate.toDate() : new Date(endDate);
  return expiry < now;
};

// Format timestamp safely
const formatDate = (timestamp) => {
  if (!timestamp) return 'No expiry';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
```

### 🎨 **UI Components:**
- **Header**: Clean header with globe icon
- **Search Bar**: Real-time search filtering
- **Website Cards**: Expired websites highlighted in grey
- **Clickable Links**: External links with proper attributes
- **Safe Rendering**: Handles missing data gracefully

## ✅ **4. Expiry Management Features**

### 🎨 **Expired Website Highlighting:**
```javascript
// Expired websites get special styling
className={`rounded-lg shadow-lg overflow-hidden border-2 ${
  expired 
    ? 'border-gray-300 bg-gray-100' 
    : 'border-gray-200 bg-white'
}`}
```

### 🎨 **EXPIRED Badge:**
```javascript
{expired && (
  <div className="bg-gray-500 text-white px-3 py-1 text-center text-sm font-medium">
    <AlertCircle className="inline h-4 w-4 mr-1" />
    EXPIRED
  </div>
)}
```

### 🎨 **Safe Date Handling:**
```javascript
// Safe timestamp conversion
const formatDate = (timestamp) => {
  if (!timestamp) return 'No expiry';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Expiry check with safe conversion
const isExpired = (endDate) => {
  if (!endDate) return false;
  const now = new Date();
  const expiry = endDate.toDate ? endDate.toDate() : new Date(endDate);
  return expiry < now;
};
```

## ✅ **5. URL Validation & Link Handling**

### 🔒 **URL Validation:**
```javascript
// Validate URL format
try {
  new URL(formData.url);
} catch {
  toast.error('Please enter a valid URL (e.g., https://example.com)');
  return;
}

// Trim and clean URL
url: formData.url.trim()
```

### 🔗 **Safe Link Rendering:**
```javascript
// Clickable external links
{website.url ? (
  <a 
    href={website.url}
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
  >
    {website.url}
  </a>
) : (
  <span className="text-sm text-gray-500">N/A</span>
)}
```

## ✅ **6. Firebase Integration**

### 📦 **Modular Firebase SDK Usage:**
```javascript
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
```

### 📦 **CRUD Operations:**
```javascript
// Read Websites
const q = query(collection(db, "govt_websites"));
const querySnapshot = await getDocs(q);

// Create Website
await addDoc(collection(db, "govt_websites"), websiteData);

// Update Website
await updateDoc(doc(db, "govt_websites", websiteId), websiteData);

// Delete Website
await deleteDoc(doc(db, "govt_websites", websiteId));
```

## ✅ **7. Navigation Integration**

### 🧭 **AppRoutes.jsx Updates:**
```javascript
// User Routes
<Route path="/user/govt-websites" element={
  <ProtectedRoute requiredRole="user">
    <Layout><UserGovtWebsites /></Layout>
  </ProtectedRoute>
} />

// Admin Routes
<Route path="/admin/govt-websites" element={
  <ProtectedRoute requiredRole="admin">
    <Layout><AdminGovtWebsites /></Layout>
  </ProtectedRoute>
} />
```

### 🧭 **Layout.jsx Navigation:**
```javascript
// User Navigation
{ name: 'Government Websites', href: '/user/govt-websites', icon: Globe }

// Admin Navigation
{ name: 'Government Websites', href: '/admin/govt-websites', icon: Globe }
```

## ✅ **8. Responsive Design**

### 📱 **Grid Layout:**
```javascript
// Responsive grid for website cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### 📱 **Mobile-Friendly:**
- **Responsive Cards**: Stack on mobile, grid on desktop
- **Touch-Friendly Links**: Large tap targets
- **Readable Text**: Proper font sizes and spacing
- **Scrollable Modal**: Works on small screens

## ✅ **9. Search Functionality**

### 🔍 **Real-Time Search:**
```javascript
const filteredWebsites = websites.filter(website => 
  website.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  website.url?.toLowerCase().includes(searchTerm.toLowerCase())
);
```

### 🔍 **Search Features:**
- **Case-Insensitive**: Works with any case
- **Multi-Field**: Searches name and URL
- **Real-Time**: Updates as you type
- **Safe Handling**: Handles null/undefined values

## ✅ **10. Form Features**

### 📝 **Date Input Handling:**
```javascript
// Date input with proper formatting
<input
  type="date"
  value={formData.endDate ? new Date(formData.endDate.toDate ? formData.endDate.toDate() : formData.endDate).toISOString().split('T')[0] : ''}
  onChange={(e) => setFormData({...formData, endDate: e.target.value ? new Date(e.target.value) : null})}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
/>

// Helper text
<p className="text-xs text-gray-500 mt-1">
  Leave empty for no expiry (always active)
</p>
```

### 📝 **URL Input Validation:**
```javascript
// URL input with validation
<input
  type="url"
  required
  value={formData.url}
  onChange={(e) => setFormData({...formData, url: e.target.value})}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  placeholder="https://example.com"
/>
```

## ✅ **11. Display Features**

### 📋 **Information Display:**
```javascript
// Site Name
<h3 className="text-lg font-semibold text-gray-900 mb-2">{website.name || 'N/A'}</h3>

// Clickable Website Link
<div className="flex items-center">
  <ExternalLink className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
  {website.url ? (
    <a href={website.url} target="_blank" rel="noopener noreferrer">
      {website.url}
    </a>
  ) : (
    <span className="text-sm text-gray-500">N/A</span>
  )}
</div>

// Expiry Date
<div className="flex items-center text-sm">
  <Calendar className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
  <span className={`font-medium ${expired ? 'text-gray-500' : 'text-gray-700'}`}>
    {formatDate(website.endDate)}
  </span>
</div>
```

## ✅ **12. Features Summary**

### ✅ **Admin Features:**
- [x] Create new websites
- [x] Edit existing websites
- [x] Delete websites
- [x] Search websites
- [x] Set expiry dates
- [x] URL validation
- [x] Expired website highlighting
- [x] Responsive design

### ✅ **User Features:**
- [x] View all websites
- [x] Search websites
- [x] Clickable website links
- [x] Expired website highlighting
- [x] Expiry date display
- [x] Safe null handling

### ✅ **Security Features:**
- [x] Role-based access control
- [x] Admin-only CRUD operations
- [x] All users can read
- [x] Firebase security rules
- [x] Authentication required

### ✅ **UI/UX Features:**
- [x] Modern card design
- [x] Expired website badges
- [x] Responsive layout
- [x] Loading states
- [x] Error handling
- [x] Toast notifications
- [x] Safe null handling
- [x] External link security

## ✅ **13. Files Created/Modified**

### 📁 **New Files:**
- `src/pages/admin/AdminGovtWebsites.jsx` - Admin interface
- `src/pages/user/UserGovtWebsites.jsx` - User interface

### 📁 **Modified Files:**
- `firestore.rules` - Added govt_websites collection rules
- `src/routes/AppRoutes.jsx` - Added govt websites routes
- `src/components/layout/Layout.jsx` - Added navigation links

## ✅ **14. Usage Instructions**

### 👤 **For Admins:**
1. Navigate to `/admin/govt-websites`
2. Click "Add Website" to create new entries
3. Use search bar to filter websites
4. Click edit/delete buttons to manage websites
5. Set expiry dates or leave empty for permanent entries
6. URLs are validated for proper format

### 👤 **For Users:**
1. Navigate to `/user/govt-websites`
2. View all government websites
3. Use search bar to find specific websites
4. Click on website links to visit them
5. Expired websites are clearly marked
6. Expiry dates show when available

## ✅ **15. Testing Checklist**

### ✅ **Functionality Testing:**
- [x] Admin can create websites
- [x] Admin can edit websites
- [x] Admin can delete websites
- [x] Users can view websites
- [x] Search functionality works
- [x] Expired websites highlighted

### ✅ **Expiry Testing:**
- [x] Expired websites show grey background
- [x] Expired websites show EXPIRED badge
- [x] Active websites show normally
- [x] No expiry websites show as active
- [x] Date formatting works correctly

### ✅ **Link Testing:**
- [x] Website links open in new tabs
- [x] External links have proper security attributes
- [x] URL validation prevents invalid entries
- [x] Safe handling of missing URLs

### ✅ **Security Testing:**
- [x] Non-admin users cannot CRUD
- [x] All authenticated users can read
- [x] Unauthenticated users cannot access
- [x] Firebase rules enforce permissions

## ✅ **16. Expected Results**

### 🎯 **Admin Experience:**
- [x] Full CRUD operations for websites
- [x] Search and filter functionality
- [x] Expiry date management
- [x] URL validation and error handling
- [x] Clear visual feedback for expired sites

### 🎯 **User Experience:**
- [x] Clean view of government websites
- [x] Easy access to website links
- [x] Clear indication of expired sites
- [x] Search functionality for finding sites
- [x] Safe and secure external linking

### 🎯 **System Benefits:**
- [x] Centralized government website management
- [x] Automatic expiry tracking
- [x] Role-based security
- [x] Responsive design for all devices
- [x] Clean, professional interface

The **Government Websites module** is now **fully implemented** with all requested features, expiry management, security, and modern UI design! 🌐✨
