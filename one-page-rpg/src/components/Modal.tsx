import React, { useEffect } from 'react';
import { RPGUIContainer, RPGUIButton } from '../ui';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
}

/**
 * Componente Modal reutilizable con estilo retro RPG
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdropClick = true,
}) => {
  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className={`w-full ${sizeClasses[size]} animate-slideUp`}>
        <RPGUIContainer variant="framed">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-600">
            <h2 className="text-yellow-400 text-lg font-bold text-shadow">
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-red-500 text-2xl leading-none transition-colors"
                aria-label="Cerrar"
              >
                ×
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </RPGUIContainer>
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

/**
 * Modal de confirmación especializado
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
}) => {
  const icons = {
    danger: '⚠️',
    warning: '❗',
    info: 'ℹ️',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="small"
      showCloseButton={false}
      closeOnBackdropClick={false}
    >
      <div className="text-center space-y-6">
        <div className="text-6xl">{icons[variant]}</div>
        <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
        <div className="flex gap-4 justify-center">
          <RPGUIButton onClick={onCancel} variant="normal">
            {cancelText}
          </RPGUIButton>
          <RPGUIButton 
            onClick={onConfirm} 
            variant={variant === 'danger' ? 'normal' : 'golden'}
          >
            {confirmText}
          </RPGUIButton>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;
