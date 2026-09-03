import { useAlert } from '@/src/context/AlertContext';
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
import { api } from '../../src/services/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { showAlert } = useAlert();

  // Gerador de avatar determinístico temporário baseado no nickname usando a API do DiceBear
  const avatarUrl = nickname 
    ? `https://dicebear.com{encodeURIComponent(nickname)}`
    : null;
    

  async function handleRegister() {
  if (!email || !password || !nickname) {
     showAlert({
          title: 'Atenção',
          description: 'Por favor, preencha todos os campos obrigatórios.',
          confirmText: 'OK',
          cancelText: '',
        });
    return;
  }

  setLoading(true);

  try {
    await api.post('/auth/register', {
      email,
      password,
      nickname,
      avatarUrl
    });

    // Função para limpar os inputs e navegar
    const successAction = () => {
      setEmail('');
      setPassword('');
      setNickname('');
      router.push('/login');
    };

    showAlert({
      title: 'Irmandade Consolidada!',
      description: 'Seu cadastro anônimo foi criado com sucesso. Agora faça seu login.',
      confirmText: 'OK',
      cancelText: '',
    });
     successAction();
  } catch (error: any) {    
    showAlert({
      title: 'Erro no cadastro',
      description: 'Não foi possível concluir o cadastro.',
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header da Tela */}
        <View style={styles.header}>
          <Text style={styles.logo}>🚀 BROTHERHOOD</Text>
          <Text style={styles.tagline}>Autoajuda Masculina Anônima</Text>
          <Text style={styles.description}>
            Seu e-mail e senha servem apenas para acesso seguro. Na comunidade, seu único rastro é a sua armadura (Nickname).
          </Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <Text style={styles.label}>Como quer ser chamado? (Único e Anônimo) *</Text>
          <TextInput 
            style={styles.input}
            placeholder="Ex: GuerreiroMenteSã, Fenix88"
            placeholderTextColor="#666"
            value={nickname}
            onChangeText={setNickname}
            autoCorrect={false}
          />

          <Text style={styles.label}>Seu E-mail Privado *</Text>
          <TextInput 
            style={styles.input}
            placeholder="Ex: seuemail@provedor.com"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Sua Senha de Acesso *</Text>
          <TextInput 
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#666"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
          />

          {/* Botão de Envio */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Criar Conta Anônima</Text>
            )}
          </TouchableOpacity>

          {/* Link para o Login */}
          <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/login')}>
            <Text style={styles.linkText}>Já faz parte da irmandade? Faça Login</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214', // Fundo Dark Premium
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 14,
    color: '#00B37E', // Verde destaque para acolhimento/esperança
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 16,
  },
  description: {
    fontSize: 13,
    color: '#8D8D99',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  form: {
    width: '100%',
  },
  label: {
    color: '#E1E1E6',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#202024',
    color: '#FFF',
    height: 56,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#323238',
  },
  button: {
    backgroundColor: '#00B37E',
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#00B37E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 20,
    padding: 8,
  },
  linkText: {
    color: '#8D8D99',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
