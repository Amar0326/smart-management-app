import React, { useState, useEffect } from 'react';
import { Heart, Search, Calendar, Star, X, ZoomIn, Camera } from 'lucide-react';
import { collection, query, getDocs, doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import toast from 'react-hot-toast';

const UserCommunityActivities = () => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

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
      // Sort by featured first, then by event date
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

  const handleLike = async (activity) => {
    if (!currentUser) {
      toast.error('Please login to like activities');
      return;
    }

    try {
      const activityRef = doc(db, "community_activities", activity.id);
      
      if (activity.likedBy?.includes(currentUser.uid)) {
        // Unlike
        await updateDoc(activityRef, {
          likes: increment(-1),
          likedBy: activity.likedBy.filter(uid => uid !== currentUser.uid)
        });
        toast.success('Activity unliked');
      } else {
        // Like
        await updateDoc(activityRef, {
          likes: increment(1),
          likedBy: arrayUnion(currentUser.uid)
        });
        toast.success('Activity liked');
      }
      
      fetchActivities();
    } catch (error) {
      console.error('Error liking activity:', error);
      toast.error('Failed to update activity');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="village-bg min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-village-primary"></div>
      </div>
    );
  }

  return (
    <div className="village-bg min-h-screen">
      {/* Header */}
      <div className="village-hero-banner">
        <div className="text-center px-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Camera className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Community Activities</h1>
          <p className="text-lg font-light">Celebrating village life and achievements</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-village-primary focus:border-transparent"
              />
            </div>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="village-card p-12 text-center">
              <div className="w-16 h-16 village-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold village-primary-text mb-2">No activities found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'No community activities have been shared yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="village-card overflow-hidden">
                  {/* Featured Badge */}
                  {activity.featured && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="village-accent px-3 py-1 rounded-full flex items-center">
                        <Star className="h-3 w-3 text-white mr-1" />
                        <span className="text-white text-xs font-medium">Featured</span>
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  <div className="relative h-48 bg-gray-100">
                    {activity.beforeImageUrl && (
                      <img
                        src={activity.beforeImageUrl}
                        alt="Before"
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setSelectedImage(activity.beforeImageUrl)}
                      />
                    )}
                    {activity.afterImageUrl && (
                      <div className="absolute bottom-2 right-2">
                        <button
                          onClick={() => setSelectedImage(activity.afterImageUrl)}
                          className="village-button-secondary p-2 rounded-full"
                        >
                          <ZoomIn className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold village-primary-text mb-2">
                      {activity.title}
                    </h3>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(activity.eventDate)}
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleLike(activity)}
                        disabled={!currentUser}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                          activity.likedBy?.includes(currentUser?.uid)
                            ? 'village-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } ${!currentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Heart className={`h-4 w-4 ${activity.likedBy?.includes(currentUser?.uid) ? 'fill-current' : ''}`} />
                        <span className="text-sm font-medium">{activity.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Activity"
              className="max-w-full max-h-full rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 village-button-secondary p-2 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCommunityActivities;
