# User Complaint Form Enhancement - Dual Location Support

## Goal
Enhance User Complaint Form to support both automatic GPS location and manual location selection using map pin.

## Implementation Details

### 1. Enhanced Imports

**Added Leaflet Components:**
```javascript
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icon in Vite + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
```

### 2. New State Management

**Location Mode State:**
```javascript
const [locationMode, setLocationMode] = useState('auto');
const [position, setPosition] = useState(null);
const [location, setLocation] = useState({ latitude: null, longitude: null });
```

**Purpose:**
- `locationMode`: Tracks selected location method ('auto' or 'manual')
- `position`: Stores manually selected map coordinates
- `location`: Stores GPS captured coordinates

### 3. Location Mode Selection UI

**Radio Button Selection:**
```javascript
<div className="flex space-x-6">
  <label className="flex items-center">
    <input
      type="radio"
      value="auto"
      checked={locationMode === "auto"}
      onChange={() => setLocationMode("auto")}
      className="mr-2"
    />
    <span className="text-sm text-gray-700">Use Current Location</span>
  </label>
  <label className="flex items-center">
    <input
      type="radio"
      value="manual"
      checked={locationMode === "manual"}
      onChange={() => setLocationMode("manual")}
      className="mr-2"
    />
    <span className="text-sm text-gray-700">Select on Map</span>
  </label>
</div>
```

### 4. Auto Location Mode (Existing)

**Features:**
- **GPS Capture**: Uses browser geolocation API
- **Loading State**: Shows spinner during capture
- **Error Handling**: Comprehensive error messages
- **Preview**: Google Maps iframe preview

**UI Components:**
- Current location display
- "Use Current Location" button
- Location preview iframe
- Error messages

### 5. Manual Location Mode (New)

**Interactive Map:**
```javascript
<MapContainer
  style={{ height: "256px", width: "100%" }}
  center={[18.8982945, 73.181443]}
  zoom={13}
  onClick={handleMapClick}
>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  />
  {position && <Marker position={[position.lat, position.lng]} />}
</MapContainer>
```

**Features:**
- **Click to Select**: Click anywhere on map to set location
- **Visual Feedback**: Marker appears at selected location
- **Coordinate Display**: Shows selected coordinates
- **Preview**: Google Maps iframe preview

### 6. Map Click Handler

**Location Selection:**
```javascript
const handleMapClick = (e) => {
  setPosition(e.latlng);
  toast.success('Location selected on map');
};
```

**Functionality:**
- Captures click coordinates
- Updates position state
- Shows success notification

### 7. Enhanced Form Validation

**Mode-Based Validation:**
```javascript
// Validate location based on mode
let latitude, longitude;

if (locationMode === 'auto') {
  if (!location.latitude || !location.longitude) {
    toast.error('Please capture your current location before submitting');
    return;
  }
  latitude = location.latitude;
  longitude = location.longitude;
} else {
  if (!position || !position.lat || !position.lng) {
    toast.error('Please select a location on the map before submitting');
    return;
  }
  latitude = position.lat;
  longitude = position.lng;
}
```

**Validation Logic:**
- **Auto Mode**: Checks GPS coordinates captured
- **Manual Mode**: Checks map pin selected
- **Error Messages**: Specific to each mode
- **Data Extraction**: Uses appropriate coordinates

## Benefits

### ✅ **Enhanced User Experience**
- **Choice**: Users can select preferred location method
- **Flexibility**: GPS or manual selection
- **Accessibility**: Works even when GPS unavailable
- **Precision**: Manual selection for exact locations

### ✅ **Improved Functionality**
- **Interactive Map**: Click to select precise location
- **Visual Feedback**: Real-time marker placement
- **Coordinate Display**: Shows exact coordinates
- **Preview**: Both modes show location preview

### ✅ **Robust Validation**
- **Mode-Specific**: Different validation for each mode
- **Clear Errors**: Specific error messages
- **Prevention**: Stops submission without location
- **User Guidance**: Clear instructions

### ✅ **Professional UI**
- **Radio Selection**: Clear mode choice
- **Conditional Rendering**: Shows appropriate UI
- **Consistent Design**: Matches existing form style
- **Responsive**: Works on all screen sizes

## Technical Implementation

### Data Flow
1. **Mode Selection**: User chooses location method
2. **Auto Mode**: GPS capture → location state
3. **Manual Mode**: Map click → position state
4. **Validation**: Mode-specific validation
5. **Submission**: Uses appropriate coordinates

### State Management
```javascript
// Auto mode uses location state
const [location, setLocation] = useState({ latitude: null, longitude: null });

// Manual mode uses position state
const [position, setPosition] = useState(null);

// Mode tracking
const [locationMode, setLocationMode] = useState('auto');
```

### Coordinate Handling
```javascript
// Auto mode coordinates
latitude = location.latitude;
longitude = location.longitude;

// Manual mode coordinates
latitude = position.lat;
longitude = position.lng;
```

## Usage Instructions

### For Users

1. **Fill Form**: Complete title, description, department
2. **Select Location Method**:
   - **Use Current Location**: Click GPS button
   - **Select on Map**: Click on map to place pin
3. **Verify Location**: Check preview and coordinates
4. **Submit**: Complete complaint submission

### Location Methods

**Automatic GPS:**
- Click "Use Current Location" button
- Allow browser location permission
- Coordinates captured automatically
- Preview shows GPS location

**Manual Map Selection:**
- Click anywhere on the map
- Marker appears at clicked location
- Coordinates show selection
- Preview shows selected location

## Files Modified

### Updated File
- **`src/pages/user/CreateComplaint.jsx`**: Enhanced with dual location support

### Changes Made
- **Imports**: Added Leaflet components and icons
- **State**: Added locationMode and position states
- **UI**: Added mode selection and manual map
- **Validation**: Enhanced for mode-specific validation
- **Handlers**: Added map click handler

## Testing Checklist

- [ ] Radio buttons switch between modes correctly
- [ ] Auto mode captures GPS location
- [ ] Manual mode shows interactive map
- [ ] Map click places marker correctly
- [ ] Coordinates display for both modes
- [ ] Location preview works for both modes
- [ ] Form validation works for both modes
- [ ] Error messages show correctly
- [ ] Form submission works with both modes
- [ ] Responsive design works on mobile

## Troubleshooting

### Common Issues

**GPS Not Working:**
- Check browser location permission
- Ensure HTTPS (required for geolocation)
- Try refreshing the page

**Map Not Loading:**
- Check internet connection
- Verify Leaflet imports
- Check console for errors

**Marker Not Appearing:**
- Ensure position state is set
- Check Leaflet icon configuration
- Verify map click handler

**Validation Errors:**
- Check coordinate values in state
- Verify mode selection
- Check validation logic

## Future Enhancements

### Potential Improvements
1. **Search Functionality**: Address search on map
2. **Current Location Button**: In manual mode too
3. **Location History**: Save frequently used locations
4. **Drawing Tools**: Area selection for large complaints
5. **Geocoding**: Convert addresses to coordinates

The User Complaint Form now supports both automatic GPS and manual map selection!
