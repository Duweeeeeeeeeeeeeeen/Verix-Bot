import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const BASE_API_URL = typeof window !== 'undefined' 
  ? '' 
  : 'http://localhost:5001';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentGuildId, setCurrentGuildId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('lastGuildId');
    if (stored) setCurrentGuildId(stored);
    
    // Load cached user to prevent flickering
    const cachedUser = localStorage.getItem('verix_user_cache');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
        setLoading(false); // Can stop loading immediately if we have cache
      } catch (e) {
        localStorage.removeItem('verix_user_cache');
      }
    }
  }, []);

  const updateGuildId = (id) => {
    if (!id) return;
    setCurrentGuildId(id);
    localStorage.setItem('lastGuildId', id);
  };

  const fetchUser = async () => {
    try {
      const res = await fetch(`${BASE_API_URL}/api/auth/user`, {
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        // Cache for next time
        localStorage.setItem('verix_user_cache', JSON.stringify(data));
      } else {
        setUser(null);
        localStorage.removeItem('verix_user_cache');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = () => {
    window.location.href = `${BASE_API_URL}/api/auth/login`;
  };

  const logout = async () => {
    await fetch(`${BASE_API_URL}/api/auth/logout`, { credentials: 'include' });
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, currentGuildId, updateGuildId }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
