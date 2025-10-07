import React, { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getToastClass = () => {
    switch (type) {
      case 'success': return 'toast-success';
      case 'error': return 'toast-error';
      case 'info': return 'toast-info';
      default: return 'toast-info';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <FiCheckCircle size={16} />;
      case 'error': return <FiXCircle size={16} />;
      case 'info': return <FiInfo size={16} />;
      default: return <FiInfo size={16} />;
    }
  };

  return (
    <div className={`toast ${getToastClass()}`}>
      <div className="toast-content">
        <span className="toast-icon">{getIcon()}</span>
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={onClose}>
          <FiX size={14} />
        </button>
      </div>
    </div>
  );
};

let toastCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = React.useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${++toastCounter}`;
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, showToast, hideToast };
};