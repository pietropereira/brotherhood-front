import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// 🚨 SUBSTITUA PELO IP REAL DA SUA MÁQUINA (Rode ipconfig no CMD)
const MACHINE_IP = '192.168.1.6'; 

export const api = axios.create({
  baseURL: `http://${MACHINE_IP}:3334`, // Porta 3334 do Brotherhood Backend
});

// Injeta automaticamente o token em toda requisição se ele existir no SecureStore
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('brotherhood_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});
