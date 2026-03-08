import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp, deleteField } from 'firebase/firestore';
import { db } from '../../services/firebase';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  MapPin, 
  ExternalLink,
  AlertCircle,
  X,
  Building,
  Flag,
  Clock,
  CheckCircle,
  FileText
} from 'lucide-react';

const AdminComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const complaintDoc = doc(db, 'complaints', id);
      const complaintSnapshot = await getDoc(complaintDoc);
      
      if (complaintSnapshot.exists()) {
        const complaintData = { id: complaintSnapshot.id, ...complaintSnapshot.data() };
        setComplaint(complaintData);
        setStatus(complaintData.status || '');
      } else {
        toast.error('Complaint not found');
        navigate('/admin/complaints');
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
      toast.error('Failed to load complaint details');
      navigate('/admin/complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleProofUpload = (e) => {
  setProofFile(e.target.files[0]);
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

  const handleUpdateStatus = async () => {
    if (!complaint || !status) return;
    
    setUpdating(true);
    
    // Add safety check for admin authentication
    if (!currentUser) {
      toast.error("Admin not authenticated");
      setUpdating(false);
      return;
    }
    
    try {
      const complaintRef = doc(db, "complaints", id);
      
      let updateData = {
        status: status,
        updatedAt: serverTimestamp(),
      };

      // CASE 1: Setting to Resolved - Require proof
      if (status === "Resolved") {
        if (!proofFile && !complaint.proofImageURL && !complaint.resolvedProofUrl) {
          toast.error("Proof image required before resolving.");
          setUpdating(false);
          return;
        }
        
        updateData.resolvedAt = serverTimestamp();
        
        // Upload new proof if provided
        if (proofFile) {
          try {
            const imageUrl = await uploadImageToCloudinary(proofFile);
            updateData.resolvedProofUrl = imageUrl;
          } catch (error) {
            console.error("Cloudinary upload error:", error.response?.data || error);
            toast.error("Failed to upload proof image");
            setUpdating(false);
            return;
          }
        }
        
        // Add admin who resolved the complaint
        updateData.resolvedBy = currentUser?.uid;
      }
      
      // CASE 2: Reverting from Resolved - Remove proof fields
      else if (complaint.status === "Resolved" && status !== "Resolved") {
        updateData.proofImageURL = deleteField();
        updateData.resolvedProofUrl = deleteField();
        updateData.resolvedAt = deleteField();
        updateData.resolvedBy = deleteField();
      }
      
      await updateDoc(complaintRef, updateData);
      
      // Update local state
      setComplaint(prev => ({ ...prev, ...updateData }));
      
      toast.success('Status Updated Successfully');
      setProofFile(null); // Clear proof file after upload
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
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

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp?.toDate?.().toLocaleString() || 'N/A';
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
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold village-primary-text mb-2">Complaint Not Found</h2>
          <p className="text-gray-600 mb-4">The complaint you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/admin/complaints')}
            className="village-button-primary"
          >
            Back to All Complaints
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
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Complaint Details</h1>
          <p className="text-lg font-light">Manage and review complaint information</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin/complaints')}
              className="village-button-secondary flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Complaints
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

                {/* Details Section */}
                <div className="p-6 space-y-6">
                  {/* Description */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold village-primary-text mb-3 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{complaint.description}</p>
                  </div>

                  {/* Images Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Complaint Evidence */}
                    {complaint.imageUrl && (
                      <div className="village-card overflow-hidden">
                        <div className="p-4">
                          <h3 className="text-lg font-semibold village-primary-text mb-3 flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            Complaint Evidence
                          </h3>
                          <div 
                            className="relative group cursor-pointer overflow-hidden rounded-lg"
                            onClick={() => openImageModal(complaint.imageUrl)}
                          >
                            <img
                              src={complaint.imageUrl}
                              alt="Complaint Evidence"
                              className="w-full h-48 object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <ExternalLink className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Work Completion Proof */}
                    {complaint.status === "Resolved" && complaint.resolvedProofUrl && (
                      <div className="village-card overflow-hidden">
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Work Completion Proof
                          </h3>
                          <div 
                            className="relative group cursor-pointer overflow-hidden rounded-lg"
                            onClick={() => openImageModal(complaint.resolvedProofUrl)}
                          >
                            <img
                              src={complaint.resolvedProofUrl}
                              alt="Work Completion Proof"
                              className="w-full h-48 object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          {complaint.resolvedAt && (
                            <div className="mt-3 text-sm text-green-600 flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              Resolved on: {formatDate(complaint.resolvedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Proof of Resolution */}
                    {complaint.status === "Resolved" && (complaint.proofImageURL || complaint.resolvedProofUrl) && (
                      <div className="village-card overflow-hidden">
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Proof of Resolution
                          </h3>
                          <div 
                            className="relative group cursor-pointer overflow-hidden rounded-lg"
                            onClick={() => openImageModal(complaint.proofImageURL || complaint.resolvedProofUrl)}
                          >
                            <img
                              src={complaint.proofImageURL || complaint.resolvedProofUrl}
                              alt="Proof of Resolution"
                              className="w-full h-48 object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Admin Notes */}
                  {complaint.adminNote && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Admin Notes
                      </h3>
                      <p className="text-blue-800">{complaint.adminNote}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - User Info & Metadata */}
            <div className="space-y-6">
              {/* User Information Card */}
              <div className="village-card">
                <div className="p-6">
                  <h3 className="text-lg font-semibold village-primary-text mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    User Information
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900 font-semibold">{complaint.userEmail}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="text-gray-900 font-mono text-xs">{complaint.userId?.slice(-8) || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complaint Metadata Card */}
              <div className="village-card">
                <div className="p-6">
                  <h3 className="text-lg font-semibold village-primary-text mb-4 flex items-center">
                    <Flag className="h-5 w-5 mr-2" />
                    Complaint Metadata
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="text-gray-900 font-semibold">{complaint.department}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Priority</p>
                      <p className="text-gray-900 font-semibold">{complaint.priority}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="text-gray-900 font-semibold">{complaint.status}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Card */}
              <div className="village-card">
                <div className="p-6">
                  <h3 className="text-lg font-semibold village-primary-text mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Timeline
                  </h3>
                  <div className="space-y-3">
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
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Latitude</p>
                        <p className="text-gray-900 font-mono text-xs">{complaint.latitude}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Longitude</p>
                        <p className="text-gray-900 font-mono text-xs">{complaint.longitude}</p>
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

              {/* Status Update Card */}
              <div className="village-card">
                <div className="p-6">
                  <h3 className="text-lg font-semibold village-primary-text mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Update Status
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-village-primary"
                        disabled={updating}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                    
                    {/* Proof Upload */}
                    {status === "Resolved" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Proof of Work Image {(complaint.proofImageURL || complaint.resolvedProofUrl) ? '(Optional - Replace existing)' : '(Required)'}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProofUpload}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-village-primary"
                          disabled={updating}
                        />
                        {proofFile && (
                          <p className="mt-2 text-sm text-gray-600">
                            Selected: {proofFile.name}
                          </p>
                        )}
                        {(complaint.proofImageURL || complaint.resolvedProofUrl) && !proofFile && (
                          <p className="mt-1 text-xs text-gray-500">
                            Current proof will be replaced if new image is uploaded
                          </p>
                        )}
                        {!(complaint.proofImageURL || complaint.resolvedProofUrl) && !proofFile && (
                          <p className="mt-1 text-xs text-red-500">
                            Proof image is required to resolve this complaint
                          </p>
                        )}
                      </div>
                    )}
                    
                    <button
                      onClick={handleUpdateStatus}
                      disabled={updating || !status}
                      className="w-full village-button-primary flex items-center justify-center"
                    >
                      {updating && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      )}
                      {updating ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>
                </div>
              </div>
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

export default AdminComplaintDetails;
