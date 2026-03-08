import axios from 'axios';

// Base API URL from environment variables
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export API base URL for manual fetch calls
export { API };

// Export configured axios instance
export default api;

// Common API methods
export const apiService = {
  // GET request
  get: (url, config = {}) => api.get(url, config),
  
  // POST request
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  
  // PUT request
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  
  // DELETE request
  delete: (url, config = {}) => api.delete(url, config),
  
  // PATCH request
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
};
