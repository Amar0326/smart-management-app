import React, { useState, useEffect } from 'react';
import { Globe, Search, Calendar, AlertCircle, ExternalLink } from 'lucide-react';
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import toast from 'react-hot-toast';

const UserGovtWebsites = () => {
  const { currentUser } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
            <div className="flex items-center">
              <Globe className="h-6 w-6 mr-3 text-white" />
              <h1 className="text-2xl font-bold text-white">Government Websites</h1>
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
              {searchTerm ? 'Try a different search term' : 'Government websites will appear here once added by administrator'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserGovtWebsites;
