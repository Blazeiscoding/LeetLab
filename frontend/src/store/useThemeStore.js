import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Theme store for managing app-wide theme state
 * Persists to localStorage for preference retention
 */
export const useThemeStore = create(
  persist(
    (set, get) => ({
      // Available DaisyUI themes
      themes: ["night", "dark", "light", "cupcake", "dracula", "synthwave", "forest"],
      
      // Current theme (default: night)
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
        const isDark = ["night", "dark", "dracula", "synthwave", "forest"].includes(currentTheme);
        const newTheme = isDark ? "light" : "night";
        get().setTheme(newTheme);
      },
      
      // Check if current theme is dark
      isDarkTheme: () => {
        const currentTheme = get().theme;
        return ["night", "dark", "dracula", "synthwave", "forest"].includes(currentTheme);
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
