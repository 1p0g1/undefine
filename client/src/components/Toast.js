import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo, createContext, useContext } from 'react';
import './Toast.css';
const ToastContext = createContext({
    show: () => null,
    success: () => null,
    error: () => null,
    info: () => null,
    warning: () => null,
    dismiss: () => { },
    dismissAll: () => { }
});
function ToastNotification({ id, type = 'info', message, duration = 3000, onClose }) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => onClose(id), duration);
            return () => clearTimeout(timer);
        }
    }, [duration, id, onClose]);
    return (_jsxs("div", { className: `toast toast-${type}`, children: [_jsx("span", { children: message }), _jsx("button", { className: "toast-close", onClick: () => onClose(id), children: "\u00D7" })] }));
}
function ToastProvider({ children, position = 'top-right' }) {
    const [toasts, setToasts] = useState([]);
    const toastFunctions = useMemo(() => ({
        show: (options) => {
            const id = options.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const newToast = {
                id,
                type: options.type || 'info',
                message: options.message,
                duration: options.duration
            };
            setToasts(prevToasts => [...prevToasts, newToast]);
            return id;
        },
        success: (message) => {
            return toastFunctions.show({ message, type: 'success' });
        },
        error: (message) => {
            return toastFunctions.show({ message, type: 'error' });
        },
        info: (message) => {
            return toastFunctions.show({ message, type: 'info' });
        },
        warning: (message) => {
            return toastFunctions.show({ message, type: 'warning' });
        },
        dismiss: (id) => {
            setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
        },
        dismissAll: () => {
            setToasts([]);
        }
    }), []);
    const getPositionStyles = () => {
        const base = { position: 'fixed', zIndex: 9999 };
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
    return (_jsxs(ToastContext.Provider, { value: toastFunctions, children: [children, _jsx("div", { className: "toast-container", style: getPositionStyles(), children: toasts.map(toast => (_jsx(ToastNotification, { id: toast.id, type: toast.type, message: toast.message, duration: toast.duration, onClose: toastFunctions.dismiss }, toast.id))) })] }));
}
function useToast() {
    return useContext(ToastContext);
}
export { ToastProvider, useToast };
