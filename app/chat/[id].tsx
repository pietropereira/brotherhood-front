import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import {
//   ActivityIndicator,
//   FlatList,
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from 'react-native';
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

const socket = io('http://192.168.1.6:3334'); 

export default function PrivateChat() {
  const { id: chatId } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Carrega o histórico inicial do banco
  async function loadMessages() {
    try {
      const response = await api.get(`/chats/${chatId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();

    // 2. Conecta na sala exclusiva desse chat no backend
    socket.emit('join_chat', chatId);

    // 3. Escuta quando uma nova mensagem chegar (seja minha ou do outro irmão)
    socket.on('new_message', (message: Message) => {
      // Evita duplicar na tela se fui eu mesmo quem enviei (já que o handleSendMessage já adiciona local)
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    // Limpa os ouvintes ao sair da tela para não acumular memória
    return () => {
      socket.off('new_message');
    };
  }, [chatId]);

  async function handleSendMessage() {
    if (!newMessage.trim()) return;

    const textToSend = newMessage;
    setNewMessage('');

    try {
      // O POST dispara, o back salva no banco e o back se encarrega de emitir via socket para todos na sala
      await api.post('/chats/message', {
        chatId,
        content: textToSend
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  }

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
      {/* 🔐 Blindagem com item.sender?.nickname para evitar quebras se o socket atrasar */}
      {!isMine && <Text style={styles.senderName}>{String(item.sender?.nickname || 'Irmão Anônimo')}</Text>}
      
      <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.theirBubble]}>
        <Text style={styles.messageText}>{String(item.content)}</Text>
      </View>
      <Text style={styles.messageTime}>{formattedTime}</Text>
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
  // 🛡️ O SafeAreaView garante que nada suba na câmera ou desça nos botões do Xiaomi
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? 35 : 0 }]}>
      {/* 💡 A StatusBar garante que o conteúdo do chat não brigue com os ícones de bateria/relógio */}
      <StatusBar style="light" backgroundColor="#202024" translucent={false} />
     <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header Customizado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔒 Chat de Apoio Realtime</Text>
        <View style={styles.spacer} />
      </View>

      {/* Linha do Tempo */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Barra de Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escreva uma mensagem de apoio..."
          placeholderTextColor="#666"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </View>
  );

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214' },
  loadingContainer: { flex: 1, backgroundColor: '#121214', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#202024', height: 60, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#323238', marginTop: Platform.OS === 'ios' ? 40 : 0 },
  backButton: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  spacer: { width: 24 },
  messagesList: { padding: 16, paddingBottom: 24 },
  messageWrapper: { marginBottom: 16, maxWidth: '80%' },
  myMessageWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  theirMessageWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  senderName: { color: '#00B37E', fontSize: 12, fontWeight: '600', marginBottom: 4, marginLeft: 4 },
  messageBubble: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  myBubble: { backgroundColor: '#00B37E', borderBottomRightRadius: 0 },
  theirBubble: { backgroundColor: '#202024', borderWidth: 1, borderColor: '#323238', borderBottomLeftRadius: 0 },
  messageText: { color: '#FFF', fontSize: 15, lineHeight: 20 },
  messageTime: { color: '#7C7C8A', fontSize: 10, marginTop: 4, marginHorizontal: 4 },
  input: { flex: 1, backgroundColor: '#121214', color: '#FFF', borderRadius: 24, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, fontSize: 15, maxHeight: 100, borderWidth: 1, borderColor: '#323238' },
  sendButton: { backgroundColor: '#00B37E', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
    inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#202024',
    borderTopWidth: 1,
    borderTopColor: '#323238',
    
    // 🛠️ Calibragem cirúrgica para o input subir e desgrudar dos botões do Xiaomi
    paddingBottom: Platform.OS === 'android' ? 24 : 12, 
  },
});
