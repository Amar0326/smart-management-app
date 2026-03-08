import axios from 'axios';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvyirxi3w/image/upload';
const UPLOAD_PRESET = 'smartmanagement_unsigned';

/**
 * Upload image to Cloudinary
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} - Secure URL of uploaded image
 */
export const uploadImageToCloudinary = async (file) => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only PNG and JPEG images are allowed.');
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'complaints');

    // Upload to Cloudinary
    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total || !progressEvent.lengthComputable) return;

        const percentage = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        console.log("Upload Progress:", percentage + "%");
      },
    });

    if (response.data && response.data.secure_url) {
      return response.data.secure_url;
    } else {
      throw new Error('Failed to upload image to Cloudinary');
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary (if needed in future)
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    const deleteUrl = `https://api.cloudinary.com/v1_1/dvyirxi3w/image/destroy`;
    
    const response = await axios.post(deleteUrl, {
      public_id: publicId,
      upload_preset: UPLOAD_PRESET,
    });

    return response.data.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};
