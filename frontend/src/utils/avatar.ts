interface AvatarOptions {
  size?: number;
  background?: string;
  color?: string;
  rounded?: boolean;
  bold?: boolean;
}

interface UserWithImage {
  image?: string | null;
  name?: string | null;
  email?: string | null;
}

export const getAvatarUrl = (
  name = 'User',
  options: AvatarOptions = {}
): string => {
  const {
    size = 128,
    background = '6366f1',
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

export const getUserAvatar = (
  user: UserWithImage | null | undefined,
  options: AvatarOptions = {}
): string => {
  if (user?.image) {
    return user.image;
  }

  const name = user?.name || user?.email || 'User';
  return getAvatarUrl(name, options);
};

export const getRandomAvatar = (
  seed = 'default',
  style = 'avataaars'
): string => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
};
