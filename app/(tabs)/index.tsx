import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { api } from '../../src/services/api';

interface Topic {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  author: {
    nickname: string;
    avatarUrl: string | null;
  };
}

export default function Feed() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Busca os tópicos salvos no backend (porta 3334)
  async function fetchTopics() {
    try {
      const response = await api.get('/topics');
      setTopics(response.data);
    } catch (error) {
      console.error('Erro ao buscar tópicos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchTopics();
  }, []);

  // Recarrega o feed quando o usuário arrasta a tela para baixo (Pull to Refresh)
  function handleRefresh() {
    setRefreshing(true);
    fetchTopics();
  }

  // Lógica para abrir o chat privado ao clicar em um desabafo
  async function handleOpenChat(topicId: string) {
    // Implementaremos a navegação para o chat no próximo passo!
    console.log('Abrir conversa privada para o tópico:', topicId);
  }

  // Renderiza cada card de desabafo individualmente
  const renderItem = ({ item }: { item: Topic }) => (
    <View style={styles.card}>
      {/* Header do Card (Dados Anônimos do Autor) */}
      <View style={styles.cardHeader}>
        <Image 
          source={{ uri: item.author.avatarUrl || 'https://dicebear.com' }} 
          style={styles.avatar} 
        />
        <View style={styles.authorInfo}>
          <Text style={styles.nickname}>{item.author.nickname}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
        </View>
        {/* Badge da Categoria */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>

      {/* Conteúdo do Desabafo */}
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardContent}>{item.content}</Text>

      {/* Botão de Ação: Apoiar no Privado */}
      <TouchableOpacity style={styles.chatButton} onPress={() => handleOpenChat(item.id)}>
        <Ionicons name="chatbubble-ellipses-outline" size={18} color="#00B37E" />
        <Text style={styles.chatButtonText}>Apoiar no Privado</Text>
      </TouchableOpacity>
    </View>
  );

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
        data={topics}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00B37E" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={48} color="#323238" />
            <Text style={styles.emptyText}>Nenhum desabafo compartilhado ainda.</Text>
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
  card: {
    backgroundColor: '#202024',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#323238',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#323238',
  },
  authorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nickname: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  date: {
    color: '#7C7C8A',
    fontSize: 11,
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: '#29292E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#00B37E',
  },
  categoryText: {
    color: '#00B37E',
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardContent: {
    color: '#C4C4CC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29292E',
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#323238',
  },
  chatButtonText: {
    color: '#E1E1E6',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#7C7C8A',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
});
