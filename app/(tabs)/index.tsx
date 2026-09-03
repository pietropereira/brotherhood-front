import { useAlert } from '@/src/context/AlertContext';
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

interface Topic {
  id: string;
  title: string;
  content: string;
  category: string;
  authorId: string;
  createdAt: string;
  author: {
    nickname: string;
    avatarUrl: string | null;
  };
}

// Lista de categorias comerciais alinhadas com o debate estratégico
const CATEGORIES = ['Tudo', 'Depressão', 'Serviço', 'Ansiedade', 'Outros'];

export default function Feed() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Tudo'); // Estado do filtro ativo
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  // Busca os tópicos aplicando o filtro de categoria se não for 'Tudo'
  async function fetchTopics(categoryName = 'Tudo') {
    try {
      setLoading(true);
      // Se for diferente de 'Tudo', anexa a query string ex: /topics?category=Ansiedade
      const url = categoryName === 'Tudo' ? '/topics' : `/topics?category=${encodeURIComponent(categoryName)}`;
      const response = await api.get(url);
      setTopics(response.data);
    } catch (error) {
      console.error('Erro ao buscar tópicos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Monitora a troca de abas/filtros para disparar a busca automática no banco
  useEffect(() => {
    fetchTopics(selectedCategory);
  }, [selectedCategory]);

  function handleRefresh() {
    setRefreshing(true);
    fetchTopics(selectedCategory);
  }

  // Altera a categoria ativa ao clicar no carrossel
  function handleSelectCategory(categoryName: string) {
    setSelectedCategory(categoryName);
  }

  async function handleOpenChat(topicId: string) {
    try {
      const response = await api.post('/chats', { topicId });
      const { id: chatId } = response.data;
      router.push(`/chat/${chatId}`);
    } catch (error: any) {
       showAlert({
          title: 'Atenção',
          description: 'Não foi possível iniciar a conversa.',
          confirmText: 'OK',
          cancelText: '',
        });
    }
  }

  const renderItem = ({ item }: { item: Topic }) => {
    const isMyOwnPost = item.authorId === user?.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>

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
                {item.author?.nickname ? item.author.nickname.substring(0, 2) : 'AN'}
              </Text>
            </View>
          <View style={styles.authorInfo}>
            <Text style={styles.nickname}>{item.author.nickname}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardContent}>{item.content}</Text>

        {isMyOwnPost ? (
          <View style={styles.myPostIndicator}>
            <Ionicons name="person-outline" size={14} color="#7C7C8A" />
            <Text style={styles.myPostIndicatorText}>Seu próprio desabafo</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.chatButton} onPress={() => handleOpenChat(item.id)}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#00B37E" />
            <Text style={styles.chatButtonText}>Apoiar no Privado</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      
      {/* 🧭 CARROSSEL HORIZONTAL DE CATEGORIAS */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[styles.categoryFilterButton, isSelected && styles.categoryFilterButtonSelected]}
                onPress={() => handleSelectCategory(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryFilterText, isSelected && styles.categoryFilterTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* LISTAGEM PRINCIPAL DO FEED */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00B37E" />
        </View>
      ) : (
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
              <Text style={styles.emptyText}>Nenhum desabafo nesta categoria ainda.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/new-topic')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121214',
  },
  categoriesWrapper: {
    backgroundColor: '#121214',
    borderBottomWidth: 1,
    borderBottomColor: '#202024',
    paddingVertical: 12,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryFilterButton: {
    backgroundColor: '#202024',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#323238',
  },
  categoryFilterButtonSelected: {
    backgroundColor: '#00B37E',
    borderColor: '#00B37E',
  },
  categoryFilterText: {
    color: '#7C7C8A',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryFilterTextSelected: {
    color: '#FFF',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Garante que o FAB não tampe o último card
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
  myPostIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    backgroundColor: '#1A1A1E',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#29292E',
    borderStyle: 'dashed',
  },
  myPostIndicatorText: {
    color: '#7C7C8A',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#00B37E',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00B37E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
});
