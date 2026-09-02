import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

// Criamos um componente interno para gerenciar a navegação baseada no estado de login
function RootLayoutNav() {
  const { loading } = useAuth();

  // Se estiver carregando o token do SecureStore, mostra um loading na tela
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#121214', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00B37E" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Grupo de rotas deslogadas */}
      <Stack.Screen name="(auth)" />
      {/* Grupo de rotas logadas com as abas inferiores */}
      <Stack.Screen name="(tabs)" />
      {/* Rota da tela de chat privada */}
      <Stack.Screen name="chat/[id]" />
    </Stack>
  );
}

// O componente principal apenas envelopa tudo com o Provider global
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
