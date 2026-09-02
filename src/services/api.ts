import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';


const MACHINE_IP = '192.168.1.6'; 

export const api = axios.create({
  baseURL: `http://${MACHINE_IP}:3334`, // Porta 3334 do Brotherhood Backend
});

api.interceptors.request.use(async (config) => {
  // Lê do localStorage se for Web, ou do SecureStore se for celular
  const token = Platform.OS === 'web' 
    ? localStorage.getItem('brotherhood_token')
    : await SecureStore.getItemAsync('brotherhood_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});
