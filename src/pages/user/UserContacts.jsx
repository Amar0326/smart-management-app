import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Search, AlertTriangle, Users, MessageCircle, Navigation } from 'lucide-react';
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import toast from 'react-hot-toast';

const UserContacts = () => {
  const { currentUser } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const q = query(collection(db, "contacts"));
      const querySnapshot = await getDocs(q);
      const contactsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContacts(contactsData);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.service?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCall = (phone) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const handleWhatsApp = (phone) => {
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, ''); // Remove all non-digit characters
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  const handleMap = (address) => {
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

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
              <Users className="h-6 w-6 mr-3 text-white" />
              <h1 className="text-2xl font-bold text-white">Important Contacts</h1>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`rounded-lg shadow-lg overflow-hidden border-2 ${
                contact.emergency 
                  ? 'border-red-200 bg-red-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              {contact.emergency && (
                <div className="bg-red-500 text-white px-3 py-1 text-center text-sm font-medium">
                  <AlertTriangle className="inline h-4 w-4 mr-1" />
                  Emergency Contact
                </div>
              )}
              
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{contact.name || 'N/A'}</h3>
                  <p className="text-sm text-gray-600">{contact.service || 'N/A'}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{contact.address || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    {contact.email ? (
                      <a 
                        href={`mailto:${contact.email}`}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {contact.email}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    {contact.phone ? (
                      <a 
                        href={`tel:${contact.phone}`}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {contact.phone}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleCall(contact.phone)}
                    disabled={!contact.phone}
                    className="flex flex-col items-center justify-center p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    title="Call"
                  >
                    <Phone className="h-4 w-4 mb-1" />
                    <span className="text-xs">Call</span>
                  </button>
                  
                  <button
                    onClick={() => handleWhatsApp(contact.phone)}
                    disabled={!contact.phone}
                    className="flex flex-col items-center justify-center p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    title="WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4 mb-1" />
                    <span className="text-xs">WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={() => handleMap(contact.address)}
                    disabled={!contact.address}
                    className="flex flex-col items-center justify-center p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    title="Map"
                  >
                    <Navigation className="h-4 w-4 mb-1" />
                    <span className="text-xs">Map</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="bg-white shadow-lg rounded-lg p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'No contacts found matching your search' : 'No contacts available'}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm ? 'Try a different search term' : 'Important contacts will appear here once added by administrator'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserContacts;
