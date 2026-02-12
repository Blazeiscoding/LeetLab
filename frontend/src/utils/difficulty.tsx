import React from 'react';
import { IconBolt, IconCircleCheck, IconClock } from '@tabler/icons-react';
import { Difficulty } from '../types/enums';
import { DIFFICULTY_CONFIG, DEFAULT_DIFFICULTY_CONFIG } from '../constants/difficulty';

export const getDifficultyColor = (difficulty: Difficulty): string => {
  return DIFFICULTY_CONFIG[difficulty]?.color || DEFAULT_DIFFICULTY_CONFIG.color;
};

export const getDifficultyBgColor = (difficulty: Difficulty): string => {
  return DIFFICULTY_CONFIG[difficulty]?.bgColor || DEFAULT_DIFFICULTY_CONFIG.bgColor;
};

export const getDifficultyBadgeClass = (difficulty: Difficulty): string => {
  return DIFFICULTY_CONFIG[difficulty]?.badgeClass || DEFAULT_DIFFICULTY_CONFIG.badgeClass;
};

export const getDifficultyIcon = (
  difficulty: Difficulty,
  className = 'w-4 h-4'
): React.ReactNode => {
  const icons: Record<Difficulty, React.ReactNode> = {
    [Difficulty.EASY]: <IconCircleCheck className={className} />,
    [Difficulty.MEDIUM]: <IconClock className={className} />,
    [Difficulty.HARD]: <IconBolt className={className} />,
  };
  return icons[difficulty] || null;
};

export const getDifficultyLabel = (difficulty: Difficulty): string => {
  return DIFFICULTY_CONFIG[difficulty]?.label || difficulty;
};
