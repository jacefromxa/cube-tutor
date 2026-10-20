/**
 * Resolve an asset URL taking into account Vite's BASE_URL (e.g. /cfop/)
 * @param {string} path - e.g. '/assets/cubes/Easy-01.png' or '/videos/f2l.mp4'
 * @returns {string} - e.g. '/cfop/assets/cubes/Easy-01.png'
 */
export function resolveAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : base + '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
}

