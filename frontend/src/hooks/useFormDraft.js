import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for auto-saving form drafts to localStorage
 * 
 * Features:
 * - Auto-save with debouncing
 * - Manual save/load/clear
 * - Form data persistence across sessions
 * - Draft expiration (optional)
 */
export const useFormDraft = (key, options = {}) => {
  const {
    debounceMs = 2000,
    expirationMs = 24 * 60 * 60 * 1000, // 24 hours default
    onLoad = null,
  } = options;

  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const timeoutRef = useRef(null);

  const storageKey = `form-draft-${key}`;

  // Check for existing draft on mount
  useEffect(() => {
    const checkDraft = () => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const { timestamp, data } = JSON.parse(stored);
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

  // Save draft to localStorage
  const saveDraft = useCallback((data) => {
    try {
      const draft = {
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
  }, [storageKey]);

  // Debounced save for auto-saving
  const debouncedSave = useCallback((data) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveDraft(data);
    }, debounceMs);
  }, [saveDraft, debounceMs]);

  // Load draft from localStorage
  const loadDraft = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const { timestamp, data } = JSON.parse(stored);
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

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
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

  // Format last saved time for display
  const getLastSavedText = useCallback(() => {
    if (!lastSaved) return null;
    
    const now = new Date();
    const diff = now - lastSaved;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return lastSaved.toLocaleDateString();
  }, [lastSaved]);

  // Cleanup on unmount
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
