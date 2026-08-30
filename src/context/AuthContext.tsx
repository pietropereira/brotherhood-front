import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

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

  // Verifica se já existe um token salvo ao iniciar o app
  useEffect(() => {
    async function loadStorageData() {
      const storageToken = await SecureStore.getItemAsync('brotherhood_token');
      const storageUser = await SecureStore.getItemAsync('brotherhood_user');

      if (storageToken && storageUser) {
        setUser(JSON.parse(storageUser));
      }
      setLoading(false);
    }

    loadStorageData();
  }, []);

  // Função de Login integrada com a nossa API back
  const signIn = async ({ email, password }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: loggedUser } = response.data;

      // Salva os dados de forma segura no dispositivo
      await SecureStore.setItemAsync('brotherhood_token', token);
      await SecureStore.setItemAsync('brotherhood_user', JSON.stringify(loggedUser));

      setUser(loggedUser);
      
      // Redireciona o usuário direto para o Feed de tópicos logado
      router.replace('/(tabs)');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Falha ao realizar login.';
      throw new Error(message);
    }
  };

  // Função de Logout (Limpa o celular e manda para o login)
  const signOut = async () => {
    await SecureStore.deleteItemAsync('brotherhood_token');
    await SecureStore.deleteItemAsync('brotherhood_user');
    setUser(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso nas telas
export function useAuth() {
  return useContext(AuthContext);
}
