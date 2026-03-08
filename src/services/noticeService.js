import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import axios from 'axios';

const NOTICES_COLLECTION = 'notices';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvyirxi3w/image/upload';
const UPLOAD_PRESET = 'smartmanagement_unsigned';

/**
 * Upload PDF to Cloudinary
 * @param {File} file - PDF file to upload
 * @returns {Promise<string>} - Secure URL of uploaded PDF
 */
export const uploadNoticePDF = async (file) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", "smartmanagement_unsigned");
  formData.append("resource_type", "image");

  const response = await axios.post(
    "https://api.cloudinary.com/v1_1/dvyirxi3w/image/upload",
    formData
  );

  return response.data.secure_url;
};

/**
 * Create notice with PDF upload
 * @param {string} title - Notice title
 * @param {File} pdfFile - PDF file to upload
 * @param {string} uploadedBy - Admin user ID
 * @returns {Promise<Object>} - Created notice data
 */
export const createNotice = async (title, pdfFile, uploadedBy) => {
  try {
    // Upload PDF to Cloudinary
    const fileURL = await uploadNoticePDF(pdfFile);

    // Store metadata in Firestore
    const notice = {
      title,
      fileURL,
      uploadedBy,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, NOTICES_COLLECTION), notice);
    return { id: docRef.id, ...notice };
  } catch (error) {
    throw error;
  }
};

/**
 * Get all notices
 * @returns {Promise<Array>} - Array of notices
 */
export const getAllNotices = async () => {
  try {
    const q = query(collection(db, NOTICES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

// Get single notice by ID
export const getNoticeById = async (noticeId) => {
  try {
    const noticeDoc = await getDoc(doc(db, NOTICES_COLLECTION, noticeId));
    if (noticeDoc.exists()) {
      return { id: noticeDoc.id, ...noticeDoc.data() };
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Delete notice (admin only)
export const deleteNotice = async (noticeId) => {
  try {
    await deleteDoc(doc(db, NOTICES_COLLECTION, noticeId));
    return true;
  } catch (error) {
    throw error;
  }
};
