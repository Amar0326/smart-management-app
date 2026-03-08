import React, { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import * as pdfjsLib from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

// Configure Vite-compatible worker
pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

const PDFViewer = ({ pdfUrl, title, onTextExtracted, onPdfLoading }) => {
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    if (pdfUrl) {
      extractTextFromPDF();
    }
  }, [pdfUrl]);

  const extractTextFromPDF = async () => {
    setIsLoading(true);
    setError(null);
    setExtractedText('');
    
    // Notify parent about loading state
    if (onPdfLoading) {
      onPdfLoading(true);
    }

    try {
      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        withCredentials: false,
      });

      const pdf = await loadingTask.promise;
      setNumPages(pdf.numPages);
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item) => item.str);
        fullText += strings.join(" ");
      }

      setExtractedText(fullText.trim());
      
      // Pass extracted text to parent component
      if (onTextExtracted) {
        onTextExtracted(fullText.trim());
      }
      
      // Notify parent that loading is complete
      if (onPdfLoading) {
        onPdfLoading(false);
      }
    } catch (error) {
      console.error("PDF extraction error:", error);
      setError("Failed to extract text from PDF. You can still view the original document.");
      
      // Notify parent that loading is complete even on error
      if (onPdfLoading) {
        onPdfLoading(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title || 'notice'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openPDFInNewTab = () => {
  if (!pdfUrl) return;
  console.log("Opening:", pdfUrl);
  window.open(pdfUrl, "_blank", "noopener,noreferrer");
};

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">{title || 'PDF Document'}</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={downloadPDF}
              className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </button>
            <button
              onClick={openPDFInNewTab}
              className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Extracting text...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={openPDFInNewTab}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Original PDF
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* PDF Info */}
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <p>📄 {numPages} page{numPages > 1 ? 's' : ''}</p>
              <p>📝 Text extracted successfully</p>
            </div>

            {/* Extracted Text */}
            <div className="border rounded-lg">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h4 className="text-sm font-medium text-gray-700">Extracted Text</h4>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                  {extractedText || 'No text found in this PDF.'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
