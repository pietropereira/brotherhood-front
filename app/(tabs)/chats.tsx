import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

interface Chat {
  id: string;
  createdAt: string;
  topicId: string;
  participantId: string;
  topic: {
    id: string;
    title: string;
    category: string;
    author: {
      nickname: string;
      avatarUrl: string | null;
    };
  };
  participant: {
    nickname: string;
    avatarUrl: string | null;
  };
  messages: Array<{
    content: string;
    createdAt: string;
  }>;
}

export default function ChatsInbox() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();

  // Carrega todos os chats vinculados ao irmão logado
  async function loadInbox() {
    try {
      const response = await api.get('/chats/me');
      setChats(response.data);
    } catch (error) {
      console.error('Erro ao carregar caixa de entrada:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadInbox();
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    loadInbox();
  }

  const renderChatItem = ({ item }: { item: Chat }) => {
    // 🕵️‍♂️ Lógica de Anonimato Cruzado: 
    // Se EU sou o autor do tópico, o interlocutor que aparece para mim é o "participant".
    // Se EU sou o participante (leitor), o interlocutor é o "author" do tópico.
    const isIAmTopicAuthor = item.topic.author.nickname === user?.nickname;
    const chatPartner = isIAmTopicAuthor ? item.participant : item.topic.author;

    // Pega o preview da última mensagem trocada
    const lastMessage = item.messages?.[0]?.content || 'Nenhuma mensagem enviada.';
    
    // Formata o horário de forma amigável
    let messageTime = '';
    if (item.messages?.[0]?.createdAt) {
      try {
        messageTime = new Date(item.messages[0].createdAt).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        messageTime = '';
      }
    }

    return (
      <TouchableOpacity 
        style={styles.chatCard} 
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

        {/* Informações da Conversa */}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeaderRow}>
            <Text style={styles.partnerName} numberOfLines={1}>
              {chatPartner.nickname}
            </Text>
            <Text style={styles.timeText}>{messageTime}</Text>
          </View>

          {/* Contexto do Tópico Original */}
          <Text style={styles.topicContext} numberOfLines={1}>
            Fórum: {item.topic.title}
          </Text>

          {/* Preview da Mensagem */}
          <Text style={styles.lastMessageText} numberOfLines={1}>
            {lastMessage}
          </Text>
        </View>

        {/* Indicador de Setinha Lateral */}
        <Ionicons name="chevron-forward" size={16} color="#323238" style={styles.chevron} />
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
            <Text style={styles.emptyTitle}>Sua caixa está vazia</Text>
            <Text style={styles.emptyText}>
              Quando você apoiar o desabafo de alguém ou começarem uma conversa no seu post, os canais privados aparecerão aqui.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121214',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202024',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#323238',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#323238',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 14,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partnerName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    color: '#7C7C8A',
    fontSize: 12,
  },
  topicContext: {
    color: '#00B37E',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 4,
  },
  lastMessageText: {
    color: '#8D8D99',
    fontSize: 13,
  },
  chevron: {
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: '#E1E1E6',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyText: {
    color: '#7C7C8A',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
});
