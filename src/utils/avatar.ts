/** Fallback when member has no uploaded avatar. */
export const DEFAULT_AVATAR = '/avatars/default.svg';

export function resolveAvatar(avatar?: string | null): string {
  const v = (avatar || '').trim();
  if (!v) return DEFAULT_AVATAR;
  return v;
}
