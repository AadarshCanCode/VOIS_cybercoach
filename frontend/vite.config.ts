import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    root: rootDir,
    plugins: [react(), tailwindcss()],
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    resolve: {
      alias: {
        // Specific aliases must come before generic @ alias
        '@app': resolve(rootDir, 'src/app'),
        '@features': resolve(rootDir, 'src/features'),
        '@student': resolve(rootDir, 'src/features/student'),
        '@shared': resolve(rootDir, 'src/shared'),
        '@components': resolve(rootDir, 'src/shared/components'),
        '@services': resolve(rootDir, 'src/shared/services'),
        '@context': resolve(rootDir, 'src/shared/context'),
        '@lib': resolve(rootDir, 'src/shared/lib'),
        '@types': resolve(rootDir, 'src/shared/types'),
        '@utils': resolve(rootDir, 'src/shared/utils'),
        '@assets': resolve(rootDir, 'src/assets'),
        '@data': resolve(rootDir, 'src/data'),
        '@styles': resolve(rootDir, 'src/styles'),
        // Generic @ alias last
        '@': resolve(rootDir, 'src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
        '/proxy': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
        '/proctor-logs': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
        '/test-models': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      rollupOptions: {
        output: {
          // Default output configuration
        },
      },
      chunkSizeWarningLimit: 500,
    },
  };
});
