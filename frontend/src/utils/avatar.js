/**
 * Avatar utility functions
 * Provides reliable fallback avatars using UI Avatars service
 */

/**
 * Generate a fallback avatar URL using UI Avatars
 * @param {string} name - User's name or email
 * @param {object} options - Customization options
 * @returns {string} Avatar URL
 */
export const getAvatarUrl = (name = 'User', options = {}) => {
  const {
    size = 128,
    background = '6366f1', // Primary purple color
    color = 'ffffff',
    rounded = true,
    bold = true,
  } = options;

  const initials = name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const params = new URLSearchParams({
    name: initials || 'U',
    size: size.toString(),
    background,
    color,
    rounded: rounded.toString(),
    bold: bold.toString(),
  });

  return `https://ui-avatars.com/api/?${params.toString()}`;
};

/**
 * Get user avatar with fallback
 * @param {object} user - User object with image, name, email properties
 * @param {object} options - Avatar options
 * @returns {string} Avatar URL (user's image or generated fallback)
 */
export const getUserAvatar = (user, options = {}) => {
  if (user?.image) {
    return user.image;
  }
  
  const name = user?.name || user?.email || 'User';
  return getAvatarUrl(name, options);
};

/**
 * Generate a random avatar for demo/placeholder purposes
 * Uses DiceBear Avatars API with different styles
 * @param {string} seed - Seed for consistent avatar generation
 * @param {string} style - Avatar style (avataaars, bottts, identicon, etc.)
 * @returns {string} Avatar URL
 */
export const getRandomAvatar = (seed = 'default', style = 'avataaars') => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
};
