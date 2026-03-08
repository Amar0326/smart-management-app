import React, { useState, useEffect } from 'react';
import { getAllComplaints } from '../../services/complaintService';
import { getAllNotices } from '../../services/noticeService';
import toast from 'react-hot-toast';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  FileText, 
  Users,
  Calendar,
  Filter
} from 'lucide-react';

const Analytics = () => {
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [complaintsData, noticesData] = await Promise.all([
        getAllComplaints(),
        getAllNotices()
      ]);
      
      setComplaints(complaintsData);
      setNotices(noticesData);
    } catch (error) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
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

  const getFilteredComplaints = () => {
    if (timeRange === 'all') return complaints;
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (timeRange) {
      case '7days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      default:
        return complaints;
    }
    
    return complaints.filter(c => {
      const complaintDate = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
      return complaintDate >= cutoffDate;
    });
  };

  const filteredComplaints = getFilteredComplaints();

  // Calculate statistics
  const stats = {
    totalComplaints: filteredComplaints.length,
    totalNotices: notices.length,
    resolvedComplaints: filteredComplaints.filter(c => c.status === 'Resolved').length,
    pendingComplaints: filteredComplaints.filter(c => c.status === 'Pending').length,
    inProgressComplaints: filteredComplaints.filter(c => c.status === 'In Progress').length,
    rejectedComplaints: filteredComplaints.filter(c => c.status === 'Rejected').length,
    resolutionRate: filteredComplaints.length > 0 
      ? Math.round((filteredComplaints.filter(c => c.status === 'Resolved').length / filteredComplaints.length) * 100)
      : 0
  };

  // Department-wise statistics
  const departmentStats = filteredComplaints.reduce((acc, complaint) => {
    if (!acc[complaint.department]) {
      acc[complaint.department] = 0;
    }
    acc[complaint.department]++;
    return acc;
  }, {});

  // Priority-wise statistics
  const priorityStats = filteredComplaints.reduce((acc, complaint) => {
    if (!acc[complaint.priority]) {
      acc[complaint.priority] = 0;
    }
    acc[complaint.priority]++;
    return acc;
  }, {});

  // Status-wise statistics
  const statusStats = {
    Pending: stats.pendingComplaints,
    'In Progress': stats.inProgressComplaints,
    Resolved: stats.resolvedComplaints,
    Rejected: stats.rejectedComplaints
  };

  const departments = Object.keys(departmentStats);
  const priorities = Object.keys(priorityStats);
  const statuses = Object.keys(statusStats);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'bg-gray-500';
      case 'Medium': return 'bg-orange-500';
      case 'High': return 'bg-red-500';
      case 'Critical': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Resolved': return 'bg-green-500';
      case 'Rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">Detailed insights and statistics</p>
        </div>

        {/* Time Range Filter */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Time Range:</span>
            </div>
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'All Time' },
                { value: '7days', label: 'Last 7 Days' },
                { value: '30days', label: 'Last 30 Days' },
                { value: '90days', label: 'Last 90 Days' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    timeRange === range.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Complaints</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.totalComplaints}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Resolution Rate</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.resolutionRate}%</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Notices</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.totalNotices}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.pendingComplaints}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department-wise Distribution */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Department-wise Complaints</h3>
            <div className="space-y-3">
              {departments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No data available</p>
              ) : (
                departments.map((dept) => (
                  <div key={dept} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{dept}</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(departmentStats[dept] / stats.totalComplaints) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">
                        {departmentStats[dept]}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Priority-wise Distribution */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Priority-wise Distribution</h3>
            <div className="space-y-3">
              {priorities.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No data available</p>
              ) : (
                priorities.map((priority) => (
                  <div key={priority} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(priority)} mr-2`}></div>
                      <span className="text-sm text-gray-700">{priority}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className={`${getPriorityColor(priority)} h-2 rounded-full`}
                          style={{ width: `${(priorityStats[priority] / stats.totalComplaints) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">
                        {priorityStats[priority]}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Status-wise Distribution */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status-wise Distribution</h3>
            <div className="space-y-3">
              {statuses.map((status) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} mr-2`}></div>
                    <span className="text-sm text-gray-700">{status}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className={`${getStatusColor(status)} h-2 rounded-full`}
                        style={{ width: `${(statusStats[status] / stats.totalComplaints) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {statusStats[status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Summary Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Resolution Time</span>
                <span className="text-sm font-medium text-gray-900">3-5 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Most Active Department</span>
                <span className="text-sm font-medium text-gray-900">
                  {departments.length > 0 ? departments.reduce((a, b) => 
                    departmentStats[a] > departmentStats[b] ? a : b
                  ) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Highest Priority Issues</span>
                <span className="text-sm font-medium text-gray-900">
                  {priorityStats['Critical'] || 0} Critical
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Users Engaged</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Set(complaints.map(c => c.userId)).size}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
