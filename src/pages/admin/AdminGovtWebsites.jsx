import React, { useState, useEffect } from 'react';
import { Globe, Plus, Edit2, Trash2, Search, Calendar, AlertCircle, ExternalLink } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import toast from 'react-hot-toast';

const AdminGovtWebsites = () => {
  const { currentUser } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    endDate: null
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const q = query(collection(db, "govt_websites"));
      const querySnapshot = await getDocs(q);
      const websitesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWebsites(websitesData);
    } catch (error) {
      console.error('Error fetching websites:', error);
      toast.error('Failed to load websites');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Please login first');
      return;
    }

    // Validate URL
    try {
      new URL(formData.url);
    } catch {
      toast.error('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setSubmitting(true);
    
    try {
      const websiteData = {
        ...formData,
        url: formData.url.trim(),
        createdAt: editingWebsite ? editingWebsite.createdAt : serverTimestamp()
      };

      if (editingWebsite) {
        await updateDoc(doc(db, "govt_websites", editingWebsite.id), websiteData);
        toast.success('Website updated successfully!');
      } else {
        await addDoc(collection(db, "govt_websites"), websiteData);
        toast.success('Website added successfully!');
      }

      setShowModal(false);
      setEditingWebsite(null);
      setFormData({
        name: '',
        url: '',
        endDate: null
      });
      fetchWebsites();
    } catch (error) {
      console.error('Error saving website:', error);
      toast.error('Failed to save website');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (website) => {
    setEditingWebsite(website);
    setFormData({
      name: website.name || '',
      url: website.url || '',
      endDate: website.endDate || null
    });
    setShowModal(true);
  };

  const handleDelete = async (websiteId) => {
    if (!window.confirm('Are you sure you want to delete this website?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, "govt_websites", websiteId));
      toast.success('Website deleted successfully!');
      fetchWebsites();
    } catch (error) {
      console.error('Error deleting website:', error);
      toast.error('Failed to delete website');
    }
  };

  const isExpired = (endDate) => {
    if (!endDate) return false;
    const now = new Date();
    const expiry = endDate.toDate ? endDate.toDate() : new Date(endDate);
    return expiry < now;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No expiry';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredWebsites = websites.filter(website => 
    website.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    website.url?.toLowerCase().includes(searchTerm.toLowerCase())
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
        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="h-6 w-6 mr-3 text-white" />
                <h1 className="text-2xl font-bold text-white">Government Websites</h1>
              </div>
              <button
                onClick={() => {
                  setEditingWebsite(null);
                  setFormData({
                    name: '',
                    url: '',
                    endDate: null
                  });
                  setShowModal(true);
                }}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Website
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Websites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWebsites.map((website) => {
            const expired = isExpired(website.endDate);
            return (
              <div
                key={website.id}
                className={`rounded-lg shadow-lg overflow-hidden border-2 ${
                  expired 
                    ? 'border-gray-300 bg-gray-100' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                {expired && (
                  <div className="bg-gray-500 text-white px-3 py-1 text-center text-sm font-medium">
                    <AlertCircle className="inline h-4 w-4 mr-1" />
                    EXPIRED
                  </div>
                )}
                
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{website.name || 'N/A'}</h3>
                    <div className="flex items-center">
                      <ExternalLink className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      {website.url ? (
                        <a 
                          href={website.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                        >
                          {website.url}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className={`font-medium ${expired ? 'text-gray-500' : 'text-gray-700'}`}>
                      {formatDate(website.endDate)}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(website)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(website.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredWebsites.length === 0 && (
          <div className="bg-white shadow-lg rounded-lg p-12 text-center">
            <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'No websites found matching your search' : 'No websites available'}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm ? 'Try a different search term' : 'Add your first website to get started'}
            </p>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {editingWebsite ? 'Edit Website' : 'Add New Website'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Website name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.endDate ? new Date(formData.endDate.toDate ? formData.endDate.toDate() : formData.endDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value ? new Date(e.target.value) : null})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty for no expiry (always active)
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingWebsite(null);
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? 'Saving...' : (editingWebsite ? 'Update' : 'Add')}
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

export default AdminGovtWebsites;
