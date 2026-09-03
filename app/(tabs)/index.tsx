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

const CATEGORIES = ['Tudo', 'Depressão', 'Serviço', 'Ansiedade', 'Outros'];

export default function Feed() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Tudo');
  
  // ⚡ ESTADOS DA PAGINAÇÃO
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Controla se ainda há posts no banco
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  // Função principal de busca adaptada para carregar novos blocos
  async function fetchTopics(categoryName = 'Tudo', pageNumber = 1, shouldAppend = false) {
    try {
      const baseUrl = categoryName === 'Tudo' ? '/topics' : `/topics?category=${encodeURIComponent(categoryName)}`;
      // Conecta o Query Param de página na URL
      const separator = baseUrl.includes('?') ? '&' : '?';
      const url = `${baseUrl}${separator}page=${pageNumber}`;

      const response = await api.get(url);
      const data = response.data;

      if (shouldAppend) {
        // Se for scroll infinito, junta as mensagens novas no fim do array atual
        setTopics((prev) => [...prev, ...data]);
      } else {
        // Se for a primeira carga ou refresh, substitui tudo
        setTopics(data);
      }

      // Se a API devolveu menos de 10 posts, significa que a fonte secou e não há mais registros no banco
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

  // Monitora a troca de categoria limpando a paginação e voltando para a página 1
  useEffect(() => {
    setPage(1);
    setLoading(true);
    fetchTopics(selectedCategory, 1, false);
  }, [selectedCategory]);

  // Pull to Refresh (Reseta o feed do topo)
  function handleRefresh() {
    setRefreshing(true);
    setPage(1);
    fetchTopics(selectedCategory, 1, false);
  }

  // ⚡ GATILHO DO INFINITE SCROLL: Chamado quando o usuário chega no fim da lista
  function handleLoadMore() {
    if (loadingMore || !hasMore) return; // Se já está buscando ou se não há mais dados, trava o disparo

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    
    // Passa 'true' no append para anexar os dados novos
    fetchTopics(selectedCategory, nextPage, true);
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
        
        // Recarrega o feed imediatamente para sumir com o post denunciado da tela
        handleRefresh();
      } catch (error: any) {
        const apiError = error.response?.data?.error || 'Não foi possível processar a denúncia.';
        showAlert({ title: 'Aviso', description: apiError });
      }
    };

    showAlert({
      title: 'Denunciar Desabafo',
      description: 'Tem certeza que deseja denunciar este desabafo por violação das diretrizes da comunidade?',
      confirmText: 'Denunciar Conteúdo',
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

  // 🔁 Renderiza um spinner discreto no rodapé da lista enquanto carrega mais posts
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
          // Propriedades do Infinite Scroll:
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1} // Ativa o disparo quando o usuário rolar 90% da tela
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
  container: { flex: 1, backgroundColor: '#121214' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121214' },
  categoriesWrapper: { backgroundColor: '#121214', borderBottomWidth: 1, borderBottomColor: '#202024', paddingVertical: 12 },
  categoriesList: { paddingHorizontal: 16, gap: 8 },
  categoryFilterButton: { backgroundColor: '#202024', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#323238' },
  categoryFilterButtonSelected: { backgroundColor: '#00B37E', borderColor: '#00B37E' },
  categoryFilterText: { color: '#7C7C8A', fontSize: 13, fontWeight: '600' },
  categoryFilterTextSelected: { color: '#FFF' },
  listContainer: { padding: 16, paddingBottom: 80 },
  card: { backgroundColor: '#202024', borderRadius: 8, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#323238' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A3F30', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#00B37E' },
  avatarText: { color: '#00B37E', fontWeight: 'bold', fontSize: 13 },
  authorInfo: { flex: 1, marginLeft: 12 },
  nickname: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  date: { color: '#7C7C8A', fontSize: 11, marginTop: 2 },
  rightHeaderActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  categoryBadge: { backgroundColor: '#29292E', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#00B37E' },
  categoryText: { color: '#00B37E', fontSize: 11, fontWeight: '600' },
  reportButton: { paddingVertical: 4, paddingHorizontal: 8, marginLeft: 6 },
  cardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  cardContent: { color: '#C4C4CC', fontSize: 14, lineHeight: 20, marginBottom: 16 },
  chatButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#29292E', height: 40, borderRadius: 6, borderWidth: 1, borderColor: '#323238' },
  chatButtonText: { color: '#E1E1E6', fontSize: 13, fontWeight: '600', marginLeft: 8 },
  myPostIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40, backgroundColor: '#1A1A1E', borderRadius: 6, borderWidth: 1, borderColor: '#29292E', borderStyle: 'dashed' },
  myPostIndicatorText: { color: '#7C7C8A', fontSize: 12, fontWeight: '500', marginLeft: 6 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { color: '#7C7C8A', fontSize: 14, marginTop: 12, textAlign: 'center' },
  footerLoading: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#00B37E', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6 }
});
