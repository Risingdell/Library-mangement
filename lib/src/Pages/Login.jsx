// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../Context/UserContext";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { useSnackbar } from "../Context/SnackbarContext";
import sitLogo from '../assets/sit2.jpg';
import deepRightImg from '../assets/branch.png';
import jwtService from '../services/jwtService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Login() {
  const { setUser } = useContext(UserContext);
  const { showSnackbar } = useSnackbar();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password
      });

      // Extract token and refreshToken from new response format
      if (response.data.success && response.data.data?.token) {
        const { token, refreshToken, user } = response.data.data;

        // Store tokens in localStorage
        jwtService.setTokens(token, refreshToken);

        // Update user context
        setUser({ username: user.username, id: user.id, email: user.email });
        setLoginStatus(`Welcome, ${user.username}!`);

        // Clear form
        setUsername('');
        setPassword('');

        // Navigate to main page
        navigate('/main');
      } else {
        setLoginStatus('Unexpected response format from server');
        showSnackbar('error', 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error("Error logging in:", error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setLoginStatus(errorMessage);
      showSnackbar('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="login-container">

      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to access your library</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="register-prompt">
          Don't have an account? <Link to="/register" className="register-link">Register</Link>
        </div>

        {loginStatus && (
          <div className="login-status">
            {loginStatus}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
