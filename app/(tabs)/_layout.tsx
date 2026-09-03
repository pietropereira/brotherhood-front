import { Ionicons } from '@expo/vector-icons';
import { Tabs, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/services/api';

export default function TabsLayout() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // 🕵️‍♂️ Busca os chats e calcula quantos possuem pendência real de leitura pelo banco
  async function checkUnreadMessages() {
    if (!user?.id) return;

    try {
      const response = await api.get('/chats/me');
      const chats = response.data;

      // 🔥 Filtra e conta quantos canais de chat estão marcados com hasUnread === true
      const totalUnread = chats.filter((chat: any) => chat.hasUnread === true).length;

      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Erro ao calcular badges de mensagens:', error);
    }
  }

  // 🔁 useFocusEffect: Atualiza instantaneamente ao mudar de aba + Polling de 10 segundos
  useFocusEffect(
    useCallback(() => {
      checkUnreadMessages();

      const interval = setInterval(() => {
        checkUnreadMessages();
      }, 10000);

      return () => clearInterval(interval);
    }, [user?.id])
  );

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
          // 🔴 BADGE REAL INTELIGENTE: Acende apenas se o banco de dados acusar não lidos
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#F75A68',
            color: '#FFF',
            fontSize: 10,
            fontWeight: 'bold',
            lineHeight: 14,
          },
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
