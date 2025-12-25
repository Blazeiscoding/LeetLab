/**
 * Date and time formatting utilities
 * Consolidates duplicated formatting logic from various components
 */

/**
 * Format a date string to a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., "Dec 25, 2024")
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a date string to a full readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., "December 25, 2024")
 */
export const formatDateFull = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format a date string to relative time
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time (e.g., "5m ago", "2h ago", "3d ago")
 */
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};

/**
 * Format month and year for display
 * @param {number} year - Full year (e.g., 2024)
 * @param {number} month - Month (1-12)
 * @returns {string} Formatted month and year (e.g., "December 2024")
 */
export const formatMonthYear = (year, month) => {
  return new Date(year, month - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Format a date for display in submissions/activities
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatActivityDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};
