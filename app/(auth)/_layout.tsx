import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false, // Remove headers duplicados nas telas de login/cadastro
        animation: 'slide_from_right' // Animação suave padrão de deslizar
      }} 
    />
  );
}
