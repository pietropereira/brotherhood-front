import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    // 🕵️‍♂️ Checagem robusta: varre os segmentos para ver se "login" ou "register" estão ativos
    const isAuthRoute = segments.includes('login') || segments.includes('register') || segments.includes('(auth)');

    if (!user && !isAuthRoute) {
      // 🔐 Se NÃO está logado e NÃO está nas telas de acesso, força ir para o Login
      router.replace('/login');
    } 
    else if (user && isAuthRoute) {
      // 🔓 Se JÁ está logado e tenta ir para telas de acesso, joga para o Feed
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#121214', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00B37E" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="chat/[id]" />
      <Stack.Screen name="new-topic" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
