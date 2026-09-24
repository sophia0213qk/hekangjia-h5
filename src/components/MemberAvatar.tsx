import React, { useEffect, useState } from 'react';
import { DEFAULT_AVATAR, resolveAvatar } from '../utils/avatar';

type MemberAvatarProps = {
  src?: string | null;
  alt?: string;
  className?: string;
};

/** Round avatar with default fallback when src is empty or fails to load. */
export const MemberAvatar: React.FC<MemberAvatarProps> = ({
  src,
  alt = '头像',
  className = 'w-10 h-10 rounded-full object-cover',
}) => {
  const resolved = resolveAvatar(src);
  const [broken, setBroken] = useState(false);

  // Reset error state whenever the avatar URL changes
  useEffect(() => {
    setBroken(false);
  }, [resolved]);

  const url = broken ? DEFAULT_AVATAR : resolved;

  return (
    <img
      key={url}
      src={url}
      alt={alt}
      className={className}
      onError={() => {
        if (url !== DEFAULT_AVATAR) setBroken(true);
      }}
    />
  );
};
