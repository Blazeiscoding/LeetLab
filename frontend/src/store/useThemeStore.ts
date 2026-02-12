import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'night';

interface ThemeState {
  themes: Theme[];
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDarkTheme: () => boolean;
  initTheme: () => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'night';
  try {
    const stored = localStorage.getItem('leetlab-theme');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.theme || 'night';
    }
  } catch {
    // Ignore parsing errors
  }
  return 'night';
};

const initialTheme = getInitialTheme();
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', initialTheme);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themes: ['light', 'night'],
      theme: initialTheme,

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'night' ? 'light' : 'night';
        get().setTheme(newTheme);
      },

      isDarkTheme: () => {
        return get().theme === 'night';
      },

      initTheme: () => {
        const theme = get().theme;
        document.documentElement.setAttribute('data-theme', theme);
      },
    }),
    {
      name: 'leetlab-theme',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);
