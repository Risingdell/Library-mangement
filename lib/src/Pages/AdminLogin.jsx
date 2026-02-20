import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import sitLogo from '../assets/sit2.jpg';
import deepRightImg from '../assets/branch.png';
import jwtService from '../services/jwtService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/admin/login`, { username, password });

      // Extract token and refreshToken from new response format
      if (res.data.success && res.data.data?.token) {
        const { token, refreshToken } = res.data.data;

        // Store tokens in localStorage
        jwtService.setTokens(token, refreshToken);

        // Navigate to dashboard
        navigate('/admin-dashboard');
      } else {
        setError('Unexpected response format from server');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">

      <div className="admin-login-card">
        <h2 className="admin-login-title">Admin Login</h2>
        <p className="admin-login-subtitle">Access administrator dashboard</p>

        {error && (
          <div className="admin-error-message">
            {error}
          </div>
        )}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-input-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              autoComplete="username"
            />
          </div>

          <div className="admin-input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="admin-login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login to Dashboard'}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>Administrator Access Only</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
