import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (token) => {
    try {
      setLoading(true);
      // Skip verification if your backend doesn't provide this endpoint
      localStorage.setItem('teacherToken', token);
      setIsAuthenticated(true);
      // Set basic user data if needed
      setUser({ role: 'teacher' }); 
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('teacherToken');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = {
    isAuthenticated,
    setUser,
    user,
    loading,
    login,  // Make sure this is included
    // Add other auth functions like logout if needed
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

