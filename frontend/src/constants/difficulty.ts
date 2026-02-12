import { Difficulty } from '../types/enums';

interface DifficultyConfig {
  label: string;
  color: string;
  bgColor: string;
  badgeClass: string;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  [Difficulty.EASY]: {
    label: 'Easy',
    color: 'text-success',
    bgColor: 'bg-success',
    badgeClass: 'badge-success',
  },
  [Difficulty.MEDIUM]: {
    label: 'Medium',
    color: 'text-warning',
    bgColor: 'bg-warning',
    badgeClass: 'badge-warning',
  },
  [Difficulty.HARD]: {
    label: 'Hard',
    color: 'text-error',
    bgColor: 'bg-error',
    badgeClass: 'badge-error',
  },
};

export const DEFAULT_DIFFICULTY_CONFIG: DifficultyConfig = {
  label: 'Unknown',
  color: 'text-base-content/60',
  bgColor: 'bg-base-content/60',
  badgeClass: 'badge-ghost',
};
