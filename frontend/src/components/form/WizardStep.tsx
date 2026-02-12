import { type ComponentType, type ReactNode, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconAlertCircle, IconChevronDown } from '@tabler/icons-react';

/**
 * WizardStep - Individual step wrapper with collapsible sections
 * 
 * Features:
 * - Collapsible sections
 * - Validation summary
 * - Animated transitions
 */

interface WizardStepProps {
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
  errors?: string[];
}

const WizardStep = ({
  title,
  description,
  icon: Icon,
  children,
  errors = [],
}: WizardStepProps) => {
  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && (
            <p className="text-base-content/60 mt-1">{description}</p>
          )}
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {children}
      </div>

      {/* Validation Summary */}
      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-error/10 border border-error/20"
        >
          <div className="flex items-center gap-2 text-error font-medium mb-2">
            <IconAlertCircle className="w-5 h-5" />
            Please fix the following errors:
          </div>
          <ul className="list-disc list-inside text-sm text-error/80 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

/**
 * CollapsibleSection - Collapsible form section within a step
 */
export const CollapsibleSection = ({
  title,
  icon: Icon,
  defaultOpen = true,
  badge,
  children,
}: {
  title: string;
  icon?: ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  badge?: string;
  children: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <div className="card bg-base-200 shadow-md overflow-hidden">
      {/* Section Header */}
      <button
        type="button"
        onClick={toggle}
        className="w-full p-4 md:p-6 flex items-center justify-between hover:bg-base-300/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-primary" />}
          <h3 className="text-lg font-semibold">{title}</h3>
          {badge && (
            <span className="badge badge-primary badge-sm">{badge}</span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <IconChevronDown className="w-5 h-5 text-base-content/50" />
        </motion.div>
      </button>

      {/* Section Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 md:p-6 pt-0 border-t border-base-300">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WizardStep;
