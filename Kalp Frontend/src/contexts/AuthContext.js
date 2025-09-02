import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API base URL
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:5000';

// API Endpoints
const ENDPOINTS = {
  AUTH_PROFILE: process.env.REACT_APP_AUTH_PROFILE_ENDPOINT || '/api/v2/auth/profile',
  AUTH_REGISTER: process.env.REACT_APP_AUTH_REGISTER_ENDPOINT || '/api/v2/auth/register',
  AUTH_LOGIN: process.env.REACT_APP_AUTH_LOGIN_ENDPOINT || '/api/v2/auth/login',
  AUTH_GOOGLE: process.env.REACT_APP_AUTH_GOOGLE_ENDPOINT || '/api/v2/auth/google',
  AUTH_LOGOUT: process.env.REACT_APP_AUTH_LOGOUT_ENDPOINT || '/api/auth/logout',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  // Check if user is authenticated on app load
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}${ENDPOINTS.AUTH_PROFILE}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Invalid token, remove it
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    try {
      const response = await fetch(`${API_BASE}${ENDPOINTS.AUTH_REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username: name, 
          displayName: name,
          email, 
          password, 
          confirmPassword 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token and user data
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setUser(data.user);

      return data;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Login attempt:', { email, API_BASE });
      
      const response = await fetch(`${API_BASE}${ENDPOINTS.AUTH_LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      console.log('Login response status:', response.status);

      const data = await response.json();
      console.log('Login response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setUser(data.user);

      console.log('Login successful, user set:', data.user);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const googleLogin = async () => {
    try {
      // This would typically use Google OAuth library
      // For now, we'll simulate a Google login flow
      return new Promise((resolve, reject) => {
        // Initialize Google OAuth (you'll need to add Google OAuth script to your HTML)
        if (window.google && window.google.accounts) {
          window.google.accounts.id.initialize({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            callback: async (response) => {
              try {
                // Decode the JWT token from Google
                const userObject = JSON.parse(atob(response.credential.split('.')[1]));
                
                // Send to backend
                const backendResponse = await fetch(`${API_BASE}${ENDPOINTS.AUTH_GOOGLE}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    googleId: userObject.sub,
                    email: userObject.email,
                    displayName: userObject.name,
                    avatar: userObject.picture
                  })
                });

                const data = await backendResponse.json();

                if (!backendResponse.ok) {
                  throw new Error(data.message || 'Google authentication failed');
                }

                // Store token and user data
                localStorage.setItem('authToken', data.token);
                setToken(data.token);
                setUser(data.user);

                resolve(data);
              } catch (error) {
                reject(error);
              }
            }
          });

          // Prompt the user to select an account
          window.google.accounts.id.prompt();
        } else {
          // Fallback: show error message about Google OAuth not being loaded
          reject(new Error('Google OAuth not available. Please ensure you have internet connection.'));
        }
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Optional: notify backend about logout
      if (token) {
        await fetch(`${API_BASE}${ENDPOINTS.AUTH_LOGOUT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local data
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const response = await fetch(`${API_BASE}${ENDPOINTS.AUTH_PROFILE}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    googleLogin,
    logout,
    updateProfile,
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
