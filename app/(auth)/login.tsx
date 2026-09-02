import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const router = useRouter();

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Atenção', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);

    try {
      // Chama o signIn do nosso Contexto (que já salva o Token e muda de tela)
      await signIn({ email, password });
    } catch (error: any) {
      Alert.alert('Falha no acesso', error.message || 'Credenciais inválidas.');
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
            Entre com suas credenciais seguras para acessar seu refúgio anônimo.
          </Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <Text style={styles.label}>Seu E-mail Privado</Text>
          <TextInput 
            style={styles.input}
            placeholder="seuemail@provedor.com"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Sua Senha</Text>
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

          {/* Botão de Entrada */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Acessar a Comunidade</Text>
            )}
          </TouchableOpacity>

          {/* Link para o Cadastro */}
          <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/register')}>
            <Text style={styles.linkText}>Novo por aqui? Crie sua conta anônima</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 14,
    color: '#00B37E',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 16,
  },
  description: {
    fontSize: 13,
    color: '#8D8D99',
    textAlign: 'center',
    lineHeight: 20,
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
