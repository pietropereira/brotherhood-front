import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { io } from 'socket.io-client';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/services/api';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: {
    nickname: string;
    avatarUrl: string | null;
  };
}

interface ChatDetails {
  topic: { title: string; author: { nickname: string } };
  participant: { nickname: string };
}

const socket = io('http://192.168.1.6:3334'); 

export default function PrivateChat() {
  const { id: chatId } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInfo, setChatInfo] = useState<ChatDetails | null>(null); // Dados do header
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Carrega o histórico e descobre as informações do Chat (para o Header dinâmico)
  async function loadChatData() {
    try {
      // 1. Busca as mensagens
      const messagesResponse = await api.get(`/chats/${chatId}/messages`);
      setMessages(messagesResponse.data);

      // 2. Busca os dados de contexto do chat (Bate no GET /chats/me e filtra o atual)
      const inboxResponse = await api.get('/chats/me');
      const currentChat = inboxResponse.data.find((c: any) => c.id === chatId);
      if (currentChat) {
        setChatInfo(currentChat);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do chat:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadChatData();
    socket.emit('join_chat', chatId);

    socket.on('new_message', (message: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      socket.off('new_message');
    };
  }, [chatId]);

  async function handleSendMessage() {
    if (!newMessage.trim()) return;

    const textToSend = newMessage;
    setNewMessage('');

    try {
      await api.post('/chats/message', {
        chatId,
        content: textToSend
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  }

  // 🕵️‍♂️ Descobre o nome do irmão parceiro de conversa para exibir no topo
  const isIAmTopicAuthor = chatInfo?.topic.author.nickname === user?.nickname;
  const partnerNickname = isIAmTopicAuthor 
    ? chatInfo?.participant.nickname 
    : chatInfo?.topic.author.nickname;

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isMine = item.senderId === user?.id;

    let formattedTime = '';
    try {
      formattedTime = new Date(item.createdAt).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      formattedTime = '--:--';
    }

    return (
      <View style={[styles.messageWrapper, isMine ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
        <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.theirBubble]}>
          <Text style={styles.messageText}>{String(item.content)}</Text>
          <Text style={[styles.messageTime, isMine ? styles.myTime : styles.theirTime]}>{formattedTime}</Text>
        </View>
      </View>
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
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? 35 : 0 }]}>
      <StatusBar style="light" backgroundColor="#202024" translucent={false} />

      {/* 👑 HEADER PREMIUM DINÂMICO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.headerInfoContainer}>
          <Text style={styles.headerTitle}>{partnerNickname || 'Irmão Anônimo'}</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            💬 Fórum: {chatInfo?.topic.title || 'Carregando contexto...'}
          </Text>
        </View>

        {/* Círculo com iniciais discreto no header */}
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {partnerNickname ? String(partnerNickname).substring(0, 2).toUpperCase() : 'AN'}
          </Text>
        </View>
      </View>

      {/* LINHA DO TEMPO */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* BARRA DE INPUT PREMIUM COM SOMBRA */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escreva uma mensagem de apoio..."
            placeholderTextColor="#7C7C8A"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} activeOpacity={0.8}>
            <Ionicons name="send" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214' },
  loadingContainer: { flex: 1, backgroundColor: '#121214', justifyContent: 'center', alignItems: 'center' },
  
  // Header Premium
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#202024', 
    height: 64, 
    paddingHorizontal: 16, 
    borderBottomWidth: 1, 
    borderColor: '#323238', 
    marginTop: Platform.OS === 'ios' ? 40 : 0 
  },
  backButton: { padding: 4 },
  headerInfoContainer: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  headerSubtitle: { color: '#00B37E', fontSize: 11, fontWeight: '600', marginTop: 2, maxWidth: '90%' },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A3F30', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#00B37E' },
  headerAvatarText: { color: '#00B37E', fontWeight: 'bold', fontSize: 12 },

  // Lista e Balões de Mensagem
  messagesList: { padding: 16, paddingBottom: 24 },
  messageWrapper: { marginBottom: 12, maxWidth: '82%' },
  myMessageWrapper: { alignSelf: 'flex-end' },
  theirMessageWrapper: { alignSelf: 'flex-start' },
  
  messageBubble: { 
    borderRadius: 16, 
    paddingHorizontal: 14, 
    paddingVertical: 10,
    position: 'relative'
  },
  // ⚡ Design "Bicudo" de Canto Arredondado Profissional
  myBubble: { 
    backgroundColor: '#00B37E', 
    borderTopRightRadius: 4, // Canto suavizado na ponta interna
  },
  theirBubble: { 
    backgroundColor: '#202024', 
    borderWidth: 1, 
    borderColor: '#323238', 
    borderTopLeftRadius: 4, 
  },
  
  messageText: { color: '#FFF', fontSize: 15, lineHeight: 20 },
  messageTime: { fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },
  myTime: { color: '#E1E1E6' },
  theirTime: { color: '#7C7C8A' },

  // Input Container
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16,
    paddingVertical: 12, 
    backgroundColor: '#202024', 
    borderTopWidth: 1, 
    borderColor: '#323238',
    paddingBottom: Platform.OS === 'android' ? 24 : 12,
  },
  input: { 
    flex: 1, 
    backgroundColor: '#121214', 
    color: '#FFF', 
    borderRadius: 22, 
    paddingHorizontal: 16, 
    paddingTop: 10, 
    paddingBottom: 10, 
    fontSize: 15, 
    maxHeight: 100, 
    borderWidth: 1, 
    borderColor: '#323238' 
  },
  sendButton: { 
    backgroundColor: '#00B37E', 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 12 
  }
});
