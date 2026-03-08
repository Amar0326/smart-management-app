import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth, updateProfile } from 'firebase/auth';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Shield, Edit2, Save, X, Camera, Upload } from 'lucide-react';

const Profile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [currentUser]);

  const fetchUserData = async () => {
    if (!currentUser) return;

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setFormData({
          fullName: data.fullName || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      } else {
        // Create user document if it doesn't exist
        const newUserData = {
          email: currentUser.email,
          fullName: currentUser.displayName || '',
          phone: '',
          address: '',
          role: 'user', // Default role
          createdAt: new Date(),
          profilePhoto: currentUser.photoURL || ''
        };
        
        await updateDoc(userDocRef, newUserData);
        setUserData(newUserData);
        setFormData({
          fullName: newUserData.fullName || '',
          phone: newUserData.phone || '',
          address: newUserData.address || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form data to original values
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        phone: userData.phone || '',
        address: userData.address || ''
      });
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      setUploadingImage(true);
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Update Firestore
      await updateDoc(userDocRef, {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        updatedAt: new Date()
      });

      // Update Firebase Auth profile if name changed
      if (formData.fullName !== currentUser.displayName) {
        const auth = getAuth();
        await updateProfile(auth.currentUser, {
          displayName: formData.fullName
        });
      }

      // Update local state
      setUserData(prev => ({
        ...prev,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address
      }));

      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // For now, just use a placeholder. In a real implementation, you'd upload to Cloudinary
    toast.info('Image upload feature coming soon!');
    // TODO: Implement Cloudinary upload for profile photos
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="village-bg min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-village-primary"></div>
      </div>
    );
  }

  return (
    <div className="village-bg min-h-screen">
      {/* Hero Banner */}
      <div className="village-hero-banner">
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">My Profile</h1>
          <p className="text-xl md:text-2xl font-light">Manage your personal information</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Profile Header */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="w-24 h-24 village-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  {userData?.profilePhoto ? (
                    <img 
                      src={userData.profilePhoto} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-white" />
                  )}
                </div>
                {editing && (
                  <label className="absolute bottom-4 right-0 bg-village-accent text-white p-2 rounded-full cursor-pointer hover:bg-village-accent/90 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
              
              {/* Role Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(userData?.role)}`}>
                  <Shield className="h-3 w-3 mr-1" />
                  {userData?.role?.charAt(0).toUpperCase() + userData?.role?.slice(1)}
                </span>
              </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium village-primary-text mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-village-primary focus:border-transparent ${
                      editing 
                        ? 'border-gray-300 bg-white' 
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium village-primary-text mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={currentUser?.email || ''}
                    disabled
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    placeholder="Email address"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium village-primary-text mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-village-primary focus:border-transparent ${
                      editing 
                        ? 'border-gray-300 bg-white' 
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium village-primary-text mb-2">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-start pointer-events-none pt-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!editing}
                    rows={3}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-village-primary focus:border-transparent resize-none ${
                      editing 
                        ? 'border-gray-300 bg-white' 
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                {editing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={uploadingImage}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={uploadingImage}
                      className="flex items-center px-4 py-2 village-button-primary"
                    >
                      {uploadingImage ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="flex items-center px-4 py-2 village-button-primary"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
