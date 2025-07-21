import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: '/',
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    publicDir: 'public',
    build: {
      outDir: 'dist',
      copyPublicDir: true,
      assetsDir: 'assets',
      sourcemap: true,
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'favicon.png') {
              return 'favicon.png';
            }
            if (assetInfo.name?.endsWith('.jpg') || assetInfo.name?.endsWith('.jpeg')) {
              return 'assets/[name][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          }
        }
      }
    },
    // Vite 4.x.x and higher
    define: {
      'process.env': env
    }
  };
});
