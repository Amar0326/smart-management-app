// Central API Configuration
// Automatically detects development vs production environment

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://smart-management-backend.onrender.com";

export default API_BASE_URL;
