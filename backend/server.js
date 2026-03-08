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

    // Validate required fields
    if (!publicId || !resourceType) {
      return res.status(400).json({ 
        success: false, 
        error: 'publicId and resourceType are required' 
      });
    }

    // Validate resourceType
    if (!['raw', 'image'].includes(resourceType)) {
      return res.status(400).json({ 
        success: false, 
        error: 'resourceType must be either "raw" or "image"' 
      });
    }

    // Delete file from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, { 
      resource_type: resourceType 
    });

    // Check if deletion was successful
    if (result.result === 'ok') {
      return res.json({ success: true });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to delete file from Cloudinary' 
      });
    }

  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: 'Delete failed' 
    });
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
