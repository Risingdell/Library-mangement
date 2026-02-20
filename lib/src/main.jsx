import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";

import { UserProvider } from './Context/UserContext.jsx'
import { AuthProvider } from './Context/AuthProvider.jsx'
import { SnackbarProvider } from './Context/SnackbarContext.jsx'
import { ThemeProvider } from './Context/ThemeContext.jsx'
import jwtService from './services/jwtService.js'

// Initialize JWT interceptor when app starts
jwtService.setupInterceptor();


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <SnackbarProvider>
          <UserProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </UserProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
