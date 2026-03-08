import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { uploadImageToCloudinary } from './cloudinaryService';

const COMPLAINTS_COLLECTION = 'complaints';

// Create new complaint
export const createComplaint = async (complaintData, imageFile) => {
  try {
    let imageURL = null;
    
    // Upload image to Cloudinary if provided
    if (imageFile) {
      imageURL = await uploadImageToCloudinary(imageFile);
    }

    // Get user's current location
    const position = await getCurrentLocation();
    
    const complaint = {
      ...complaintData,
      imageURL,
      latitude: position.latitude,
      longitude: position.longitude,
      status: 'Pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COMPLAINTS_COLLECTION), complaint);
    return { id: docRef.id, ...complaint };
  } catch (error) {
    throw error;
  }
};

// Get current location
const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      resolve({ latitude: 0, longitude: 0 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Geolocation error:', error);
        resolve({ latitude: 0, longitude: 0 });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

// Get all complaints (for admin)
export const getAllComplaints = async () => {
  try {
    const q = query(collection(db, COMPLAINTS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("getAllComplaints error:", error);
    throw error;
  }
};

// Get user's complaints
// NOTE: Composite index required: userId (ASC) + createdAt (DESC)
// If Firestore throws "requires index" error, create composite index from console link
export const getUserComplaints = async (userId) => {
  try {
    // Query that matches composite index exactly
    const q = query(
      collection(db, "complaints"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("getUserComplaints error:", error);
    throw error;
  }
};

// Update complaint status (for admin)
export const updateComplaintStatus = async (complaintId, status, adminNote = null) => {
  try {
    const complaintRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
    const updateData = {
      status,
      updatedAt: serverTimestamp()
    };
    
    // Add resolvedAt timestamp when status is Resolved
    if (status === 'Resolved') {
      updateData.resolvedAt = serverTimestamp();
    }
    
    // Add admin note if provided
    if (adminNote) {
      updateData.adminNote = adminNote;
    }
    
    await updateDoc(complaintRef, updateData);
    return true;
  } catch (error) {
    throw error;
  }
};

// Delete complaint (only by owner)
export const deleteComplaint = async (complaintId) => {
  try {
    await deleteDoc(doc(db, COMPLAINTS_COLLECTION, complaintId));
    return true;
  } catch (error) {
    throw error;
  }
};

// Get complaints by department (for filtering)
export const getComplaintsByDepartment = async (department) => {
  try {
    const q = query(
      collection(db, COMPLAINTS_COLLECTION),
      where('department', '==', department),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};
