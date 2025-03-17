import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

/**
 * Individual Toast component
 */
const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  // Auto close toast after duration
  useEffect(() => {
    if (!isVisible || isPaused) return;
    
    // If duration is 0, don't auto-close
    if (duration === 0) return;
    
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, isVisible, isPaused]);
  
  // Handle animation end
  const handleAnimationEnd = () => {
    if (!isVisible) {
      onClose(id);
    }
  };
  
  // Pause timer on hover
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);
  
  // Get icon based on toast type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };
  
  return (
    <div 
      className={`toast toast-${type} ${isVisible ? 'toast-enter' : 'toast-exit'}`}
      onAnimationEnd={handleAnimationEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
    >
      <div className="toast-icon">
        {getIcon()}
      </div>
      
      <div className="toast-content">
        <p className="toast-message">{message}</p>
      </div>
      
      <button 
        className="toast-close" 
        onClick={() => setIsVisible(false)}
        aria-label="Close notification"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {duration > 0 && (
        <div className="toast-progress">
          <div 
            className={`toast-progress-bar ${isPaused ? 'toast-progress-paused' : ''}`} 
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      )}
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  message: string;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
}

/**
 * ToastContainer component to manage multiple Toast notifications
 */
const ToastContainer: React.FC<ToastContainerProps> = ({ position = 'top-right' }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  
  useEffect(() => {
    // Create global access to toast methods
    const toast = {
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
      
      success: (message: string, options: Omit<ToastOptions, 'message' | 'type'> = {}) => {
        return toast.show({ ...options, message, type: 'success' });
      },
      
      error: (message: string, options: Omit<ToastOptions, 'message' | 'type'> = {}) => {
        return toast.show({ ...options, message, type: 'error' });
      },
      
      info: (message: string, options: Omit<ToastOptions, 'message' | 'type'> = {}) => {
        return toast.show({ ...options, message, type: 'info' });
      },
      
      warning: (message: string, options: Omit<ToastOptions, 'message' | 'type'> = {}) => {
        return toast.show({ ...options, message, type: 'warning' });
      },
      
      dismiss: (id: string) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
      },
      
      dismissAll: () => {
        setToasts([]);
      }
    };
    
    // Add toast to window for global access
    (window as any).toast = toast;
    
    return () => {
      // Cleanup
      delete (window as any).toast;
    };
  }, []);
  
  // Handle closing a single toast
  const handleClose = (id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };
  
  return ReactDOM.createPortal(
    <div className={`toast-container toast-${position}`}>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type || 'info'}
          message={toast.message}
          duration={toast.duration}
          onClose={handleClose}
        />
      ))}
    </div>,
    document.body
  );
};

export { Toast, ToastContainer };

// Export toast functions
export const toast = {
  show: (options: ToastOptions) => (window as any).toast?.show(options),
  success: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => (window as any).toast?.success(message, options),
  error: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => (window as any).toast?.error(message, options),
  info: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => (window as any).toast?.info(message, options),
  warning: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => (window as any).toast?.warning(message, options),
  dismiss: (id: string) => (window as any).toast?.dismiss(id),
  dismissAll: () => (window as any).toast?.dismissAll()
}; 