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

    console.log('Attempting to delete from Cloudinary...');
    
    // Delete file from Cloudinary with proper resource type
    const result = await cloudinary.uploader.destroy(publicId, { 
      resource_type: resourceType 
    });

    console.log('Cloudinary deletion result:', result);

    // Check if deletion was successful
    if (result.result === 'ok' || result.result === 'deleted') {
      console.log('Successfully deleted file from Cloudinary');
      return res.json({ 
        success: true, 
        message: 'File deleted successfully' 
      });
    } else {
      console.log('Cloudinary deletion failed:', result);
      return res.status(500).json({ 
        success: false, 
        message: `Failed to delete file from Cloudinary: ${result.result}` 
      });
    }

  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    
    // Ensure we always send a response
    if (!res.headersSent) {
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Delete failed due to server error' 
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
