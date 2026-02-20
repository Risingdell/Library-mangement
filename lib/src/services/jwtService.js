import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class JWTService {
  // Store tokens in localStorage
  setTokens(token, refreshToken) {
    console.log('🔐 JWTService.setTokens() called');
    if (token) {
      localStorage.setItem('token', token);
      console.log('✅ Token stored in localStorage:', token.substring(0, 50) + '...');
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
      console.log('✅ RefreshToken stored in localStorage:', refreshToken.substring(0, 50) + '...');
    }
  }

  getToken() {
    const token = localStorage.getItem('token');
    console.log('📋 JWTService.getToken():', token ? 'Token found (' + token.substring(0, 30) + '...)' : 'No token');
    return token;
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  // Clear tokens on logout
  clearTokens() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Setup axios interceptor to add JWT token to all requests
  setupInterceptor() {
    console.log('🔗 Setting up JWT axios interceptor...');
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        console.log('🔄 Interceptor running for:', config.url);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Authorization header added:', 'Bearer ' + token.substring(0, 30) + '...');
        } else {
          console.warn('⚠️ No token found in localStorage for URL:', config.url);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    console.log('✅ JWT interceptor setup complete');

    // Handle 401 responses (token expired)
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await axios.post(`${API_URL}/refresh-token`, {
                refreshToken
              });

              if (response.data.token) {
                this.setTokens(response.data.token, response.data.refreshToken);
                originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
                return axios(originalRequest);
              }
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.clearTokens();
            window.location.href = '/admin-login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }
}

export default new JWTService();
