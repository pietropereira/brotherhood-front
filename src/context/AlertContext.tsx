import { CustomAlert } from '@/components/CustomAlert';
import React, { createContext, useContext, useState } from 'react';

interface AlertOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm?: () => void;
}

interface AlertContextData {
  showAlert: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextData>({} as AlertContextData);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertOptions>({ title: '', description: '' });

  // Função global que qualquer tela vai chamar
  const showAlert = (options: AlertOptions) => {
    setConfig(options);
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  const handleConfirm = () => {
    setVisible(false);
    if (config.onConfirm) {
      config.onConfirm();
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {/* O único componente físico de alerta injetado na raiz do app */}
      <CustomAlert
        visible={visible}
        title={config.title}
        description={config.description}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        isDestructive={config.isDestructive}
        onClose={handleClose}
        onConfirm={config.onConfirm ? handleConfirm : undefined}
      />
    </AlertContext.Provider>
  );
};

export function useAlert() {
  return useContext(AlertContext);
}
