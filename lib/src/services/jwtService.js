import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('🚀 [JWT SERVICE] Initializing...');
console.log('📍 [JWT SERVICE] API URL:', API_URL);

// ============================================
// SIMPLE JWT SERVICE - CLEAN IMPLEMENTATION
// ============================================

const jwtService = {
  // ============================================
  // 1. TOKEN STORAGE - Simple localStorage access
  // ============================================

  setToken(token) {
    console.log('💾 [TOKEN STORAGE] Saving token to localStorage');
    try {
      localStorage.setItem('auth_token', token);
      const verified = localStorage.getItem('auth_token');
      if (verified === token) {
        console.log('✅ [TOKEN STORAGE] Token saved successfully');
        return true;
      } else {
        console.error('❌ [TOKEN STORAGE] Token verification failed');
        return false;
      }
    } catch (error) {
      console.error('❌ [TOKEN STORAGE] Failed to save token:', error.message);
      return false;
    }
  },

  getToken() {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        console.log('✅ [TOKEN RETRIEVAL] Token found in localStorage');
        return token;
      } else {
        console.warn('⚠️ [TOKEN RETRIEVAL] No token in localStorage');
        return null;
      }
    } catch (error) {
      console.error('❌ [TOKEN RETRIEVAL] Error reading token:', error.message);
      return null;
    }
  },

  clearToken() {
    console.log('🗑️ [TOKEN STORAGE] Clearing token from localStorage');
    localStorage.removeItem('auth_token');
  },

  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  },

  // ============================================
  // 2. AXIOS INTERCEPTOR - Add Authorization header
  // ============================================

  setupInterceptor() {
    console.log('🔧 [INTERCEPTOR] Setting up axios request interceptor...');

    // REQUEST INTERCEPTOR - Add Authorization header to all requests
    axios.interceptors.request.use(
      (config) => {
        console.log(`📤 [INTERCEPTOR] Intercepting request to: ${config.url}`);

        const token = jwtService.getToken();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`✅ [INTERCEPTOR] Authorization header added to request`);
        } else {
          console.warn(`⚠️ [INTERCEPTOR] No token available for request to: ${config.url}`);
        }

        return config;
      },
      (error) => {
        console.error('❌ [INTERCEPTOR] Request error:', error.message);
        return Promise.reject(error);
      }
    );

    console.log('✅ [INTERCEPTOR] Request interceptor setup complete');

    // RESPONSE INTERCEPTOR - Handle 401 responses
    axios.interceptors.response.use(
      (response) => {
        console.log(`📥 [INTERCEPTOR] Response received: ${response.status}`);
        return response;
      },
      (error) => {
        console.error(`❌ [INTERCEPTOR] Response error: ${error.response?.status}`);

        if (error.response?.status === 401) {
          console.warn('⚠️ [INTERCEPTOR] 401 Unauthorized - Redirecting to login');
          jwtService.clearToken();
          window.location.href = '/admin-login';
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );

    console.log('✅ [INTERCEPTOR] Response interceptor setup complete');
  }
};

export default jwtService;
