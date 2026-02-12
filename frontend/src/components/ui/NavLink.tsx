import { type ComponentType } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Reusable navigation link component with active state styling
 */
const NavLink = ({ 
  to, 
  label, 
  icon: Icon, 
  onClick,
  variant = 'desktop', // 'desktop' | 'mobile'
  className = '',
}: {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick?: () => void;
  variant?: 'desktop' | 'mobile';
  className?: string;
}) => {
  const location = useLocation();
  
  const isActive = () => {
    if (to === '/') {
      return location.pathname === '/';
    }
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  const active = isActive();

  if (variant === 'mobile') {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all duration-300 ${
          active
            ? 'bg-primary text-primary-content shadow-md'
            : 'text-base-content/70 hover:text-base-content hover:bg-base-content/5'
        } ${className}`}
      >
        <Icon className="w-5 h-5" />
        {label}
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className={`group relative px-4 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 hover:scale-105 ${
        active
          ? 'bg-primary text-primary-content shadow-lg shadow-primary/25'
          : 'text-base-content/70 hover:text-base-content hover:bg-base-content/5'
      } ${className}`}
    >
      <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
      <span className="text-sm font-bold">{label}</span>
      {/* Active indicator dot */}
      {active && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-content rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
};

export default NavLink;
