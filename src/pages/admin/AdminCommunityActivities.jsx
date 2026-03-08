import React, { useState, useEffect } from 'react';
import { Heart, Plus, Edit2, Trash2, Search, Calendar, Star, Upload, X } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import toast from 'react-hot-toast';

const AdminCommunityActivities = () => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    beforeImageFile: null,
    afterImageFile: null,
    eventDate: '',
    featured: false
  });
  const [previewUrls, setPreviewUrls] = useState({
    beforeImage: null,
    afterImage: null
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const q = query(collection(db, "community_activities"));
      const querySnapshot = await getDocs(q);
      const activitiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      const sortedActivities = activitiesData.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.eventDate?.toDate() - a.eventDate?.toDate();
      });
      setActivities(sortedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "activities_unsigned");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dvyirxi3w/image/upload",
      { method: "POST", body: formData }
    );

    const data = await response.json();
    if (!data.secure_url) throw new Error("Upload failed");
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please login first');
      return;
    }

    if (!formData.beforeImageFile && !editingActivity?.beforeImageUrl) {
      toast.error('Please select a before image');
      return;
    }

    setSubmitting(true);
    try {
      let beforeImageUrl = editingActivity?.beforeImageUrl || null;
      let afterImageUrl = editingActivity?.afterImageUrl || null;

      // Upload before image if new file selected
      if (formData.beforeImageFile) {
        setUploading(true);
        beforeImageUrl = await uploadToCloudinary(formData.beforeImageFile);
        setUploading(false);
      }

      // Upload after image if new file selected
      if (formData.afterImageFile) {
        setUploading(true);
        afterImageUrl = await uploadToCloudinary(formData.afterImageFile);
        setUploading(false);
      }

      const activityData = {
        title: formData.title,
        beforeImageUrl: beforeImageUrl || null,
        afterImageUrl: afterImageUrl || null,
        eventDate: formData.eventDate ? new Date(formData.eventDate) : null,
        featured: formData.featured,
        likes: editingActivity ? editingActivity.likes : 0,
        likedBy: editingActivity ? editingActivity.likedBy : [],
        createdAt: editingActivity ? editingActivity.createdAt : serverTimestamp()
      };

      if (editingActivity) {
        await updateDoc(doc(db, "community_activities", editingActivity.id), activityData);
        toast.success('Activity updated successfully!');
      } else {
        await addDoc(
          collection(db, "community_activities"),
          activityData
        );
        toast.success('Activity added successfully!');
      }

      setShowModal(false);
      setEditingActivity(null);
      setFormData({
        title: '',
        beforeImageFile: null,
        afterImageFile: null,
        eventDate: '',
        featured: false
      });
      setPreviewUrls({
        beforeImage: null,
        afterImage: null
      });
      fetchActivities();
    } catch (error) {
      console.error('Error saving activity:', error);
      toast.error('Failed to save activity');
      setUploading(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title || '',
      beforeImageFile: null,
      afterImageFile: null,
      eventDate: activity.eventDate ? new Date(activity.eventDate.toDate ? activity.eventDate.toDate() : activity.eventDate).toISOString().split('T')[0] : '',
      featured: activity.featured || false
    });
    setPreviewUrls({
      beforeImage: activity.beforeImageUrl || null,
      afterImage: activity.afterImageUrl || null
    });
    setShowModal(true);
  };

  const handleDelete = async (activityId) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }
    try {
      await deleteDoc(doc(db, "community_activities", activityId));
      toast.success('Activity deleted successfully!');
      fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete activity');
    }
  };

  const toggleFeatured = async (activity) => {
    try {
      await updateDoc(doc(db, "community_activities", activity.id), {
        featured: !activity.featured
      });
      toast.success(`Activity ${!activity.featured ? 'featured' : 'unfeatured'} successfully!`);
      fetchActivities();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Failed to update activity');
    }
  };

  const handleFileChange = (field, file) => {
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
      setPreviewUrls(prev => ({ 
        ...prev, 
        [field === 'beforeImageFile' ? 'beforeImage' : 'afterImage']: URL.createObjectURL(file) 
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: null }));
      setPreviewUrls(prev => ({ 
        ...prev, 
        [field === 'beforeImageFile' ? 'beforeImage' : 'afterImage']: null 
      }));
    }
  };

  const removeImage = (field) => {
    setFormData(prev => ({ ...prev, [field]: null }));
    setPreviewUrls(prev => ({ 
      ...prev, 
      [field === 'beforeImageFile' ? 'beforeImage' : 'afterImage']: null 
    }));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredActivities = activities.filter(activity => 
    activity.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Heart className="h-6 w-6 mr-3 text-white" />
                <h1 className="text-2xl font-bold text-white">Community Activities</h1>
              </div>
              <button
                onClick={() => {
                  setEditingActivity(null);
                  setFormData({
                    title: '',
                    beforeImageFile: null,
                    afterImageFile: null,
                    eventDate: '',
                    featured: false
                  });
                  setPreviewUrls({
                    beforeImage: null,
                    afterImage: null
                  });
                  setShowModal(true);
                }}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Activity
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200">
              {activity.featured && (
                <div className="bg-yellow-500 text-white px-3 py-1 text-center text-sm font-medium">
                  <Star className="inline h-4 w-4 mr-1" />
                  Featured
                </div>
              )}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.title || 'N/A'}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{formatDate(activity.eventDate)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Heart className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{activity.likes || 0} likes</span>
                  </div>
                </div>
                <div className="mb-4">
                  {activity.beforeImageUrl && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1">Before:</p>
                      <img src={activity.beforeImageUrl} alt="Before" className="w-full h-32 object-cover rounded-lg" />
                    </div>
                  )}
                  {activity.afterImageUrl && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">After:</p>
                      <img src={activity.afterImageUrl} alt="After" className="w-full h-32 object-cover rounded-lg" />
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => toggleFeatured(activity)}
                    className={`p-2 rounded-lg transition-colors ${
                      activity.featured ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={activity.featured ? 'Unfeature' : 'Feature'}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(activity)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="bg-white shadow-lg rounded-lg p-12 text-center">
            <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'No activities found matching your search' : 'No activities available'}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm ? 'Try a different search term' : 'Add your first activity to get started'}
            </p>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {editingActivity ? 'Edit Activity' : 'Add New Activity'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Activity title"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Before Image *</label>
                      <div className="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                        {previewUrls.beforeImage ? (
                          <div className="relative">
                            <img src={previewUrls.beforeImage} alt="Before preview" className="h-32 w-full object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => removeImage('beforeImageFile')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-2">
                              <label htmlFor="beforeImage" className="cursor-pointer">
                                <span className="mt-2 block text-sm font-medium text-gray-900">Click to upload</span>
                                <span className="mt-1 block text-xs text-gray-500">PNG, JPG, GIF up to 10MB</span>
                                <input
                                  id="beforeImage"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileChange('beforeImageFile', e.target.files[0])}
                                  className="sr-only"
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">After Image (Optional)</label>
                      <div className="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                        {previewUrls.afterImage ? (
                          <div className="relative">
                            <img src={previewUrls.afterImage} alt="After preview" className="h-32 w-full object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => removeImage('afterImageFile')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-2">
                              <label htmlFor="afterImage" className="cursor-pointer">
                                <span className="mt-2 block text-sm font-medium text-gray-900">Click to upload</span>
                                <span className="mt-1 block text-xs text-gray-500">PNG, JPG, GIF up to 10MB</span>
                                <input
                                  id="afterImage"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileChange('afterImageFile', e.target.files[0])}
                                  className="sr-only"
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">Mark as Featured (shows first)</label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingActivity(null);
                        setPreviewUrls({
                          beforeImage: null,
                          afterImage: null
                        });
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || uploading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {uploading ? 'Uploading...' : (submitting ? 'Saving...' : (editingActivity ? 'Update' : 'Add'))}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCommunityActivities;
