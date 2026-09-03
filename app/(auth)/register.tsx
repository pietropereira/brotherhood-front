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
import { useAlert } from '../../src/context/AlertContext'; // 👈 Importamos o hook de alerta global
import { api } from '../../src/services/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false); // ⚡ Estado do checkbox
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { showAlert } = useAlert();

  const avatarUrl = nickname 
    ? `https://dicebear.com{encodeURIComponent(nickname)}`
    : null;

  // 📜 Função que abre o texto completo das diretrizes no modal Dark Premium
  function handleOpenTerms() {
    showAlert({
      title: 'Diretrizes da Irmandade (EULA)',
      description: '1. Respeito Mútuo: O Brotherhood é um ambiente seguro de acolhimento. É terminantemente proibido qualquer discurso de ódio, assédio, racismo ou preconceito.\n\n2. Anonimato: Respeite a privacidade alheia. É proibido tentar descobrir ou vazar a identidade real de qualquer irmão.\n\n3. Moderação Ativa: Conteúdos denunciados serão revisados em até 24h. Violações graves resultarão no banimento imediato e permanente da conta.\n\n4. PROIBIDO PEDIR DINHEIRO OU DOAÇÕES: O Brotherhood visa estritamente o suporte emocional. É expressamente proibido divulgar chaves Pix, links de vaquinhas ou pedir ajuda financeira. Posts com este intuito serão deletados e a conta banida na hora.',
      confirmText: 'Entendi e Concordo',
    });
  }

  async function handleRegister() {
    if (!email || !password || !nickname) {
      showAlert({ title: 'Atenção', description: 'Por favor, preencha todos os campos obrigatórios.' });
      return;
    }

    // 🔒 Trava de Segurança Jurídica
    if (!acceptTerms) {
      showAlert({ title: 'Termos de Uso', description: 'Você precisa ler e aceitar as Diretrizes da Comunidade para fazer parte da irmandade.' });
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

      const successAction = () => {
        setEmail('');
        setPassword('');
        setNickname('');
        setAcceptTerms(false);
        router.push('/login');
      };

      showAlert({
        title: 'Irmandade Consolidada!',
        description: 'Seu cadastro anônimo foi criado com sucesso. Agora faça seu login.',
        confirmText: 'Ir para Login',
        onConfirm: successAction
      });
    } catch (error: any) {
      const apiError = error.response?.data?.error || 'Não foi possível concluir o cadastro.';
      showAlert({ title: 'Erro no cadastro', description: apiError });
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
        
        <View style={styles.header}>
          <Text style={styles.logo}>🚀 BROTHERHOOD</Text>
          <Text style={styles.tagline}>Autoajuda Masculina Anônima</Text>
          <Text style={styles.description}>
            Seu e-mail e senha servem apenas para acesso seguro. Na comunidade, seu único rastro é a sua armadura (Nickname).
          </Text>
        </View>

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

          {/* ⚖️ CONTAINER DO CHECKBOX CUSTOMIZADO */}
          <View style={styles.termsContainer}>
            <TouchableOpacity 
              style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}
              onPress={() => setAcceptTerms(!acceptTerms)}
              activeOpacity={0.7}
            >
              {acceptTerms && <Ionicons name="checkmark" size={14} color="#FFF" />}
            </TouchableOpacity>
            
            <Text style={styles.termsText}>
              Li e aceito as{' '}
              <Text style={styles.termsLink} onPress={handleOpenTerms}>
                Diretrizes da Comunidade (EULA)
              </Text>
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, !acceptTerms && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Criar Conta Anônima</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/login')}>
            <Text style={styles.linkText}>Já faz parte da irmandade? Faça Login</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 40 },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#FFF', letterSpacing: 1.5 },
  tagline: { fontSize: 14, color: '#00B37E', fontWeight: '600', marginTop: 4, marginBottom: 16 },
  description: { fontSize: 13, color: '#8D8D99', textAlign: 'center', lineHeight: 20, paddingHorizontal: 8 },
  form: { width: '100%' },
  label: { color: '#E1E1E6', fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#202024', color: '#FFF', height: 56, borderRadius: 8, paddingHorizontal: 16, fontSize: 16, borderWidth: 1, borderColor: '#323238' },
  
  // 🎨 Estilos do Checkbox e Termos
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#323238',
    backgroundColor: '#202024',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#00B37E',
    borderColor: '#00B37E',
  },
  termsText: {
    color: '#8D8D99',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  termsLink: {
    color: '#00B37E',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  button: { backgroundColor: '#00B37E', height: 56, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  buttonDisabled: {
    backgroundColor: '#1C2E24', // Visual opaco de desabilitado se não marcar o termo
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  linkButton: { alignItems: 'center', marginTop: 20, padding: 8 },
  linkText: { color: '#8D8D99', fontSize: 14, textDecorationLine: 'underline' },
});
