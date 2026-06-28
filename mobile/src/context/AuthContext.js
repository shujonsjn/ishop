import React, { createContext, useState, useEffect } from 'react';
import { getUser, clearUser, setToken, setUser } from '../api/client';
import { api } from '../api/client';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser().then((u) => {
      setUserState(u);
      setLoading(false);
    });
  }, []);

  const login = async (email, password) => {
    const res = await api('POST', '/users/login', { email, password });
    await setToken(res.token);
    await setUser(res.user);
    setUserState(res.user);
    return res;
  };

  const register = async (name, email, phone, password) => {
    const res = await api('POST', '/users/register', { name, email, phone, password });
    await setToken(res.token);
    await setUser(res.user);
    setUserState(res.user);
    return res;
  };

  const logout = async () => {
    await clearUser();
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
