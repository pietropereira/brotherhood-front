import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#121214',
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
          backgroundColor: '#121214',
          borderTopWidth: 1,
          borderTopColor: '#202024',
          // 🛠️ Ajuste clínico de altura para dar espaço ao texto e ícone sem quebrar
          height: Platform.OS === 'ios' ? 88 : 64, 
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#00B37E',
        tabBarInactiveTintColor: '#7C7C8A',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2, // Espaço entre o ícone e o texto
        },
      }}
    >
      {/* 1. Feed */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          headerTitle: '🚀 Brotherhood Feed',
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'newspaper' : 'newspaper-outline'} 
              size={22} 
              color={color} 
            />
          ),
        }}
      />

      {/* 2. Conversas */}
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Conversas',
          headerTitle: '💬 Canais Privados',
          tabBarLabel: 'Conversas',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'} 
              size={22} 
              color={color} 
            />
          ),
        }}
      />

      {/* 3. Perfil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerTitle: '🛡️ Seu Refúgio',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={22} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
