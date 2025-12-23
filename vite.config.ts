import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    resolve: {
      alias: {
        '@': resolve(rootDir, 'frontend'),
        '@frontend': resolve(rootDir, 'frontend'),
        '@student': resolve(rootDir, 'frontend/student'),
        '@teacher': resolve(rootDir, 'frontend/teacher'),
        '@admin': resolve(rootDir, 'frontend/admin'),
        '@context': resolve(rootDir, 'frontend/context'),
        '@services': resolve(rootDir, 'frontend/services'),
        '@data': resolve(rootDir, 'frontend/data'),
        '@lib': resolve(rootDir, 'frontend/lib'),
        '@styles': resolve(rootDir, 'frontend/styles'),
        '@types': resolve(rootDir, 'frontend/types'),
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
