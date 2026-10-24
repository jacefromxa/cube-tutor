/**
 * Resolve an asset URL taking into account Vite's BASE_URL and remote COS storage.
 * @param {string} path - e.g. '/assets/cubes/Easy-01.png' or '/videos/f2l.mp4'
 * @returns {string}
 */
export function resolveAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  // If VITE_COS_URL is configured, route video assets to Tencent Cloud COS
  const cosBase = import.meta.env.VITE_COS_URL;
  if (cosBase && (path.startsWith('/videos/') || path === '/video.mp4')) {
    const cleanCosBase = cosBase.endsWith('/') ? cosBase.slice(0, -1) : cosBase;
    const cleanPath = path === '/video.mp4' ? '/videos/f2l.mp4' : path;
    return `${cleanCosBase}${cleanPath}`;
  }

  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : base + '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
}


