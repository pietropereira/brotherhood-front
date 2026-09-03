import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean; // Se ativo, deixa o botão de confirmação vermelho (para exclusões)
}

export function CustomAlert({
  visible,
  title,
  description,
  onClose,
  onConfirm,
  confirmText = 'Ok',
  cancelText = 'Cancelar',
  isDestructive = false
}: CustomAlertProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          
          {/* Título e Mensagem */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          {/* Rodapé de Botões */}
          <View style={styles.buttonContainer}>
            
            {/* Se houver uma função de confirmação, renderiza o botão de cancelar ao lado */}
            {onConfirm && (
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            {/* Botão Principal (Ok ou Confirmar) */}
            <TouchableOpacity 
              style={[
                styles.button, 
                onConfirm ? styles.confirmButton : styles.singleButton,
                isDestructive ? styles.destructiveButton : null
              ]} 
              onPress={onConfirm ? onConfirm : onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Fundo escuro fosco por trás
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertBox: {
    backgroundColor: '#202024',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#323238',
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    color: '#C4C4CC',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    height: 46,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  singleButton: {
    backgroundColor: '#00B37E',
  },
  confirmButton: {
    backgroundColor: '#00B37E',
  },
  cancelButton: {
    backgroundColor: '#29292E',
    borderWidth: 1,
    borderColor: '#323238',
  },
  destructiveButton: {
    backgroundColor: '#F75A68', // Vermelho para ações destrutivas
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#A9A9B2',
    fontSize: 14,
    fontWeight: '600',
  },
});
