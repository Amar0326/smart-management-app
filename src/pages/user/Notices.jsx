import React, { useState, useEffect } from 'react';
import { getAllNotices } from '../../services/noticeService';
import PDFViewer from '../../components/shared/PDFViewer';
import TextToSpeech from '../../components/shared/TextToSpeech';
import toast from 'react-hot-toast';
import { FileText, Calendar, AlertCircle, Volume2, MapPin } from 'lucide-react';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const noticesData = await getAllNotices();
      setNotices(noticesData);
    } catch (error) {
      toast.error('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return timestamp
      ? timestamp.toDate().toLocaleDateString()
      : "No Date";
  };

  const handleNoticeSelect = (notice) => {
    setSelectedNotice(notice);
    // Extract text from PDF for text-to-speech
    // This will be handled by the PDFViewer component
  };

  const handleTextExtracted = (text) => {
    setExtractedText(text);
    setPdfLoading(false);
  };

  const handlePdfLoading = (loading) => {
    setPdfLoading(loading);
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Notices</h1>
          <p className="text-lg font-light">Government Resolutions and Official Announcements</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {notices.length === 0 ? (
            <div className="village-card p-12 text-center">
              <div className="w-16 h-16 village-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold village-primary-text mb-2">No notices available</h3>
              <p className="text-gray-600">There are no notices at the moment. Check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Notices List */}
              <div className="lg:col-span-1">
                <div className="village-card">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 village-primary-text mr-2" />
                      <h2 className="text-lg font-medium village-primary-text">All Notices</h2>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notices.map((notice) => (
                      <div
                        key={notice.id}
                        onClick={() => handleNoticeSelect(notice)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedNotice?.id === notice.id ? 'bg-green-50 border-l-4 border-l-village-primary' : ''
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="w-8 h-8 village-accent rounded-lg flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <FileText className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium village-primary-text line-clamp-2">
                              {notice.title}
                            </h3>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(notice.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* PDF Viewer and Text-to-Speech */}
              <div className="lg:col-span-2 space-y-6">
                {selectedNotice ? (
                  <>
                    <div className="village-card">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 village-primary-text mr-2" />
                          <h3 className="text-lg font-medium village-primary-text">{selectedNotice.title}</h3>
                        </div>
                      </div>
                      <div className="p-4">
                        <PDFViewer 
                          pdfUrl={selectedNotice.pdfUrl} 
                          title={selectedNotice.title}
                          onTextExtracted={handleTextExtracted}
                          onPdfLoading={handlePdfLoading}
                        />
                      </div>
                    </div>
                    
                    {extractedText && (
                      <TextToSpeech text={extractedText} isLoading={pdfLoading} />
                    )}
                  </>
                ) : (
                  <div className="village-card p-12 text-center">
                    <div className="w-16 h-16 village-accent rounded-full flex items-center justify-center mx-auto mb-4">
                      <Volume2 className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold village-primary-text mb-2">Select a Notice</h3>
                    <p className="text-gray-600">Choose a notice from the list to view and listen to it.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 village-card p-6">
            <div className="flex items-start">
              <div className="w-10 h-10 village-accent rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <Volume2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-medium village-primary-text mb-2">Text-to-Speech Feature</h4>
                <p className="text-sm text-gray-600">
                  Click on any notice to view it, then use the text-to-speech controls to listen to the content. You can adjust the voice and reading speed according to your preference.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notices;
