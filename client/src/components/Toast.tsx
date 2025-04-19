import * as React from 'react';
import { useState, useEffect, useMemo, createContext, useContext } from 'react';
import './Toast.css';

interface ToastContextType {
  show: (options: ToastOptions) => string | null;
  success: (message: string) => string | null;
  error: (message: string) => string | null;
  info: (message: string) => string | null;
  warning: (message: string) => string | null;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose: (id: string) => void;
  key?: string;
}

interface ToastOptions {
  id?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
}

const ToastContext = createContext<ToastContextType>({
  show: () => null,
  success: () => null,
  error: () => null,
  info: () => null,
  warning: () => null,
  dismiss: () => {},
  dismissAll: () => {}
});

function ToastNotification({ id, type = 'info', message, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button className="toast-close" onClick={() => onClose(id)}>×</button>
    </div>
  );
}

function ToastProvider({ children, position = 'top-right' }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toastFunctions = useMemo(() => ({
    show: (options: ToastOptions) => {
      const id = options.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = {
        id,
        type: options.type || 'info',
        message: options.message,
        duration: options.duration
      };
      
      setToasts(prevToasts => [...prevToasts, newToast]);
      return id;
    },
    
    success: (message: string) => {
      return toastFunctions.show({ message, type: 'success' });
    },
    
    error: (message: string) => {
      return toastFunctions.show({ message, type: 'error' });
    },
    
    info: (message: string) => {
      return toastFunctions.show({ message, type: 'info' });
    },
    
    warning: (message: string) => {
      return toastFunctions.show({ message, type: 'warning' });
    },
    
    dismiss: (id: string) => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    },
    
    dismissAll: () => {
      setToasts([]);
    }
  }), []);

  const getPositionStyles = () => {
    const base = { position: 'fixed', zIndex: 9999 } as const;
    switch (position) {
      case 'top-right':
        return { ...base, top: 0, right: 0 };
      case 'top-left':
        return { ...base, top: 0, left: 0 };
      case 'bottom-right':
        return { ...base, bottom: 0, right: 0 };
      case 'bottom-left':
        return { ...base, bottom: 0, left: 0 };
      case 'top-center':
        return { ...base, top: 0, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-center':
        return { ...base, bottom: 0, left: '50%', transform: 'translateX(-50%)' };
      default:
        return { ...base, top: 0, right: 0 };
    }
  };

  return (
    <ToastContext.Provider value={toastFunctions}>
      {children}
      <div className="toast-container" style={getPositionStyles()}>
        {toasts.map(toast => (
          <ToastNotification
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={toastFunctions.dismiss}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function useToast() {
  return useContext(ToastContext);
}

export { ToastProvider, useToast }; 