/**
 * Centralized difficulty level constants and configuration
 * Used across the application for consistent difficulty handling
 */

// Difficulty levels enum
export const DIFFICULTY = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
};

// Difficulty display configuration with all styling variants
export const DIFFICULTY_CONFIG = {
  EASY: {
    label: 'Easy',
    color: 'text-success',
    bgColor: 'bg-success',
    badgeClass: 'badge-success',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'text-warning',
    bgColor: 'bg-warning',
    badgeClass: 'badge-warning',
  },
  HARD: {
    label: 'Hard',
    color: 'text-error',
    bgColor: 'bg-error',
    badgeClass: 'badge-error',
  },
};

// Default configuration for unknown difficulties
export const DEFAULT_DIFFICULTY_CONFIG = {
  label: 'Unknown',
  color: 'text-base-content/60',
  bgColor: 'bg-base-content/60',
  badgeClass: 'badge-ghost',
};
