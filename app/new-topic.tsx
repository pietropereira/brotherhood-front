import { useAlert } from '@/src/context/AlertContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { api } from '../src/services/api';

// Categorias alinhadas com o debate estratégico
const CATEGORIES = ['Depressão', 'Serviço', 'Ansiedade', 'Outros'];

export default function NewTopic() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { showAlert } = useAlert();

  async function handleCreateTopic() {
    if (!title.trim() || !content.trim() || !category) {
        showAlert({
          title: 'Atenção',
          description: 'Por favor, preencha todos os campos e selecione uma categoria.',
          confirmText: 'OK',
          cancelText: '',
        });
      return;
    }

    setLoading(true);

    try {
      // Dispara o POST para salvar o desabafo atrelando o autor via JWT automaticamente
      await api.post('/topics', {
        title,
        content,
        category
      });

      showAlert({
          title:'Compartilhado!',
          description: 'Seu desabafo foi compartilhado anonimamente com a irmandade.',
          confirmText: 'OK',
          cancelText: '',
      });
        router.push('/(tabs)');
    } catch (error: any) {
      showAlert({
          title:'Erro ao postar',
          description: 'Não foi possível postar o desabafo.',
          confirmText: 'OK',
          cancelText: '',
      });
      
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header Superior da Tela */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Desabafo</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.infoText}>
          Sinta-se seguro. Suas postagens são 100% anônimas e exibidas apenas com o seu nickname.
        </Text>

        {/* Input de Título */}
        <Text style={styles.label}>Título do seu desabafo</Text>
        <TextInput 
          style={styles.input}
          placeholder="Resuma o que está sentindo..."
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        {/* Seletor de Categoria */}
        <Text style={styles.label}>Selecione o assunto principal</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((item) => {
            const isSelected = category === item;
            return (
              <TouchableOpacity
                key={item}
                style={[styles.categoryButton, isSelected && styles.categoryButtonSelected]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.categoryButtonText, isSelected && styles.categoryButtonTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Input de Conteúdo (Texto Longo) */}
        <Text style={styles.label}>Escreva o que está acontecendo</Text>
        <TextInput 
          style={[styles.input, styles.textArea]}
          placeholder="Fique à vontade para escrever o seu desabafo sem julgamentos..."
          placeholderTextColor="#666"
          multiline
          numberOfLines={6}
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
        />

        {/* Botão de Envio */}
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleCreateTopic}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Publicar Anonimamente</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202024',
    height: 60,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#323238',
    marginTop: Platform.OS === 'ios' ? 40 : 0,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  spacer: {
    width: 24,
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  infoText: {
    color: '#8D8D99',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 24,
    backgroundColor: '#1A1A1E',
    padding: 16,
    borderRadius: 12, // Alinhado com os cards do feed
    borderWidth: 1,
    borderColor: '#29292E',
  },
  label: {
    color: '#E1E1E6',
    fontSize: 14,
    fontWeight: '700', // Texto ligeiramente mais forte
    marginBottom: 10,
    marginTop: 18,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#202024',
    color: '#FFF',
    height: 56,
    borderRadius: 12, // Cantos modernos e idênticos aos cards
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#29292E',
  },
  textArea: {
    height: 160,
    paddingTop: 16,
    paddingBottom: 16,
    lineHeight: 22, // Melhor legibilidade ao digitar o desabafo
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  categoryButton: {
    backgroundColor: '#202024',
    borderWidth: 1,
    borderColor: '#323238',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24, // Pílulas bem arredondadas de alto padrão
  },
  categoryButtonSelected: {
    borderColor: '#00B37E',
    backgroundColor: '#1A2F26', // Destaque suave em verde premium
  },
  categoryButtonText: {
    color: '#7C7C8A',
    fontSize: 13,
    fontWeight: '700',
  },
  categoryButtonTextSelected: {
    color: '#00B37E',
  },
  submitButton: {
    backgroundColor: '#00B37E',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#00B37E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

