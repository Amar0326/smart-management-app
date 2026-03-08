import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  ExternalLink,
  AlertCircle,
  X,
  Building,
  Flag,
  Clock,
  CheckCircle
} from 'lucide-react';

const UserComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');

  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      toast.error('Please login to view complaint details');
      navigate('/login');
      return;
    }

    fetchComplaintDetails();
  }, [id, currentUser, navigate]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const complaintDoc = doc(db, 'complaints', id);
      const complaintSnapshot = await getDoc(complaintDoc);
      
      if (complaintSnapshot.exists()) {
        const complaintData = { id: complaintSnapshot.id, ...complaintSnapshot.data() };
        
        // Check if this complaint belongs to the current user
        if (complaintData.userId !== currentUser.uid) {
          toast.error('You can only view your own complaints');
          navigate('/user/my-complaints');
          return;
        }
        
        setComplaint(complaintData);
      } else {
        toast.error('Complaint not found');
        navigate('/user/my-complaints');
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
      toast.error('Failed to load complaint details');
      navigate('/user/my-complaints');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp?.toDate?.().toLocaleString() || 'N/A';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-amber-100 text-amber-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setModalImage('');
  };

  if (loading) {
    return (
      <div className="village-bg min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-village-primary"></div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="village-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold village-primary-text mb-2">Complaint Not Found</h2>
          <p className="text-gray-600 mb-4">The complaint you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/user/my-complaints')}
            className="village-button-primary"
          >
            Back to My Complaints
          </button>
        </div>
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
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Complaint Details</h1>
          <p className="text-lg font-light">View complete information about your complaint</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/user/my-complaints')}
              className="village-button-secondary flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Complaints
            </button>
          </div>
          
          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Complaint Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Complaint Card */}
              <div className="village-card overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-village-primary to-village-accent p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold mb-2">{complaint.title}</h1>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      </div>
                    </div>
                    <div className="text-white/80 text-sm">
                      ID: {complaint.id?.slice(-8) || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Department */}
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Building className="h-5 w-5 village-primary-text flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Department</p>
                        <p className="text-gray-900 font-semibold">{complaint.department}</p>
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Flag className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Priority</p>
                        <p className="text-gray-900 font-semibold">{complaint.priority}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <p className="text-gray-900 font-semibold">{complaint.status}</p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 village-primary-text flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Submitted</p>
                        <p className="text-gray-900 font-semibold">{formatDate(complaint.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold village-primary-text mb-3 flex items-center">
                      <span className="w-2 h-2 bg-village-accent rounded-full mr-2"></span>
                      Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{complaint.description}</p>
                  </div>

                  {/* Issue Image */}
                  {complaint.imageUrl && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold village-primary-text mb-3 flex items-center">
                        <span className="w-2 h-2 bg-village-accent rounded-full mr-2"></span>
                        Issue Image
                      </h3>
                      <div 
                        className="relative group cursor-pointer overflow-hidden rounded-lg"
                        onClick={() => openImageModal(complaint.imageUrl)}
                      >
                        <img
                          src={complaint.imageUrl}
                          alt="Complaint Issue"
                          className="w-full h-64 object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <ExternalLink className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resolution Proof */}
                  {complaint.status === "Resolved" && complaint.resolvedProofUrl && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Resolution Proof
                      </h3>
                      <div 
                        className="relative group cursor-pointer overflow-hidden rounded-lg"
                        onClick={() => openImageModal(complaint.resolvedProofUrl)}
                      >
                        <img
                          src={complaint.resolvedProofUrl}
                          alt="Resolution Proof"
                          className="w-full h-64 object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <CheckCircle className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      {complaint.resolvedAt && (
                        <div className="mt-3 text-sm text-green-600 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Resolved on: {formatDate(complaint.resolvedAt)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Timeline & Location */}
            <div className="space-y-6">
              {/* Timeline Card */}
              <div className="village-card">
                <div className="p-6">
                  <h3 className="text-lg font-semibold village-primary-text mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Timeline
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-3 h-3 bg-village-primary rounded-full mt-1 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Created</p>
                        <p className="text-gray-900">{formatDate(complaint.createdAt)}</p>
                      </div>
                    </div>
                    {complaint.updatedAt && (
                      <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 bg-village-accent rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Updated</p>
                          <p className="text-gray-900">{formatDate(complaint.updatedAt)}</p>
                        </div>
                      </div>
                    )}
                    {complaint.resolvedAt && (
                      <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Resolved</p>
                          <p className="text-green-600 font-semibold">{formatDate(complaint.resolvedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Card */}
              {complaint.latitude && complaint.longitude && (
                <div className="village-card">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold village-primary-text mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Location
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">
                          <div className="font-medium">Latitude</div>
                          <div className="font-mono">{complaint.latitude}</div>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">
                          <div className="font-medium">Longitude</div>
                          <div className="font-mono">{complaint.longitude}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => openGoogleMaps(complaint.latitude, complaint.longitude)}
                        className="w-full village-button-primary flex items-center justify-center"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        View on Google Maps
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {imageModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeImageModal}
        >
          <div 
            className="relative max-w-4xl max-h-screen bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full transition-colors duration-200"
            >
              <X className="h-6 w-6 text-gray-600 hover:text-gray-900" />
            </button>
            
            {/* Image */}
            <img
              src={modalImage}
              alt="Full size image"
              className="w-full h-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserComplaintDetails;
