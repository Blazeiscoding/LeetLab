import { create } from "zustand";
import { persist } from "zustand/middleware";

// Get initial theme synchronously from localStorage to prevent flash
const getInitialTheme = () => {
  if (typeof window === "undefined") return "night";
  try {
    const stored = localStorage.getItem("leetlab-theme");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.theme || "night";
    }
  } catch {
    // Ignore parsing errors
  }
  return "night";
};

// Apply theme immediately on script load to prevent flash
const initialTheme = getInitialTheme();
if (typeof document !== "undefined") {
  document.documentElement.setAttribute("data-theme", initialTheme);
}

/**
 * Theme store for managing app-wide theme state
 * Persists to localStorage for preference retention
 */
export const useThemeStore = create(
  persist(
    (set, get) => ({
      // Available themes: just light and dark
      themes: ["light", "night"],
      
      // Current theme (default: night/dark)
      theme: initialTheme,
      
      // Set a specific theme
      setTheme: (theme) => {
        set({ theme });
        // Apply to document immediately
        document.documentElement.setAttribute("data-theme", theme);
      },
      
      // Toggle between light and dark mode
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === "night" ? "light" : "night";
        get().setTheme(newTheme);
      },
      
      // Check if current theme is dark
      isDarkTheme: () => {
        return get().theme === "night";
      },
      
      // Initialize theme on app load
      initTheme: () => {
        const theme = get().theme;
        document.documentElement.setAttribute("data-theme", theme);
      },
    }),
    {
      name: "leetlab-theme", // localStorage key
      partialize: (state) => ({ theme: state.theme }), // Only persist theme
      onRehydrateStorage: () => (state) => {
        // After rehydration, apply the theme
        if (state?.theme) {
          document.documentElement.setAttribute("data-theme", state.theme);
        }
      },
    }
  )
);

