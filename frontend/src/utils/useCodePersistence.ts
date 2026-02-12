import { useState, useEffect, useCallback, useRef } from 'react';

interface CodePersistenceReturn {
  code: string;
  setCode: (code: string) => void;
  resetCode: () => void;
  hasPersistedCode: boolean;
  clearAllCodeForProblem: () => void;
}

export const useCodePersistence = (
  problemId: string | undefined,
  language: string,
  defaultCode = ''
): CodePersistenceReturn => {
  const [code, setCode] = useState(defaultCode);
  const [hasPersistedCode, setHasPersistedCode] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getStorageKey = useCallback(() => {
    return `leetlab_code_${problemId}_${language}`;
  }, [problemId, language]);

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

  const saveCode = useCallback(
    (newCode: string) => {
      setCode(newCode);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (problemId && newCode) {
          const key = getStorageKey();
          localStorage.setItem(key, newCode);
        }
      }, 500);
    },
    [problemId, getStorageKey]
  );

  const resetCode = useCallback(() => {
    setCode(defaultCode);
    setHasPersistedCode(false);

    const key = getStorageKey();
    localStorage.removeItem(key);
  }, [defaultCode, getStorageKey]);

  const clearAllCodeForProblem = useCallback(() => {
    const languages = ['JAVASCRIPT', 'PYTHON', 'JAVA'];
    languages.forEach((lang) => {
      const key = `leetlab_code_${problemId}_${lang}`;
      localStorage.removeItem(key);
    });
    setCode(defaultCode);
    setHasPersistedCode(false);
  }, [problemId, defaultCode]);

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
