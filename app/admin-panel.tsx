import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAlert } from '../src/context/AlertContext';
import { api } from '../src/services/api';

interface Report {
  id: string;
  reason: string;
  createdAt: string;
  topicId: string;
  reporter: { nickname: string };
  topic: {
    id: string;
    title: string;
    content: string;
    category: string;
    author: { nickname: string };
  } | null; // Pode ser null se o tópico já foi apagado por outro admin
}

export default function AdminPanel() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const { showAlert } = useAlert();

  async function loadReports() {
    try {
      const response = await api.get('/admin/reports');
      setReports(response.data);
    } catch (error) {
      console.error('Erro ao buscar denúncias:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    loadReports();
  }

  // Função para deletar o tópico infrator
  async function handleDeleteTopic(topicId: string, reportId: string) {
    const executeDeletion = async () => {
      try {
        await api.delete(`/admin/topics/${topicId}`);
        
        // Remove localmente da lista todas as denúncias vinculadas a esse tópico apagado
        setReports((prev) => prev.filter((r) => r.topicId !== topicId));

        showAlert({
          title: 'Post Deletado',
          description: 'O desabafo e todos os seus rastros (chats/mensagens) foram removidos permanentemente do aplicativo.'
        });
      } catch (error) {
        showAlert({ title: 'Erro', description: 'Não foi possível excluir este desabafo.' });
      }
    };

    showAlert({
      title: '🚨 EXCLUSÃO COMPULSÓRIA',
      description: 'Você tem certeza que deseja deletar este desabafo permanentemente do aplicativo por violação de termos?',
      confirmText: 'Derrubar Post',
      cancelText: 'Cancelar',
      isDestructive: true,
      onConfirm: executeDeletion
    });
  }

  const renderItem = ({ item }: { item: Report }) => {
    // Se o tópico já foi deletado, mostra um card informativo desabilitado
    if (!item.topic) {
      return (
        <View style={[styles.card, styles.disabledCard]}>
          <Text style={styles.disabledText}>⚠️ Conteúdo já foi excluído por outro moderador.</Text>
          <Text style={styles.reportMeta}>Denunciado por: {item.reporter.nickname}</Text>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        {/* Motivo e Cabeçalho da Denúncia */}
        <View style={styles.reportHeader}>
          <Ionicons name="alert-circle" size={18} color="#F75A68" />
          <Text style={styles.reportReason} numberOfLines={1}>{item.reason}</Text>
        </View>
        
        <Text style={styles.reportMeta}>
          Denunciado por: <Text style={styles.whiteText}>{item.reporter.nickname}</Text> • Autor do post: <Text style={styles.whiteText}>{item.topic.author.nickname}</Text>
        </Text>

        <View style={styles.divider} />

        {/* Conteúdo do Post Denunciado */}
        <View style={styles.topicBox}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.topic.category}</Text>
          </View>
          <Text style={styles.topicTitle}>{item.topic.title}</Text>
          <Text style={styles.topicContent}>{item.topic.content}</Text>
        </View>

        {/* Botão de Ação do Admin */}
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => handleDeleteTopic(item.topic!.id, item.id)}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={16} color="#FFF" />
          <Text style={styles.deleteButtonText}>Remover Conteúdo Abusivo</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? 35 : 0 }]}>
      <StatusBar style="light" backgroundColor="#202024" translucent={false} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛡️ Painel de Moderação</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00B37E" />
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00B37E" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#00B37E" />
              <Text style={styles.emptyTitle}>Tudo Limpo!</Text>
              <Text style={styles.emptyText}>Nenhuma denúncia pendente de revisão na moderação.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#202024', height: 60, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#323238', marginTop: Platform.OS === 'ios' ? 40 : 0 },
  backButton: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#202024', borderRadius: 8, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#323238' },
  disabledCard: { borderColor: '#29292E', opacity: 0.5 },
  disabledText: { color: '#7C7C8A', fontSize: 13, fontWeight: '500', fontStyle: 'italic' },
  reportHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  reportReason: { color: '#F75A68', fontSize: 14, fontWeight: 'bold', marginLeft: 8, flex: 1 },
  reportMeta: { color: '#7C7C8A', fontSize: 12, marginTop: 4 },
  whiteText: { color: '#E1E1E6', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#323238', marginVertical: 12 },
  topicBox: { backgroundColor: '#1A1A1E', borderRadius: 6, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#29292E' },
  categoryBadge: { backgroundColor: '#29292E', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1, borderColor: '#F75A68', alignSelf: 'flex-start', marginBottom: 8 },
  categoryText: { color: '#F75A68', fontSize: 10, fontWeight: 'bold' },
  topicTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginBottom: 6 },
  topicContent: { color: '#C4C4CC', fontSize: 13, lineHeight: 18 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F75A68', height: 40, borderRadius: 6 },
  deleteButtonText: { color: '#FFF', fontSize: 13, fontWeight: 'bold', marginLeft: 8 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 120, paddingHorizontal: 24 },
  emptyTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  emptyText: { color: '#7C7C8A', fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18 }
});
