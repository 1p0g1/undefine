export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export interface Layout {
  maxWidth: string;
  padding: string;
  margin: string;
  borderRadius: string;
  boxShadow: string;
}

export interface Animation {
  duration: string;
  timing: string;
  delay: string;
}

export interface Responsive {
  mobile: string;
  tablet: string;
  desktop: string;
}

export interface UIState {
  theme: Theme;
  layout: Layout;
  animation: Animation;
  responsive: Responsive;
  isDarkMode: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface Modal {
  id: string;
  title: string;
  content: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export interface InputProps {
  type?: 'text' | 'password' | 'email' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export interface SoundConfig {
  enabled: boolean;
  volume: number;
  effects: {
    click: string;
    success: string;
    error: string;
    hint: string;
  };
} 