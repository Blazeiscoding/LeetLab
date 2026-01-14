import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook to persist code in localStorage per problem and language
 * Prevents loss of code on page refresh
 */
export const useCodePersistence = (problemId, language, defaultCode = "") => {
  const [code, setCode] = useState(defaultCode);
  const [hasPersistedCode, setHasPersistedCode] = useState(false);
  const debounceTimerRef = useRef(null);

  // Generate storage key
  const getStorageKey = useCallback(() => {
    return `leetlab_code_${problemId}_${language}`;
  }, [problemId, language]);

  // Load code from localStorage on mount or when problem/language changes
  useEffect(() => {
    if (!problemId) return;

    const key = getStorageKey();
    const savedCode = localStorage.getItem(key);

    if (savedCode && savedCode !== defaultCode) {
      setCode(savedCode);
      setHasPersistedCode(true);
    } else {
      setCode(defaultCode);
      setHasPersistedCode(false);
    }
  }, [problemId, language, defaultCode, getStorageKey]);

  // Save code to localStorage with debounce
  const saveCode = useCallback(
    (newCode) => {
      setCode(newCode);

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce save to localStorage (500ms)
      debounceTimerRef.current = setTimeout(() => {
        if (problemId && newCode) {
          const key = getStorageKey();
          localStorage.setItem(key, newCode);
        }
      }, 500);
    },
    [problemId, getStorageKey]
  );

  // Reset to default code
  const resetCode = useCallback(() => {
    setCode(defaultCode);
    setHasPersistedCode(false);

    // Remove from localStorage
    const key = getStorageKey();
    localStorage.removeItem(key);
  }, [defaultCode, getStorageKey]);

  // Clear all code for this problem (all languages)
  const clearAllCodeForProblem = useCallback(() => {
    const languages = ["JAVASCRIPT", "PYTHON", "JAVA"];
    languages.forEach((lang) => {
      const key = `leetlab_code_${problemId}_${lang}`;
      localStorage.removeItem(key);
    });
    setCode(defaultCode);
    setHasPersistedCode(false);
  }, [problemId, defaultCode]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    code,
    setCode: saveCode,
    resetCode,
    hasPersistedCode,
    clearAllCodeForProblem,
  };
};
