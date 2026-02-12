import {
  type ButtonHTMLAttributes,
  type ComponentType,
  type MouseEvent,
  forwardRef,
  useState,
} from 'react';
import { IconLoader } from '@tabler/icons-react';

/**
 * Enhanced Button component with haptic-like feedback and animations
 * 
 * Features:
 * - Scale animation on press
 * - Ripple effect on click
 * - Loading state with spinner
 * - Multiple variants and sizes
 */

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  danger: 'btn-error',
  success: 'btn-success',
  warning: 'btn-warning',
  info: 'btn-info',
};

const sizes = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;
type IconComponent = ComponentType<{ className?: string }>;

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: IconComponent;
  iconRight?: IconComponent;
  ripple?: boolean;
}

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size' | 'children'> {
  icon: IconComponent;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  tooltip?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  ripple = true,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Add ripple effect
    if (ripple) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rippleId = Date.now();

      setRipples((prev) => [...prev, { id: rippleId, x, y }]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId));
      }, 600);
    }

    onClick?.(e);
  };

  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={`
        btn relative overflow-hidden
        ${variants[variant] || variants.primary}
        ${sizes[size] || ''}
        ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple effects container */}
      {ripple && ripples.map(({ id, x, y }) => (
        <span
          key={id}
          className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
          style={{
            left: x,
            top: y,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Loading spinner */}
      {loading && (
        <IconLoader className="w-4 h-4 animate-spin mr-2" />
      )}

      {/* Left icon */}
      {Icon && !loading && (
        <Icon className="w-4 h-4 mr-2" />
      )}

      {/* Button content */}
      <span className="relative z-10">{children}</span>

      {/* Right icon */}
      {IconRight && (
        <IconRight className="w-4 h-4 ml-2" />
      )}
    </button>
  );
});

Button.displayName = 'Button';

/**
 * Icon-only button variant
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  tooltip,
  ...props
}, ref) => {
  const iconSizes: Record<ButtonSize, string> = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      className={`
        btn btn-circle
        ${variants[variant] || variants.ghost}
        ${sizes[size] || ''}
        ${disabled || loading ? 'opacity-70 cursor-not-allowed' : ''}
        ${className}
      `}
      title={tooltip}
      {...props}
    >
      {loading ? (
        <IconLoader className={`${iconSizes[size]} animate-spin`} />
      ) : (
        <Icon className={iconSizes[size]} />
      )}
    </button>
  );
});

IconButton.displayName = 'IconButton';

export default Button;
