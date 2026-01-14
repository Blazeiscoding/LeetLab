import React from 'react';
import { IconBolt, IconCircleCheck, IconClock } from '@tabler/icons-react';
import { DIFFICULTY_CONFIG, DEFAULT_DIFFICULTY_CONFIG } from '../constants/difficulty';

/**
 * Get text color class for a difficulty level
 * @param {string} difficulty - EASY, MEDIUM, or HARD
 * @returns {string} Tailwind text color class
 */
export const getDifficultyColor = (difficulty) => {
  return DIFFICULTY_CONFIG[difficulty]?.color || DEFAULT_DIFFICULTY_CONFIG.color;
};

/**
 * Get background color class for a difficulty level
 * @param {string} difficulty - EASY, MEDIUM, or HARD
 * @returns {string} Tailwind background color class
 */
export const getDifficultyBgColor = (difficulty) => {
  return DIFFICULTY_CONFIG[difficulty]?.bgColor || DEFAULT_DIFFICULTY_CONFIG.bgColor;
};

/**
 * Get badge class for a difficulty level
 * @param {string} difficulty - EASY, MEDIUM, or HARD
 * @returns {string} DaisyUI badge class
 */
export const getDifficultyBadgeClass = (difficulty) => {
  return DIFFICULTY_CONFIG[difficulty]?.badgeClass || DEFAULT_DIFFICULTY_CONFIG.badgeClass;
};

/**
 * Get icon component for a difficulty level
 * @param {string} difficulty - EASY, MEDIUM, or HARD
 * @param {string} className - Additional CSS classes for the icon
 * @returns {React.ReactNode} Icon component or null
 */
export const getDifficultyIcon = (difficulty, className = 'w-4 h-4') => {
  const icons = {
    EASY: <IconCircleCheck className={className} />,
    MEDIUM: <IconClock className={className} />,
    HARD: <IconBolt className={className} />,
  };
  return icons[difficulty] || null;
};

/**
 * Get the display label for a difficulty level
 * @param {string} difficulty - EASY, MEDIUM, or HARD
 * @returns {string} Human-readable label
 */
export const getDifficultyLabel = (difficulty) => {
  return DIFFICULTY_CONFIG[difficulty]?.label || difficulty;
};
