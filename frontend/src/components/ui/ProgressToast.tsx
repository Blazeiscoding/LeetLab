import { useState, useEffect, useCallback } from 'react';
import toast, { Toast } from 'react-hot-toast';
import { IconAlertCircle, IconAlertTriangle, IconCircleCheck, IconInfoCircle, IconArrowBackUp, IconX } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactElement } from 'react';

/**
 * Enhanced toast notification with progress bar and undo action
 */

// Progress Toast Component
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ProgressToastProps {
  t: Toast;
  message: string;
  type?: ToastType;
  duration?: number;
  onUndo?: () => void;
  undoLabel?: string;
  showProgress?: boolean;
}

interface ToastOptions {
  duration?: number;
  undoLabel?: string;
  showProgress?: boolean;
}

interface UndoToastOptions extends ToastOptions {
  type?: ToastType;
}

const ProgressToast = ({ 
  t, 
  message, 
  type = 'info', 
  duration = 4000,
  onUndo,
  undoLabel = 'Undo',
  showProgress = true 
}: ProgressToastProps) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!showProgress) return;
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, showProgress]);

  const icons: Record<ToastType, ReactElement> = {
    success: <IconCircleCheck className="w-5 h-5 text-success" />,
    error: <IconAlertCircle className="w-5 h-5 text-error" />,
    warning: <IconAlertTriangle className="w-5 h-5 text-warning" />,
    info: <IconInfoCircle className="w-5 h-5 text-info" />,
  };

  const bgColors: Record<ToastType, string> = {
    success: 'bg-success/10 border-success/20',
    error: 'bg-error/10 border-error/20',
    warning: 'bg-warning/10 border-warning/20',
    info: 'bg-info/10 border-info/20',
  };

  const progressColors: Record<ToastType, string> = {
    success: 'bg-success',
    error: 'bg-error',
    warning: 'bg-warning',
    info: 'bg-info',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`
        relative overflow-hidden rounded-xl border shadow-lg
        bg-base-100 min-w-[300px] max-w-md
      `}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`p-2 rounded-lg ${bgColors[type]}`}>
            {icons[type]}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-base-content">{message}</p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {onUndo && (
              <button
                onClick={() => {
                  onUndo();
                  toast.dismiss(t.id);
                }}
                className="btn btn-ghost btn-xs gap-1 text-primary hover:bg-primary/10"
              >
                <IconArrowBackUp className="w-3 h-3" />
                {undoLabel}
              </button>
            )}
            <button
              onClick={() => toast.dismiss(t.id)}
              className="btn btn-ghost btn-circle btn-xs"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      {showProgress && (
        <div className="h-1 bg-base-200">
          <motion.div
            className={`h-full ${progressColors[type]}`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}
    </motion.div>
  );
};

// Toast utility functions
export const showToast = {
  success: (message: string, options: ToastOptions = {}) => {
    return toast.custom((t) => (
      <ProgressToast t={t} message={message} type="success" {...options} />
    ), { duration: options.duration || 3000 });
  },
  
  error: (message: string, options: ToastOptions = {}) => {
    return toast.custom((t) => (
      <ProgressToast t={t} message={message} type="error" {...options} />
    ), { duration: options.duration || 5000 });
  },
  
  warning: (message: string, options: ToastOptions = {}) => {
    return toast.custom((t) => (
      <ProgressToast t={t} message={message} type="warning" {...options} />
    ), { duration: options.duration || 4000 });
  },
  
  info: (message: string, options: ToastOptions = {}) => {
    return toast.custom((t) => (
      <ProgressToast t={t} message={message} type="info" {...options} />
    ), { duration: options.duration || 4000 });
  },
  
  // Special toast with undo action
  withUndo: (message: string, onUndo: () => void, options: UndoToastOptions = {}) => {
    return toast.custom((t) => (
      <ProgressToast 
        t={t} 
        message={message} 
        type={options.type || "info"} 
        onUndo={onUndo}
        {...options} 
      />
    ), { duration: options.duration || 6000 });
  },
  
  // Loading toast that returns a promise resolver
  loading: (message: string) => {
    const toastId = toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative overflow-hidden rounded-xl border shadow-lg bg-base-100 min-w-[300px]"
      >
        <div className="p-4 flex items-center gap-3">
          <span className="loading loading-spinner loading-sm text-primary"></span>
          <p className="font-medium text-base-content">{message}</p>
        </div>
        {/* Indeterminate progress */}
        <div className="h-1 bg-base-200 overflow-hidden">
          <div className="h-full w-1/3 bg-primary animate-slide-right" />
        </div>
      </motion.div>
    ), { duration: Infinity });
    
    return {
      success: (newMessage: string) => {
        toast.dismiss(toastId);
        showToast.success(newMessage);
      },
      error: (newMessage: string) => {
        toast.dismiss(toastId);
        showToast.error(newMessage);
      },
      dismiss: () => toast.dismiss(toastId),
    };
  },
};

export default ProgressToast;
