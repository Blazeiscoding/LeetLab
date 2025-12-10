import { create } from "zustand";
import { persist } from "zustand/middleware";

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
      theme: "night",
      
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
    }
  )
);
