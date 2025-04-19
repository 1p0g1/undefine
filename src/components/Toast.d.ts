import React from 'react';
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
declare const Toast: React.FC<ToastProps>;
interface ToastContainerProps {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}
export interface ToastOptions {
    id?: string;
    type?: ToastType;
    message: string;
    duration?: number;
}
/**
 * ToastContainer component to manage multiple Toast notifications
 */
declare const ToastContainer: React.FC<ToastContainerProps>;
export { Toast, ToastContainer };
export declare const toast: {
    show: (options: ToastOptions) => any;
    success: (message: string, options?: Omit<ToastOptions, "message" | "type">) => any;
    error: (message: string, options?: Omit<ToastOptions, "message" | "type">) => any;
    info: (message: string, options?: Omit<ToastOptions, "message" | "type">) => any;
    warning: (message: string, options?: Omit<ToastOptions, "message" | "type">) => any;
    dismiss: (id: string) => any;
    dismissAll: () => any;
};
