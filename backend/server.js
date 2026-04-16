import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Delete file route
app.post('/delete-file', async (req, res) => {
  try {
    const { publicId, resourceType } = req.body;

    console.log('Delete request received:', { publicId, resourceType });

    // Validate required fields
    if (!publicId || !resourceType) {
      console.log('Missing required fields:', { publicId, resourceType });
      return res.status(400).json({ 
        success: false, 
        message: 'publicId and resourceType are required' 
      });
    }

    // Validate resourceType
    if (!['raw', 'image'].includes(resourceType)) {
      console.log('Invalid resourceType:', resourceType);
      return res.status(400).json({ 
        success: false, 
        message: 'resourceType must be either "raw" or "image"' 
      });
    }

    // Clean publicId by removing file extensions
    const cleanPublicId = publicId.replace(/\.(pdf|PDF|jpg|JPG|jpeg|JPEG|png|PNG)$/, '');
    console.log('Clean publicId:', cleanPublicId);

    console.log('Attempting to delete from Cloudinary...');
    
    let cloudinaryDeleted = false;
    let cloudinaryError = null;
    
    // Try to delete file from Cloudinary, but don't fail if it doesn't exist
    try {
      const result = await cloudinary.uploader.destroy(cleanPublicId, { 
        resource_type: resourceType 
      });
      console.log('Cloudinary deletion result:', result);

      // Check if deletion was successful
      if (result.result === 'ok' || result.result === 'deleted') {
        console.log('Successfully deleted file from Cloudinary');
        cloudinaryDeleted = true;
      } else {
        console.log('Cloudinary deletion failed:', result);
        cloudinaryError = result.result;
      }
    } catch (cloudinaryErr) {
      console.error('Cloudinary delete error:', cloudinaryErr);
      cloudinaryError = cloudinaryErr.message;
      
      // If file not found, that's okay - continue with deletion
      if (cloudinaryErr.message && cloudinaryErr.message.includes('not found')) {
        console.log('File not found in Cloudinary, continuing with DB deletion');
        cloudinaryDeleted = true; // Treat as success since file doesn't exist
      }
    }

    // Always return success - the frontend will handle DB deletion
    return res.json({ 
      success: true, 
      message: cloudinaryDeleted ? 'File deleted successfully' : 'File not found in Cloudinary, but deletion can proceed',
      cloudinaryDeleted,
      cloudinaryError: cloudinaryError || null
    });

  } catch (error) {
    console.error("Server Delete Error:", error);
    
    // Even if there's a server error, allow frontend to proceed with DB deletion
    if (!res.headersSent) {
      return res.json({ 
        success: true, 
        message: 'Proceeding with deletion despite server error',
        cloudinaryDeleted: false,
        cloudinaryError: error.message
      });
    }
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Cloudinary configured for cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
});
