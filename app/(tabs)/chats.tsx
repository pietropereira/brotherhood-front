import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router'; // 👈 Importamos o useFocusEffect
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/services/api';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
}

interface Chat {
  id: string;
  hasUnread: boolean;
  messages: Message[];
  participant: { nickname: string; avatarUrl: string | null };
  topic: {
    title: string;
    author: { nickname: string; avatarUrl: string | null };
  };
}

export default function Chats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const { user } = useAuth();

  // Função que busca os canais ativos na API
  async function loadChats() {
    try {
      const response = await api.get('/chats/me');
      const data = response.data as Chat[];

      // ⚡ ORDENAÇÃO DINÂMICA DE MERCADO: 
      // Compara a data da última mensagem de cada chat e coloca os mais recentes no TOPO
      const sortedChats = data.sort((a, b) => {
        const timeA = a.messages && a.messages.length > 0 ? new Date(a.messages[0].createdAt).getTime() : 0;
        const timeB = b.messages && b.messages.length > 0 ? new Date(b.messages[0].createdAt).getTime() : 0;
        return timeB - timeA; // Decrescente (Mais novo primeiro)
      });

      setChats(sortedChats);
    } catch (error) {
      console.error('Erro ao carregar canais de chat:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // 🔁 useFocusEffect: Atualiza as conversas e tira a borda verde no exato momento 
  // em que o irmão clica na aba de Conversas ou volta de um chat privado!
  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [])
  );

  function handleRefresh() {
    setRefreshing(true);
    loadChats();
  }

  const renderChatItem = ({ item }: { item: Chat }) => {
    const isIAmTopicAuthor = item.topic.author.nickname === user?.nickname;
    const chatPartner = isIAmTopicAuthor ? item.participant : item.topic.author;
    
    const lastMessageObj = item.messages && item.messages.length > 0 ? item.messages[0] : null;
    const lastMessageContent = lastMessageObj ? lastMessageObj.content : 'Nenhuma mensagem enviada.';

    let messageTime = '';
    if (lastMessageObj) {
      try {
        messageTime = new Date(lastMessageObj.createdAt).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        messageTime = '';
      }
    }

    return (
      <TouchableOpacity 
        style={[styles.chatCard, item.hasUnread && styles.unreadChatCard]} 
        onPress={() => router.push(`/chat/${item.id}`)}
        activeOpacity={0.7}
      >
        {/* 🛡️ RENDERIZADOR DE AVATAR COM LETRAS INICIAIS */}
            <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#1A3F30', // Fundo verde escuro premium
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#00B37E'
            }}>
            <Text style={{
                color: '#00B37E',
                fontWeight: 'bold',
                fontSize: 14,
                textTransform: 'uppercase'
            }}>
                {/* Pega as duas primeiras letras do Nickname de forma segura */}
                {chatPartner?.nickname ? chatPartner.nickname.substring(0, 2) : 'AN'}
            </Text>
            </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeaderRow}>
            <Text style={styles.partnerName} numberOfLines={1}>
              {chatPartner.nickname}
            </Text>
            <Text style={[styles.timeText, item.hasUnread && styles.unreadTimeText]}>
              {messageTime}
            </Text>
          </View>

          <Text style={styles.topicContext} numberOfLines={1}>
            Fórum: {item.topic.title}
          </Text>

          <Text style={[styles.lastMessageText, item.hasUnread && styles.unreadMessageText]} numberOfLines={1}>
            {lastMessageContent}
          </Text>
        </View>

        <Ionicons 
          name="chevron-forward" 
          size={16} 
          color={item.hasUnread ? '#00B37E' : '#323238'} 
          style={styles.chevron} 
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B37E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00B37E" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color="#323238" />
            <Text style={styles.emptyTitle}>Nenhuma conversa</Text>
            <Text style={styles.emptyText}>Você ainda não iniciou ou recebeu apoios privados.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214' },
  loadingContainer: { flex: 1, backgroundColor: '#121214', justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16, paddingBottom: 40 },
  chatCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#202024', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#29292E' },
  unreadChatCard: { borderColor: '#00B37E', borderWidth: 1.5 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1A3F30', borderWidth: 1, borderColor: '#00B37E' },
  chatInfo: { flex: 1, marginLeft: 14 },
  chatHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  partnerName: { color: '#FFF', fontSize: 15, fontWeight: 'bold', letterSpacing: 0.1, flex: 1, marginRight: 8 },
  timeText: { color: '#7C7C8A', fontSize: 11, fontWeight: '500' },
  unreadTimeText: { color: '#00B37E', fontWeight: 'bold' },
  topicContext: { color: '#7C7C8A', fontSize: 12, fontWeight: '500', marginBottom: 4 },
  lastMessageText: { color: '#8D8D99', fontSize: 13, lineHeight: 18 },
  unreadMessageText: { color: '#FFF', fontWeight: '600' },
  chevron: { marginLeft: 8 },
  emptyContainer: { alignItems: 'center', justifyContext: 'center', marginTop: 120, paddingHorizontal: 32 },
  emptyTitle: { color: '#E1E1E6', fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  emptyText: { color: '#7C7C8A', fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 8 },
});
