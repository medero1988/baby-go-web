const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Resuelve URLs de media/avatar del API.
 * Cloudinary ya viene absoluto; uploads locales llegan como `/api/uploads/...`.
 */
export function mediaSrc(url?: string | null): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;

  const path = url.startsWith('/') ? url : `/${url}`;

  // Proxy de Vite: dejar relativo.
  if (API_URL.startsWith('/')) return path;

  try {
    const origin = new URL(API_URL).origin;
    return `${origin}${path}`;
  } catch {
    return path;
  }
}

type MediaLike = {
  url?: string;
  urls?: {
    original?: string;
    thumbnail?: string;
    card?: string;
    detail?: string;
  };
};

/** Preferí el original: los transforms de Cloudinary a veces 404ean. */
export function mediaDisplayUrl(
  media?: MediaLike | null,
  prefer: 'card' | 'detail' | 'thumbnail' = 'card',
): string {
  if (!media) return '';
  const preferred = media.urls?.[prefer];
  return mediaSrc(
    media.url ||
      media.urls?.original ||
      preferred ||
      media.urls?.card ||
      media.urls?.detail ||
      media.urls?.thumbnail,
  );
}

export function productCover(medias?: MediaLike[] | null): string {
  return mediaDisplayUrl(medias?.[0], 'card');
}

/** Avatar de store: thumbnail para listas, url/original como fallback. */
export function avatarSrc(
  avatar?: MediaLike | string | null,
  prefer: 'thumbnail' | 'card' | 'detail' = 'thumbnail',
): string {
  if (!avatar) return '';
  if (typeof avatar === 'string') return mediaSrc(avatar);
  return mediaSrc(
    avatar.urls?.[prefer] ||
      avatar.url ||
      avatar.urls?.original ||
      avatar.urls?.thumbnail ||
      avatar.urls?.card ||
      avatar.urls?.detail,
  );
}
