import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllComplaints, updateComplaintStatus } from '../../services/complaintService';
import toast from 'react-hot-toast';
import { 
  Filter, 
  Search, 
  MapPin, 
  Calendar, 
  User, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import AdminMapView from '../../components/admin/AdminMapView';

const AllComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [isMapView, setIsMapView] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    priority: '',
    status: '',
    search: ''
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
  const statuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [complaints, filters]);

  const fetchComplaints = async () => {
    try {
      const complaintsData = await getAllComplaints();
      setComplaints(complaintsData);
    } catch (error) {
      toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = complaints;

    if (filters.department) {
      filtered = filtered.filter(c => c.department === filters.department);
    }

    if (filters.priority) {
      filtered = filtered.filter(c => c.priority === filters.priority);
    }

    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower) ||
        c.userEmail?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredComplaints(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    setUpdatingStatus(complaintId);
    try {
      await updateComplaintStatus(complaintId, newStatus);
      
      // Update local state
      setComplaints(prev => prev.map(c => 
        c.id === complaintId 
          ? { ...c, status: newStatus, updatedAt: new Date().toISOString() }
          : c
      ));
      
      toast.success('Complaint status updated successfully');
    } catch (error) {
      toast.error('Failed to update complaint status');
    } finally {
      setUpdatingStatus(null);
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
      case 'Low': return 'bg-gray-100 text-gray-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'High': return 'bg-red-100 text-red-800';
      case 'Critical': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "No date";
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString("en-IN", {
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

  const openGoogleMaps = (latitude, longitude) => {
    if (latitude && longitude) {
      window.open(`https://maps.google.com/?q=${latitude},${longitude}`, '_blank');
    }
  };

  const clearFilters = () => {
    setFilters({
      department: '',
      priority: '',
      status: '',
      search: ''
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">All Complaints</h1>
          <p className="mt-2 text-gray-600">Manage and update complaint statuses</p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">All Priorities</option>
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {filteredComplaints.length} of {complaints.length} complaints
          </div>
          <button
            onClick={() => setIsMapView(!isMapView)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors"
          >
            {isMapView ? "View List" : "📍 View on Map"}
          </button>
        </div>

        {/* Map View or List View */}
        {isMapView ? (
          <AdminMapView complaints={filteredComplaints} />
        ) : (
          /* Complaints List */
          <div className="space-y-4">
            {filteredComplaints.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <p className="text-gray-600">No complaints found matching your filters.</p>
              </div>
            ) : (
              filteredComplaints.map((complaint) => (
                <div key={complaint.id} className="bg-white shadow rounded-lg p-6">
                  <div 
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/admin/complaints/${complaint.id}`)}
                  >
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-medium text-gray-900">{complaint.title}</h3>
                        <div className="flex space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                            {complaint.status}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                            {complaint.priority}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-3">{complaint.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          {complaint.userEmail}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium mr-2">Department:</span>
                          {complaint.department}
                        </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(complaint.createdAt)}
                      </div>
                      {complaint.latitude && complaint.longitude && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openGoogleMaps(complaint.latitude, complaint.longitude);
                          }}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          View Location
                        </button>
                      )}
                    </div>

                    {complaint.imageURL && (
                      <div className="mt-4">
                        <img
                          src={complaint.imageURL}
                          alt="Complaint image"
                          className="w-full h-32 object-cover rounded-md cursor-pointer hover:opacity-90"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(complaint.imageURL, '_blank');
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Status Update */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Update Status
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                      value={complaint.status}
                      onChange={(e) => handleStatusUpdate(complaint.id, e.target.value)}
                      disabled={updatingStatus === complaint.id}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    
                    {updatingStatus === complaint.id && (
                      <div className="flex items-center text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Updating...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default AllComplaints;
