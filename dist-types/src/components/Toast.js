import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './Toast.css';
/**
 * Individual Toast component
 */
const Toast = ({ id, type, message, duration = 5000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    // Auto close toast after duration
    useEffect(() => {
        if (!isVisible || isPaused)
            return;
        // If duration is 0, don't auto-close
        if (duration === 0)
            return;
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
                return (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }));
            case 'error':
                return (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }));
            case 'warning':
                return (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }));
            case 'info':
            default:
                return (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) }));
        }
    };
    return (_jsxs("div", { className: `toast toast-${type} ${isVisible ? 'toast-enter' : 'toast-exit'}`, onAnimationEnd: handleAnimationEnd, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, role: "alert", children: [_jsx("div", { className: "toast-icon", children: getIcon() }), _jsx("div", { className: "toast-content", children: _jsx("p", { className: "toast-message", children: message }) }), _jsx("button", { className: "toast-close", onClick: () => setIsVisible(false), "aria-label": "Close notification", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }) }), duration > 0 && (_jsx("div", { className: "toast-progress", children: _jsx("div", { className: `toast-progress-bar ${isPaused ? 'toast-progress-paused' : ''}`, style: { animationDuration: `${duration}ms` } }) }))] }));
};
/**
 * ToastContainer component to manage multiple Toast notifications
 */
const ToastContainer = ({ position = 'top-right' }) => {
    const [toasts, setToasts] = useState([]);
    useEffect(() => {
        // Create global access to toast methods
        const toast = {
            show: (options) => {
                const id = options.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                const newToast = {
                    id,
                    type: options.type || 'info',
                    message: options.message,
                    duration: options.duration,
                    position: options.position
                };
                setToasts(prevToasts => [...prevToasts, newToast]);
                return id;
            },
            success: (message, options = {}) => {
                return toast.show({ ...options, message, type: 'success' });
            },
            error: (message, options = {}) => {
                return toast.show({ ...options, message, type: 'error' });
            },
            info: (message, options = {}) => {
                return toast.show({ ...options, message, type: 'info' });
            },
            warning: (message, options = {}) => {
                return toast.show({ ...options, message, type: 'warning' });
            },
            dismiss: (id) => {
                setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
            },
            dismissAll: () => {
                setToasts([]);
            }
        };
        // Add toast to window for global access
        window.toast = toast;
        return () => {
            // Cleanup
            delete window.toast;
        };
    }, []);
    // Handle closing a single toast
    const handleClose = (id) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    };
    return ReactDOM.createPortal(_jsx("div", { className: `toast-container toast-${position}`, children: toasts.map(toast => (_jsx(Toast, { id: toast.id, type: toast.type || 'info', message: toast.message, duration: toast.duration, onClose: handleClose }, toast.id))) }), document.body);
};
export { Toast, ToastContainer };
// Export toast functions
export const toast = {
    show: (options) => window.toast?.show(options),
    success: (message, options) => window.toast?.success(message, options),
    error: (message, options) => window.toast?.error(message, options),
    info: (message, options) => window.toast?.info(message, options),
    warning: (message, options) => window.toast?.warning(message, options),
    dismiss: (id) => window.toast?.dismiss(id),
    dismissAll: () => window.toast?.dismissAll()
};
export const ToastProvider = ({ children }) => {
    useEffect(() => {
        window.toast = toast;
        return () => {
            delete window.toast;
        };
    }, []);
    return (_jsxs("div", { children: [children, _jsx("div", { id: "toast-container", className: "toast-container" })] }));
};
export const useToast = () => ({
    show: (options) => window.toast?.show(options),
    success: (message, options) => window.toast?.success(message, options),
    error: (message, options) => window.toast?.error(message, options),
    info: (message, options) => window.toast?.info(message, options),
    warning: (message, options) => window.toast?.warning(message, options),
    dismiss: (id) => window.toast?.dismiss(id),
    dismissAll: () => window.toast?.dismissAll()
});
