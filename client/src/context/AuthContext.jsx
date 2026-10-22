import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nivara_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('nivara_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, user: userData, profile: profileData } = response.data;

      localStorage.setItem('nivara_token', token);
      localStorage.setItem('nivara_user', JSON.stringify(userData));
      if (profileData) {
        localStorage.setItem('nivara_profile', JSON.stringify(profileData));
      }

      setUser(userData);
      setProfile(profileData || null);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed. Please verify credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Register patient handler
  const register = async (formData) => {
    setLoading(true);
    try {
      const response = await API.post('/auth/register', formData);
      const { token, user: userData, profile: profileData } = response.data;

      localStorage.setItem('nivara_token', token);
      localStorage.setItem('nivara_user', JSON.stringify(userData));
      if (profileData) {
        localStorage.setItem('nivara_profile', JSON.stringify(profileData));
      }

      setUser(userData);
      setProfile(profileData || null);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed. Please check your details.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('nivara_token');
    localStorage.removeItem('nivara_user');
    localStorage.removeItem('nivara_profile');
    setUser(null);
    setProfile(null);
    API.post('/auth/logout').catch(() => {});
  };

  const isAuthenticated = !!user;
  const isPatient = user?.role === 'patient';
  const isWorker = user?.role === 'healthcare_worker';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        isPatient,
        isWorker,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
