import React from 'react';
import { getDifficultyColor, getDifficultyIcon, getDifficultyBadgeClass } from '../../utils/difficulty';

/**
 * Reusable difficulty badge component
 * Displays difficulty level with consistent styling across the app
 */
const DifficultyBadge = ({
  difficulty,
  showIcon = false,
  size = 'md',
  variant = 'text', // 'text' | 'badge'
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (variant === 'badge') {
    return (
      <span className={`badge ${getDifficultyBadgeClass(difficulty)} ${size === 'sm' ? 'badge-sm' : ''} ${className}`}>
        {showIcon && getDifficultyIcon(difficulty, iconSizes[size])}
        {difficulty}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 font-semibold ${getDifficultyColor(difficulty)} ${sizeClasses[size]} ${className}`}>
      {showIcon && getDifficultyIcon(difficulty, iconSizes[size])}
      {difficulty}
    </div>
  );
};

export default DifficultyBadge;
