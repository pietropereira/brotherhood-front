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
          ...Platform.select({
            web: {
              height: 56,
              paddingBottom: 6,
              paddingTop: 6,
            },
            ios: {
              height: 88,
              paddingBottom: 28,
              paddingTop: 10,
            },
            android: {
              height: 76,
              paddingBottom: 20,
              paddingTop: 10,
            }
          }),
        },
        tabBarActiveTintColor: '#00B37E',
        tabBarInactiveTintColor: '#7C7C8A',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: Platform.OS === 'android' ? 2 : 4,
        },
      }}
    >
      {/* 1. Feed Principal */}
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

      {/* 2. Caixa de Entrada Privada */}
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

      {/* 3. Refúgio do Perfil */}
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
