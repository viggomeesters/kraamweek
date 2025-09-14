// Design System Configuration
// Centralized design tokens for consistent styling

export const designTokens = {
  // Color Palette
  colors: {
    primary: {
      50: '#eef2ff',
      100: '#e0e7ff',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
  },

  // Typography Scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // Spacing Scale
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },

  // Border Radius Scale
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
  },

  // Shadow Scale
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  // Animation & Transitions
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'ease',
      linear: 'linear',
      'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
      'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
      'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
} as const;

// Component Design Patterns
export const componentPatterns = {
  // Button variants
  button: {
    base: 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    sizes: {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    },
    variants: {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
      outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
      ghost: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
      danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
      success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
    },
  },

  // Input variants
  input: {
    base: 'w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
    states: {
      default: 'border-gray-300',
      error: 'border-error-300 focus:ring-error-500 focus:border-error-500',
      success: 'border-success-300 focus:ring-success-500 focus:border-success-500',
    },
    sizes: {
      sm: 'px-2.5 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    },
  },

  // Card variants
  card: {
    base: 'bg-white rounded-lg shadow-sm border border-gray-200',
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },

  // Alert variants
  alert: {
    base: 'p-4 rounded-md border',
    variants: {
      info: 'bg-info-50 border-info-200 text-info-700',
      success: 'bg-success-50 border-success-200 text-success-700',
      warning: 'bg-warning-50 border-warning-200 text-warning-700',
      error: 'bg-error-50 border-error-200 text-error-700',
    },
  },
} as const;

// Utility functions
export const cn = (...classes: (string | undefined | null | boolean)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const getButtonClasses = (
  variant: keyof typeof componentPatterns.button.variants = 'primary',
  size: keyof typeof componentPatterns.button.sizes = 'md'
): string => {
  return cn(
    componentPatterns.button.base,
    componentPatterns.button.sizes[size],
    componentPatterns.button.variants[variant]
  );
};

export const getInputClasses = (
  state: keyof typeof componentPatterns.input.states = 'default',
  size: keyof typeof componentPatterns.input.sizes = 'md'
): string => {
  return cn(
    componentPatterns.input.base,
    componentPatterns.input.sizes[size],
    componentPatterns.input.states[state]
  );
};

export const getCardClasses = (
  padding: keyof typeof componentPatterns.card.padding = 'md'
): string => {
  return cn(
    componentPatterns.card.base,
    componentPatterns.card.padding[padding]
  );
};

export const getAlertClasses = (
  variant: keyof typeof componentPatterns.alert.variants = 'info'
): string => {
  return cn(
    componentPatterns.alert.base,
    componentPatterns.alert.variants[variant]
  );
};