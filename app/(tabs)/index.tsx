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
import { io } from 'socket.io-client';
import { useAlert } from '../../src/context/AlertContext';
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

const CATEGORIES = [
  'Tudo', 
  'Ansiedade / Mente', 
  'Trabalho / Carreira', 
  'Relacionamentos', 
  'Vícios / Hábitos', 
  'Outros'
];

// 🚨 CONECTA AO SOCKET DO BACKEND (Garanta o IP correto da sua máquina)
//const socket = io('http://192.168.1.6:3334'); 

export default function Feed() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Tudo');
  
  // ⚡ INSTÂNCIAS DE TEMPO REAL & PAGINAÇÃO
  const [newTopicsCache, setNewTopicsCache] = useState<Topic[]>([]); // Cache invisível do Socket
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  async function fetchTopics(categoryName = 'Tudo', pageNumber = 1, shouldAppend = false) {
    try {
      const baseUrl = categoryName === 'Tudo' ? '/topics' : `/topics?category=${encodeURIComponent(categoryName)}`;
      const separator = baseUrl.includes('?') ? '&' : '?';
      const url = `${baseUrl}${separator}page=${pageNumber}`;

      const response = await api.get(url);
      const data = response.data;

      if (shouldAppend) {
        setTopics((prev) => [...prev, ...data]);
      } else {
        setTopics(data);
      }

      if (data.length < 10) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error('Erro ao buscar tópicos:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }

   useEffect(() => {
    if (!user?.id) return;

    // Cria a instância do socket exclusivamente para esta sessão ativa da tela
    const socketClient = io('http://192.168.1.6:3334', {
      transports: ['websocket'], // Força o protocolo WebSocket direto para evitar gargalos de polling
      upgrade: false
    });

    socketClient.on('connect', () => {
      console.log('🟩 Celular conectado com sucesso ao fluxo de tempo real do Feed!');
    });

    // Escuta novos desabafos criados globalmente no backend
    socketClient.on('new_topic_published', (newTopic: Topic) => {
      console.log('📩 Novo tópico detectado via WebSocket:', newTopic.title);
      
      // Regra 1: Se fui EU que criei, ignora
      if (newTopic.authorId === user.id) return;

      // Regra 2: Verifica se bate com a categoria selecionada na tela atual
      const matchesCategory = selectedCategory === 'Tudo' || newTopic.category === selectedCategory;

      if (matchesCategory) {
        setNewTopicsCache((prev) => {
          if (prev.some((t) => t.id === newTopic.id)) return prev;
          return [newTopic, ...prev];
        });
      }
    });

    // Limpa a conexão física ao sair do feed ou deslogar (evita conexões órfãs no Docker)
    return () => {
      socketClient.disconnect();
    };
  }, [selectedCategory, user?.id]); 
 

  useEffect(() => {
    setPage(1);
    setNewTopicsCache([]);
    setLoading(true);
    fetchTopics(selectedCategory, 1, false);
  }, [selectedCategory]);

  function handleRefresh() {
    setRefreshing(true);
    setPage(1);
    setNewTopicsCache([]);
    fetchTopics(selectedCategory, 1, false);
  }

  function handleLoadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTopics(selectedCategory, nextPage, true);
  }

  // 🔥 LIBERA O CACHE: Despeja os novos posts na lista ao clicar na pílula flutuante
  function handleApplyNewTopics() {
    setTopics((prev) => [...newTopicsCache, ...prev]);
    setNewTopicsCache([]);
  }

  function handleSelectCategory(categoryName: string) {
    setSelectedCategory(categoryName);
  }

  async function handleOpenChat(topicId: string) {
    try {
      const response = await api.post('/chats', { topicId });
      const { id: chatId } = response.data;
      router.push(`/chat/${chatId}`);
    } catch (error: any) {
      const apiError = error.response?.data?.error || 'Não foi possível iniciar a conversa.';
      showAlert({ title: 'Aviso', description: apiError });
    }
  }

  async function handleReportTopic(topicId: string) {
    const submitReport = async () => {
      try {
        await api.post('/topics/report', {
          topicId,
          reason: 'Denúncia de Conteúdo Inapropriado / Ofensivo'
        });

        showAlert({
          title: 'Conteúdo Reportado',
          description: 'Obrigado por nos ajudar a manter a irmandade segura. Nossa moderação analisará este desabafo em breve.'
        });
        
        handleRefresh();
      } catch (error: any) {
        const apiError = error.response?.data?.error || 'Não foi possível processar a denúncia.';
        showAlert({ title: 'Aviso', description: apiError });
      }
    };

    showAlert({
      title: 'Denunciar Desabafo',
      description: 'Tem certeza que deseja denunciar este desabafo por violação das diretrizes da comunidade?',
      confirmText: 'Denunciar',
      cancelText: 'Cancelar / Voltar',
      isDestructive: true,
      onConfirm: submitReport
    });
  }

  const renderItem = ({ item }: { item: Topic }) => {
    const isMyOwnPost = item.authorId === user?.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.author?.nickname ? String(item.author.nickname).substring(0, 2).toUpperCase() : 'AN'}
            </Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.nickname} numberOfLines={1}>{item.author.nickname}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
          </View>
          <View style={styles.rightHeaderActions}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            {!isMyOwnPost && (
              <TouchableOpacity style={styles.reportButton} onPress={() => handleReportTopic(item.id)}>
                <Ionicons name="flag-outline" size={16} color="#7C7C8A" />
              </TouchableOpacity>
            )}
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

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color="#00B37E" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
              >
                <Text style={[styles.categoryFilterText, isSelected && styles.categoryFilterTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* 💊 PÍLULA FLUTUANTE DE TEMPO REAL DA INDÚSTRIA */}
      {newTopicsCache.length > 0 && (
        <TouchableOpacity 
          style={styles.floatingPill} 
          onPress={handleApplyNewTopics}
          activeOpacity={0.9}
        >
          <Ionicons name="arrow-up" size={14} color="#FFF" />
          <Text style={styles.floatingPillText}>
            {newTopicsCache.length} {newTopicsCache.length === 1 ? 'novo desabafo' : 'novos desabafos'}
          </Text>
        </TouchableOpacity>
      )}

      {loading && page === 1 ? (
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="documents-outline" size={48} color="#323238" />
              <Text style={styles.emptyText}>Nenhum desabafo nesta categoria ainda.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-topic')}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#121214' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#121214' 
  },
  categoriesWrapper: { 
    backgroundColor: '#121214', 
    borderBottomWidth: 1, 
    borderBottomColor: '#202024', 
    paddingVertical: 14 
  },
  categoriesList: { 
    paddingHorizontal: 16, 
    gap: 10 
  },
  categoryFilterButton: { 
    backgroundColor: '#202024', 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#323238' 
  },
  categoryFilterButtonSelected: { 
    backgroundColor: '#00B37E', 
    borderColor: '#00B37E' 
  },
  categoryFilterText: { 
    color: '#7C7C8A', 
    fontSize: 13, 
    fontWeight: '700' 
  },
  categoryFilterTextSelected: { 
    color: '#FFF' 
  },
  
  // 💊 Pílula Flutuante Sênior Ajustada
  floatingPill: {
    position: 'absolute',
    top: 72, 
    alignSelf: 'center',
    backgroundColor: '#00B37E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    zIndex: 999,
    shadowColor: '#00B37E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  floatingPillText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  },

  listContainer: { 
    padding: 16, 
    paddingBottom: 100 // Dá mais fôlego para o scroll passar pelo FAB
  },
  
  // 📝 CARDS PREMIUM REFINADOS
  card: { 
    backgroundColor: '#202024', 
    borderRadius: 12, // Cantos mais arredondados e modernos
    padding: 18, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: '#29292E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 14 
  },
  avatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#1A3F30', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#00B37E' 
  },
  avatarText: { 
    color: '#00B37E', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  authorInfo: { 
    flex: 1, 
    marginLeft: 12 
  },
  nickname: { 
    color: '#FFF', 
    fontSize: 15, 
    fontWeight: 'bold',
    letterSpacing: 0.2
  },
  date: { 
    color: '#7C7C8A', 
    fontSize: 11, 
    marginTop: 2 
  },
  rightHeaderActions: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-end' 
  },
  categoryBadge: { 
    backgroundColor: '#1A2F26', // Verde escuro sutil de fundo
    paddingHorizontal: 12, 
    paddingVertical: 5, 
    borderRadius: 6, 
    borderWidth: 1, 
    borderColor: '#00B37E' 
  },
  categoryText: { 
    color: '#00B37E', 
    fontSize: 11, 
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  reportButton: { 
    paddingVertical: 6, 
    paddingHorizontal: 8, 
    marginLeft: 8 
  },
  cardTitle: { 
    color: '#FFF', 
    fontSize: 17, // Título mais imponente
    fontWeight: 'bold', 
    marginBottom: 8,
    lineHeight: 22
  },
  cardContent: { 
    color: '#C4C4CC', 
    fontSize: 14, 
    lineHeight: 22, // Mais respiro para leitura de desabafos longos
    marginBottom: 18 
  },
  
  // Botões de Ação Inferiores do Card
  chatButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#29292E', 
    height: 44, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#323238' 
  },
  chatButtonText: { 
    color: '#E1E1E6', 
    fontSize: 14, 
    fontWeight: '600', 
    marginLeft: 8 
  },
  myPostIndicator: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 44, 
    backgroundColor: '#1A1A1E', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#29292E', 
    borderStyle: 'dashed' 
  },
  myPostIndicatorText: { 
    color: '#7C7C8A', 
    fontSize: 13, 
    fontWeight: '500', 
    marginLeft: 6 
  },
  
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 80 
  },
  emptyText: { 
    color: '#7C7C8A', 
    fontSize: 14, 
    marginTop: 12, 
    textAlign: 'center' 
  },
  footerLoading: { 
    paddingVertical: 16, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  fab: { 
    position: 'absolute', 
    bottom: 24, 
    right: 24, 
    backgroundColor: '#00B37E', 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 6,
    shadowColor: '#00B37E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  }
});

