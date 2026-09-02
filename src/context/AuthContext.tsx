import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { api } from '../services/api';

// 🕵️‍♂️ Helper para salvar dados aceitando Web e Mobile
const storage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      return localStorage.setItem(key, value);
    }
    return await SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key: string) {
    if (Platform.OS === 'web') {
      return localStorage.removeItem(key);
    }
    return await SecureStore.deleteItemAsync(key);
  }
};

interface User {
  id: string;
  nickname: string;
  avatarUrl: string | null;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadStorageData() {
      const storageToken = await storage.getItem('brotherhood_token');
      const storageUser = await storage.getItem('brotherhood_user');

      if (storageToken && storageUser) {
        setUser(JSON.parse(storageUser));
      }
      setLoading(false);
    }

    loadStorageData();
  }, []);

  const signIn = async ({ email, password }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: loggedUser } = response.data;

      await storage.setItem('brotherhood_token', token);
      await storage.setItem('brotherhood_user', JSON.stringify(loggedUser));

      setUser(loggedUser);
      router.replace('/(tabs)');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Falha ao realizar login.';
      throw new Error(message);
    }
  };

  const signOut = async () => {
    await storage.deleteItem('brotherhood_token');
    await storage.deleteItem('brotherhood_user');
    setUser(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
