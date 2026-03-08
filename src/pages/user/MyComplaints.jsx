import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { deleteComplaint } from '../../services/complaintService';
import toast from 'react-hot-toast';
import { Trash2, MapPin, Calendar, ExternalLink, AlertCircle, Plus, FileText } from 'lucide-react';
import {
  collection,
  where,
  orderBy,
  query,
  onSnapshot
} from "firebase/firestore";
import { db } from '../../services/firebase';

const MyComplaints = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    console.log("Auth State currentUser:", currentUser);

    if (!currentUser) {
      console.log("User not loaded yet");
      return;
    }

    console.log("Fetching complaints for UID:", currentUser.uid);

    const q = query(
      collection(db, "complaints"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userComplaints = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Fetched Complaints:", userComplaints);
      setComplaints(userComplaints);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleCardClick = (complaintId) => {
    navigate(`/complaint/${complaintId}`);
  };

  const handleDelete = async (complaintId) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) {
      return;
    }

    setDeleteLoading(complaintId);
    try {
      await deleteComplaint(complaintId);
      toast.success("Complaint deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete complaint");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "No date";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      {/* Header */}
      <div className="village-hero-banner">
        <div className="text-center px-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Complaints</h1>
          <p className="text-lg font-light">Track and manage your village complaints</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Action Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate("/user/create-complaint")}
              className="village-button-primary flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Complaint
            </button>
          </div>

          {complaints.length === 0 ? (
            <div className="village-card p-12 text-center">
              <div className="w-16 h-16 village-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold village-primary-text mb-2">No complaints found</h3>
              <p className="text-gray-600 mb-6">You haven't filed any complaints yet.</p>
              <button
                onClick={() => navigate("/user/create-complaint")}
                className="village-button-secondary"
              >
                File Your First Complaint
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {complaints.map((complaint) => (
                <div 
                  key={complaint.id} 
                  className="village-card cursor-pointer hover:shadow-lg transition-shadow duration-300"
                  onClick={() => handleCardClick(complaint.id)}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold village-primary-text mb-2">
                          {complaint.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(complaint.createdAt)}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {complaint.department}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            complaint.status
                          )}`}
                        >
                          {complaint.status}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <p className="text-gray-700 line-clamp-3">{complaint.description}</p>
                    </div>

                    {/* Location */}
                    {complaint.location && (
                      <div className="mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{complaint.location}</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-3">
                        {complaint.imageUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(complaint.imageUrl, "_blank");
                            }}
                            className="village-button-secondary text-sm flex items-center"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Image
                          </button>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(complaint.id);
                        }}
                        disabled={deleteLoading === complaint.id}
                        className="text-red-600 hover:text-red-800 flex items-center text-sm"
                      >
                        {deleteLoading === complaint.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1"></div>
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyComplaints;
