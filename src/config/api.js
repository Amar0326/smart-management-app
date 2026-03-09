// Central API Configuration
// Automatically detects development vs production environment
const API_BASE_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_URL_LOCAL
  : import.meta.env.VITE_API_URL_PROD;

export default API_BASE_URL;
