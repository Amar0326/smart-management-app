import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
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

const formatDate = (timestamp) => {
    if (!timestamp) return "No date";
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    }
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    }
    return new Date(timestamp).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const AdminMapView = ({ complaints }) => {
  const navigate = useNavigate();
  const mapRef = useRef();
  const [mapCenter, setMapCenter] = useState([18.9095648, 72.7985481]); // Colaba fallback ,

  console.log(
    "All Coordinates:",
    complaints.map(c => [c.latitude, c.longitude])
  );

  useEffect(() => {
    // Set map center to first complaint with valid coordinates
    if (complaints && complaints.length > 0) {
      const firstComplaint = complaints.find(c => c.latitude && c.longitude);
      if (firstComplaint) {
        setMapCenter([firstComplaint.latitude, firstComplaint.longitude]);
      }
    }
  }, [complaints]);

  // Auto-adjust map bounds to show all markers
  useEffect(() => {
    if (!complaints.length || !mapRef.current) return;

    const validComplaints = complaints.filter(c => c.latitude && c.longitude);
    if (validComplaints.length === 0) return;

    const bounds = validComplaints.map(c => [c.latitude, c.longitude]);
    
    // Add small padding to bounds
    if (bounds.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [complaints]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ef4444'; // red
      case 'Medium': return '#f59e0b'; // amber
      case 'Low': return '#10b981'; // green
      default: return '#6b7280'; // gray
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#fbbf24'; // yellow
      case 'In Progress': return '#3b82f6'; // blue
      case 'Resolved': return '#10b981'; // green
      case 'Rejected': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const createCustomIcon = (priority) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${getPriorityColor(priority)};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">
          📍
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  if (!complaints || complaints.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-gray-500">No complaints to display on map</div>
      </div>
    );
  }

  const validComplaints = complaints.filter(c => c.latitude && c.longitude);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold text-gray-800">
          📍 Complaint Locations ({validComplaints.length} of {complaints.length})
        </h3>
      </div>
      
      <div style={{ height: '600px', width: '100%' }}>
        <MapContainer
          center={mapCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {validComplaints.map((complaint) => (
            <Marker
              key={complaint.id}
              position={[complaint.latitude, complaint.longitude]}
              icon={createCustomIcon(complaint.priority)}
            >
              <Popup>
                <div className="p-3 min-w-[250px]">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {complaint.title}
                  </h4>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Department:</span>
                      <span className="text-gray-600">{complaint.department}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Priority:</span>
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: getPriorityColor(complaint.priority) }}
                      >
                        {complaint.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: getStatusColor(complaint.status) }}
                      >
                        {complaint.status}
                      </span>
                    </div>
                    
                    {complaint.createdAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Date:</span>
                        <span className="text-gray-600">
                          {formatDate(complaint.createdAt)}
                        </span>
                      </div>
                    )}
                    
                    {complaint.description && (
                      <div className="mt-2">
                        <span className="font-medium">Description:</span>
                        <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                          {complaint.description}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-2 border-t">
                    <button
                      onClick={() => navigate(`/admin/complaints/${complaint.id}`)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      View Complaint
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default AdminMapView;
