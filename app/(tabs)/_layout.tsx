import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#121214', // Fundo do header superior
          borderBottomWidth: 1,
          borderBottomColor: '#202024',
        },
        headerTitleStyle: {
          color: '#FFF',
          fontWeight: 'bold',
          fontSize: 18,
          letterSpacing: 0.5,
        },
        tabBarStyle: {
          backgroundColor: '#121214', // Fundo da barra inferior
          borderTopWidth: 1,
          borderTopColor: '#202024',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#00B37E',   // Cor do ícone ativo (Verde Brotherhood)
        tabBarInactiveTintColor: '#7C7C8A', // Cor do ícone inativo (Cinza)
      }}
    >
      {/* Aba 1: Feed de Tópicos Públicos */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          headerTitle: '🚀 Brotherhood Feed',
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'newspaper' : 'newspaper-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />

      {/* Aba 2: Caixa de Entrada de Chats Privados */}
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Conversas',
          headerTitle: '💬 Canais Privados',
          tabBarLabel: 'Conversas',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
