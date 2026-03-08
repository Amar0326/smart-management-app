import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import toast from 'react-hot-toast';
import { Upload, MapPin, Camera, ArrowLeft, Crosshair } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import axios from 'axios';

// Fix for default marker icon in Vite + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const departments = [
  'Road & Transport',
  'Water Supply',
  'Electricity',
  'Drainage & Sewage',
  'Garbage & Sanitation',
  'Street Lights',
  'Public Property Damage',
  'Health & Safety',
  'Environment Issues',
  'Other'
];

const priorities = ['Low', 'Medium', 'High', 'Critical'];

const CreateComplaint = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    priority: 'Medium'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationMode, setLocationMode] = useState('auto');
  const [position, setPosition] = useState(null);
  const [location, setLocation] = useState({ latitude: null, longitude: null });

  // LocationMarker component for manual map selection
  function LocationMarker({ setPosition }) {
    const map = useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });

    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload only PNG or JPEG images');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLocationError('Geolocation not supported');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLocationLoading(false);
        toast.success('Location captured successfully');
      },
      (error) => {
        setLocationLoading(false);
        let errorMessage = 'Failed to get location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting location.';
            break;
        }
        
        setLocationError(errorMessage);
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "complaint_unsigned");
    formData.append("folder", "complaints");

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dvyirxi3w/image/upload",
      formData
    );

    return response.data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!currentUser) {
        toast.error("User not logged in");
        setLoading(false);
        return;
      }

      let latitude = null;
      let longitude = null;

      if (locationMode === "auto") {
        if (!location.latitude || !location.longitude) {
          toast.error("Please click Use Current Location first");
          setLoading(false);
          return;
        }
        latitude = location.latitude;
        longitude = location.longitude;
      }

      if (locationMode === "manual") {
        if (!position || !position.lat || !position.lng) {
          toast.error("Please select a location on the map");
          setLoading(false);
          return;
        }
        latitude = position.lat;
        longitude = position.lng;
      }

      if (!latitude || !longitude) {
        toast.error("Location is required");
        setLoading(false);
        return;
      }

      // Upload image to Cloudinary if selected
      let imageUrl = null;
      if (imageFile) {
        try {
          imageUrl = await uploadImageToCloudinary(imageFile);
          console.log("Cloudinary upload successful:", imageUrl);
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError.response?.data || uploadError);
          toast.error("Failed to upload image. Please try again.");
          setLoading(false);
          return;
        }
      }

      await addDoc(collection(db, "complaints"), {
        title: formData.title,
        description: formData.description,
        department: formData.department,
        priority: formData.priority,
        status: "Pending",
        userId: currentUser.uid,
        userEmail: currentUser.email,
        latitude: Number(latitude),
        longitude: Number(longitude),
        imageUrl: imageUrl, // Save uploaded image URL
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success("Complaint submitted successfully");
      navigate("/user/my-complaints");

    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error submitting complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <button
            onClick={() => navigate('/user')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create Complaint</h1>
          <p className="mt-2 text-gray-600">File a new complaint for any department</p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Complaint Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter complaint title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your complaint in detail"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department */}
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  Department Category *
                </label>
                <select
                  id="department"
                  name="department"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  id="priority"
                  name="priority"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image (Optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <>
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Location Selection */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-blue-900">Location *</h3>
              </div>

              {/* Location Mode Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Location Method
                </label>
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
              </div>

              {/* Auto Location Mode */}
              {locationMode === "auto" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-blue-800">
                      <strong>Current Location:</strong> 
                      {location.latitude && location.longitude ? (
                        <span className="ml-2">
                          {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                        </span>
                      ) : (
                        <span className="ml-2 text-blue-600">Not captured yet</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={locationLoading}
                      className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {locationLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Capturing...
                        </>
                      ) : (
                        <>
                          <Crosshair className="h-4 w-4 mr-2" />
                          Use Current Location
                        </>
                      )}
                    </button>
                  </div>
                  
                  {locationError && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                      {locationError}
                    </div>
                  )}
                  
                  {location.latitude && location.longitude && (
                    <div className="mt-3">
                      <div className="text-sm text-blue-800 mb-2">
                        <strong>Location Preview:</strong>
                      </div>
                      <div className="w-full h-48 rounded overflow-hidden">
                        <iframe
                          src={`https://www.google.com/maps?q=${location.latitude},${location.longitude}&output=embed`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Manual Location Mode */}
              {locationMode === "manual" && (
                <div>
                  <div className="text-sm text-blue-800 mb-3">
                    <strong>Selected Location:</strong> 
                    {position && position.lat && position.lng ? (
                      <span className="ml-2">
                        {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                      </span>
                    ) : (
                      <span className="ml-2 text-blue-600">Click on the map to select location</span>
                    )}
                  </div>
                  
                  <div className="w-full h-64 rounded overflow-hidden border border-gray-300">
                    <MapContainer
                      style={{ height: "256px", width: "100%" }}
                      center={[18.8982945, 73.181443]}
                      zoom={13}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <LocationMarker setPosition={setPosition} />
                      {position && <Marker position={position} />}
                    </MapContainer>
                  </div>
                  
                  {position && position.lat && position.lng && (
                    <div className="mt-3">
                      <div className="text-sm text-blue-800 mb-2">
                        <strong>Location Preview:</strong>
                      </div>
                      <div className="w-full h-48 rounded overflow-hidden">
                        <iframe
                          src={`https://www.google.com/maps?q=${position.lat},${position.lng}&output=embed`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/user')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Submit Complaint'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateComplaint;
