import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, query, orderBy, getDocs, deleteDoc, doc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import toast from 'react-hot-toast';
import { Upload, FileText, ArrowLeft, Trash2, Eye, X, Calendar } from 'lucide-react';
import { API } from '../../services/apiService';

const UploadNotice = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: ''
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingNotices, setFetchingNotices] = useState(true);
  const [deletingNotice, setDeletingNotice] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    notice: null
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setFetchingNotices(true);
    try {
      const q = query(collection(db, "notices"), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const noticesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotices(noticesData);
    } catch (error) {
      console.error('Error fetching notices:', error);
      toast.error('Failed to load notices');
    } finally {
      setFetchingNotices(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error('PDF size should be less than 10MB');
        return;
      }
      
      setPdfFile(file);
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "notices_unsigned");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dvyirxi3w/raw/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary error:", errorData);
      throw new Error(errorData.error?.message || "Upload failed");
    }

    return await response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pdfFile) return;

    try {
      const uploadResult = await uploadToCloudinary(pdfFile);

      await addDoc(collection(db, "notices"), {
        title: formData.title.trim(),
        pdfUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        resourceType: uploadResult.resource_type,
        createdAt: serverTimestamp(),
      });

      alert("Notice uploaded successfully");
      
      // Reset form
      setFormData({ title: '' });
      setPdfFile(null);
      
      // Refresh notices list
      fetchNotices();
    } catch (error) {
      console.error("Error uploading notice:", error);
    }
  };

  const handleDeleteClick = (notice) => {
    setDeleteModal({
      isOpen: true,
      notice
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.notice) return;

    // Verify publicId exists
    if (!deleteModal.notice.publicId) {
      toast.error('Notice does not have a valid file ID');
      setDeleteModal({ isOpen: false, notice: null });
      return;
    }

    setDeletingNotice(deleteModal.notice.id);
    try {
      console.log("Deleting publicId:", deleteModal.notice.publicId);
      console.log("Using API URL:", API);
      
      // Call backend API to delete from Cloudinary
      const response = await fetch(`${API}/delete-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicId: deleteModal.notice.publicId,
          resourceType: deleteModal.notice.resourceType
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        // Delete from Firestore only after successful Cloudinary deletion
        await deleteDoc(doc(db, "notices", deleteModal.notice.id));
        toast.success('Notice deleted successfully!');
        fetchNotices();
      } else {
        toast.error(result.message || 'Failed to delete file from Cloudinary');
      }
    } catch (error) {
      console.error('Error deleting notice:', error);
      toast.error(error.message || 'Failed to delete notice');
    } finally {
      setDeletingNotice(null);
      setDeleteModal({ isOpen: false, notice: null });
    }
  };

  const deleteFromCloudinary = async (publicId) => {
    try {
      const formData = new FormData();
      formData.append("public_id", publicId);
      formData.append("upload_preset", "smartmanagement_unsigned");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dvyirxi3w/raw/destroy",
        { method: "POST", body: formData }
      );

      const data = await response.json();
      if (data.result !== 'ok') {
        throw new Error('Cloudinary deletion failed');
      }
      return data;
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      // Don't throw error here to prevent UI crash
      // We'll still delete from Firestore
      return null;
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

  return (
    <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Notice Management</h1>
          <p className="mt-2 text-gray-600">Upload and manage official notices and announcements</p>
        </div>

        {/* Upload Form */}
        <div className="bg-white shadow rounded-lg mb-8">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Notice Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter notice title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF Document *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  {pdfFile ? (
                    <div className="relative">
                      <FileText className="mx-auto h-12 w-12 text-red-600 mb-4" />
                      <div className="text-sm text-gray-900">
                        <p className="font-medium">{pdfFile.name}</p>
                        <p className="text-gray-500">
                          {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPdfFile(null)}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="pdf-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="pdf-upload"
                            name="pdf-upload"
                            type="file"
                            accept=".pdf"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF only, up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Upload Notice'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Notices List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Notices</h2>
          </div>
          
          {fetchingNotices ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading notices...</p>
            </div>
          ) : notices.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No notices uploaded yet</p>
              <p className="text-gray-500 text-sm mt-2">Upload your first notice to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notices.map((notice) => (
                <div key={notice.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{notice.title}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(notice.createdAt)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span>Uploaded by: {notice.uploadedBy}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <a
                        href={notice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View PDF
                      </a>
                      <button
                        onClick={() => handleDeleteClick(notice)}
                        disabled={deletingNotice === notice.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingNotice === notice.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Delete Notice</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-900">
                  Are you sure you want to delete "<span className="font-medium">{deleteModal.notice?.title}</span>"?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This will permanently remove the notice and its PDF file.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: false, notice: null })}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deletingNotice}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingNotice ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    'Delete Notice'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadNotice;
