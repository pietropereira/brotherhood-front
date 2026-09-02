import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function Profile() {
  const { user, signOut } = useAuth(); // Puxa os dados do usuário e a função de logout do contexto

  function handleSignOut() {
    if (Platform.OS === 'web') {
      const confirmLog = confirm('Tem certeza que deseja sair do seu refúgio anônimo?');
      if (confirmLog) signOut();
    } else {
      Alert.alert(
        'Sair da Irmandade',
        'Tem certeza que deseja sair do seu refúgio anônimo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair de Vez', style: 'destructive', onPress: signOut }
        ]
      );
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Bloco Central do Avatar */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarWrapper}>
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
            {user?.nickname ? user.nickname.substring(0, 2) : 'AN'}
        </Text>
        </View>
        </View>
        <Text style={styles.nickname}>{user?.nickname || 'Irmão Anônimo'}</Text>
        <View style={styles.statusBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#00B37E" />
          <Text style={styles.statusText}>Identidade Blindada</Text>
        </View>
      </View>

      {/* Painel de Informações e Segurança */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Sua Armadura de Privacidade</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="eye-off-outline" size={20} color="#7C7C8A" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Exibição na Comunidade</Text>
              <Text style={styles.infoValue}>100% Anônimo</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="key-outline" size={20} color="#7C7C8A" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Segurança de Dados</Text>
              <Text style={styles.infoValue}>E-mail ocultado por criptografia</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Botão de Ação: Deslogar / Sair */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color="#F75A68" />
        <Text style={styles.logoutButtonText}>Sair do Aplicativo</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Brotherhood v1.0.0 • Protegido</Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121214',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#202024',
    borderWidth: 2,
    borderColor: '#00B37E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#00B37E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  nickname: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2F26',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00B37E',
    marginTop: 8,
  },
  statusText: {
    color: '#00B37E',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  infoSection: {
    width: '100%',
    marginBottom: 40,
  },
  sectionTitle: {
    color: '#E1E1E6',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#202024',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#323238',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: 14,
  },
  infoLabel: {
    color: '#7C7C8A',
    fontSize: 12,
  },
  infoValue: {
    color: '#E1E1E6',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#323238',
    my: 14,
    marginVertical: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29292E',
    width: '100%',
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F75A68',
  },
  logoutButtonText: {
    color: '#F75A68',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  versionText: {
    color: '#323238',
    fontSize: 12,
    marginTop: 24,
  },
});
