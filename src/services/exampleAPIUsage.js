// Example of how to use the API service with VITE_API_URL
import { API, apiService } from './apiService';

// Example API calls using the environment variable

// 1. Using the API base URL with fetch (for existing code)
export const exampleFetchCall = async () => {
  try {
    const response = await fetch(`${API}/api/complaints`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// 2. Using the configured axios instance
export const getComplaints = async () => {
  try {
    const response = await apiService.get('/api/complaints');
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// 3. POST request example
export const createComplaint = async (complaintData) => {
  try {
    const response = await apiService.post('/api/complaints', complaintData);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// 4. PUT request example
export const updateComplaint = async (id, complaintData) => {
  try {
    const response = await apiService.put(`/api/complaints/${id}`, complaintData);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// 5. DELETE request example
export const deleteComplaint = async (id) => {
  try {
    const response = await apiService.delete(`/api/complaints/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
