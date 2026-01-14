import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
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

const Button = forwardRef(({
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
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (disabled || loading) return;

    // Add ripple effect
    if (ripple) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rippleId = Date.now();

      setRipples(prev => [...prev, { id: rippleId, x, y }]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== rippleId));
      }, 600);
    }

    onClick?.(e);
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
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
      whileTap={{ scale: isDisabled ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
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
    </motion.button>
  );
});

Button.displayName = 'Button';

/**
 * Icon-only button variant
 */
export const IconButton = forwardRef(({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  tooltip,
  ...props
}, ref) => {
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <motion.button
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
      whileTap={{ scale: disabled || loading ? 1 : 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      title={tooltip}
      {...props}
    >
      {loading ? (
        <IconLoader className={`${iconSizes[size]} animate-spin`} />
      ) : (
        <Icon className={iconSizes[size]} />
      )}
    </motion.button>
  );
});

IconButton.displayName = 'IconButton';

export default Button;
