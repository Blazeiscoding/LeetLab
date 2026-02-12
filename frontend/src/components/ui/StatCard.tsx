import { type ComponentType, type ReactNode } from 'react';

/**
 * Reusable stat card component
 * Used for displaying statistics in HomePage, ProfilePage, and ProblemsPage
 */
const StatCard = ({
  label,
  value,
  color = 'text-primary',
  icon: Icon = null,
  className = '',
}: {
  label: string;
  value: ReactNode;
  color?: string;
  icon?: ComponentType<{ className?: string }> | null;
  className?: string;
}) => {
  return (
    <div className={`bg-base-100/80 backdrop-blur-md rounded-2xl p-4 border border-base-content/5 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {Icon && (
        <div className={`mb-2 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className={`text-3xl font-black ${color} mb-1`}>
        {value}
      </div>
      <div className="text-xs font-bold text-base-content/50 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
};

/**
 * Compact stat display for inline use
 */
export const StatInline = ({
  label,
  value,
  color = 'text-primary',
}: {
  label: string;
  value: ReactNode;
  color?: string;
}) => {
  return (
    <div className="text-center px-4">
      <div className="text-xs font-bold uppercase tracking-wider opacity-60">
        {label}
      </div>
      <div className={`font-black text-xl ${color}`}>
        {value}
      </div>
    </div>
  );
};

export default StatCard;
