import { getDifficultyColor, getDifficultyIcon, getDifficultyBadgeClass } from '../../utils/difficulty';
import { type Difficulty } from '../../types';

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
}: {
  difficulty: Difficulty;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'text' | 'badge';
  className?: string;
}) => {
  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes: Record<'sm' | 'md' | 'lg', string> = {
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
