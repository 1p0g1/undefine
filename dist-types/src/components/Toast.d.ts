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
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}
/**
 * ToastContainer component to manage multiple Toast notifications
 */
declare const ToastContainer: React.FC<ToastContainerProps>;
export { Toast, ToastContainer };
export declare const toast: {
    show: (options: ToastOptions) => any;
    success: (message: string, options?: Omit<ToastOptions, "message" | "type" | "position">) => any;
    error: (message: string, options?: Omit<ToastOptions, "message" | "type" | "position">) => any;
    info: (message: string, options?: Omit<ToastOptions, "message" | "type" | "position">) => any;
    warning: (message: string, options?: Omit<ToastOptions, "message" | "type" | "position">) => any;
    dismiss: (id: string) => any;
    dismissAll: () => any;
};
interface ToastInstance {
    show: (options: ToastOptions) => void;
    success: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => void;
    error: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => void;
    info: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => void;
    warning: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => void;
    dismiss: (id: string) => void;
    dismissAll: () => void;
}
declare global {
    interface Window {
        toast?: ToastInstance;
    }
}
export declare const ToastProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useToast: () => {
    show: (options: ToastOptions) => void | undefined;
    success: (message: string, options?: Omit<ToastOptions, "message" | "type">) => void | undefined;
    error: (message: string, options?: Omit<ToastOptions, "message" | "type">) => void | undefined;
    info: (message: string, options?: Omit<ToastOptions, "message" | "type">) => void | undefined;
    warning: (message: string, options?: Omit<ToastOptions, "message" | "type">) => void | undefined;
    dismiss: (id: string) => void | undefined;
    dismissAll: () => void | undefined;
};
