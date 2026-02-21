import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('🚀 [JWT] Service loading...');
console.log('📍 [JWT] API_URL:', API_URL);

// ============================================
// PURE SIMPLE JWT SERVICE
// ============================================

// 1. TOKEN STORAGE FUNCTIONS
function saveToken(token) {
  console.log('💾 [JWT] Saving token...');
  localStorage.setItem('auth_token', token);
  console.log('✅ [JWT] Token saved to localStorage');
}

function loadToken() {
  const token = localStorage.getItem('auth_token');
  if (token) {
    console.log('📦 [JWT] Token loaded from localStorage');
    return token;
  }
  console.log('⚠️ [JWT] No token in localStorage');
  return null;
}

function deleteToken() {
  console.log('🗑️ [JWT] Deleting token...');
  localStorage.removeItem('auth_token');
  console.log('✅ [JWT] Token deleted');
}

// 2. JWT SERVICE OBJECT
const jwtService = {
  setToken(token) {
    saveToken(token);
    return true;
  },

  getToken() {
    return loadToken();
  },

  clearToken() {
    deleteToken();
  },

  isAuthenticated() {
    return !!loadToken();
  },

  setupInterceptor() {
    console.log('ℹ️ [JWT] setupInterceptor() called - interceptors already initialized at module load');
    return true;
  }
};

// 3. SETUP AXIOS INTERCEPTOR
console.log('🔧 [JWT] Setting up axios interceptor...');

// REQUEST INTERCEPTOR - Add Authorization header
axios.interceptors.request.use(
  function onFulfilled(config) {
    const url = config.url || 'unknown';
    console.log(`📤 [AXIOS] Request to: ${url}`);

    const token = loadToken();
    console.log(`🔍 [AXIOS] Token found: ${!!token}`);

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`✅ [AXIOS] Authorization header added`);
    } else {
      console.warn(`⚠️ [AXIOS] No token available - request will be unauthenticated`);
    }

    return config;
  },
  function onRejected(error) {
    console.error('❌ [AXIOS] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

console.log('✅ [JWT] Request interceptor installed');

// RESPONSE INTERCEPTOR - Just log errors, don't redirect
// Let components handle their own errors
axios.interceptors.response.use(
  function onFulfilled(response) {
    return response;
  },
  function onRejected(error) {
    const status = error.response?.status;
    const url = error.config?.url || 'unknown';

    console.error(`🔴 [AXIOS] Response error - Status: ${status}, URL: ${url}`);

    // Don't automatically redirect - let components handle auth errors
    return Promise.reject(error);
  }
);

console.log('✅ [JWT] Response interceptor installed');
console.log('✅ [JWT] Interceptor setup complete');

export default jwtService;
