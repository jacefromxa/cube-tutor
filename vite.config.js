import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { cp, readdir } from 'node:fs/promises';
import path from 'node:path';

// Videos are streamed from the Tencent COS CDN in production (see .env / DEPLOYMENT.md),
// so they are left out of dist/ to keep the build output small and fast.
// Set KEEP_LOCAL_VIDEOS=1 when you need them locally (e.g. `npm run build && npm run preview`
// with an empty VITE_COS_URL).
const PUBLIC_ENTRIES_EXCLUDED_FROM_DIST =
  process.env.KEEP_LOCAL_VIDEOS === '1' ? [] : ['videos'];

/**
 * Replaces Vite's automatic `public/` copy so a single large folder can be skipped.
 * Runs after the bundle is written (and after Vite has emptied outDir).
 */
function copyPublicExcept(exclude) {
  let root = process.cwd();
  let outDir = 'dist';
  return {
    name: 'cubedex:copy-public',
    apply: 'build',
    configResolved(config) {
      root = config.root;
      outDir = config.build.outDir;
    },
    async writeBundle() {
      const source = path.join(root, 'public');
      const target = path.resolve(root, outDir);
      const entries = await readdir(source, { withFileTypes: true });
      await Promise.all(
        entries
          .filter(entry => !exclude.includes(entry.name))
          .map(entry =>
            cp(path.join(source, entry.name), path.join(target, entry.name), { recursive: true })
          )
      );
    }
  };
}

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';

  return {
    base: isBuild ? '/cfop/' : '/',
    // In dev Vite serves public/ directly; the build uses copyPublicExcept() instead.
    publicDir: isBuild ? false : 'public',
    plugins: [
      react(),
      tailwindcss(),
      isBuild && copyPublicExcept(PUBLIC_ENTRIES_EXCLUDED_FROM_DIST),
    ].filter(Boolean),
    server: {
      host: true,
      port: 5173,
    }
  };
});
