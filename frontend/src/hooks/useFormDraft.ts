import { useState, useEffect, useCallback, useRef } from 'react';

interface UseFormDraftOptions<T> {
  debounceMs?: number;
  expirationMs?: number;
  onLoad?: ((data: T) => void) | null;
}

interface StoredDraft<T> {
  timestamp: number;
  data: T;
}

interface UseFormDraftReturn<T> {
  hasDraft: boolean;
  lastSaved: Date | null;
  saveDraft: (data: T) => boolean;
  debouncedSave: (data: T) => void;
  loadDraft: () => T | null;
  clearDraft: () => boolean;
  getLastSavedText: () => string | null;
}

export const useFormDraft = <T = unknown>(
  key: string,
  options: UseFormDraftOptions<T> = {}
): UseFormDraftReturn<T> => {
  const {
    debounceMs = 2000,
    expirationMs = 24 * 60 * 60 * 1000,
    onLoad = null,
  } = options;

  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const storageKey = `form-draft-${key}`;

  useEffect(() => {
    const checkDraft = () => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const { timestamp } = JSON.parse(stored) as StoredDraft<T>;
          const isExpired = expirationMs && Date.now() - timestamp > expirationMs;

          if (isExpired) {
            localStorage.removeItem(storageKey);
            setHasDraft(false);
          } else {
            setHasDraft(true);
            setLastSaved(new Date(timestamp));
          }
        }
      } catch (error) {
        console.warn('Error checking form draft:', error);
        setHasDraft(false);
      }
    };

    checkDraft();
  }, [storageKey, expirationMs]);

  const saveDraft = useCallback(
    (data: T): boolean => {
      try {
        const draft: StoredDraft<T> = {
          timestamp: Date.now(),
          data,
        };
        localStorage.setItem(storageKey, JSON.stringify(draft));
        setHasDraft(true);
        setLastSaved(new Date());
        return true;
      } catch (error) {
        console.error('Error saving form draft:', error);
        return false;
      }
    },
    [storageKey]
  );

  const debouncedSave = useCallback(
    (data: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        saveDraft(data);
      }, debounceMs);
    },
    [saveDraft, debounceMs]
  );

  const loadDraft = useCallback((): T | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const { timestamp, data } = JSON.parse(stored) as StoredDraft<T>;
        const isExpired = expirationMs && Date.now() - timestamp > expirationMs;

        if (isExpired) {
          localStorage.removeItem(storageKey);
          setHasDraft(false);
          return null;
        }

        onLoad?.(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error loading form draft:', error);
      return null;
    }
  }, [storageKey, expirationMs, onLoad]);

  const clearDraft = useCallback((): boolean => {
    try {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      localStorage.removeItem(storageKey);
      setHasDraft(false);
      setLastSaved(null);
      return true;
    } catch (error) {
      console.error('Error clearing form draft:', error);
      return false;
    }
  }, [storageKey]);

  const getLastSavedText = useCallback((): string | null => {
    if (!lastSaved) return null;

    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

    return lastSaved.toLocaleDateString();
  }, [lastSaved]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    hasDraft,
    lastSaved,
    saveDraft,
    debouncedSave,
    loadDraft,
    clearDraft,
    getLastSavedText,
  };
};

export default useFormDraft;
