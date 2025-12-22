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
          manualChunks(id) {
            // Core React
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react';
            }
            // Supabase
            if (id.includes('node_modules/@supabase/')) {
              return 'vendor-supabase';
            }
            // Google AI SDK
            if (id.includes('node_modules/@google/generative-ai')) {
              return 'vendor-google-ai';
            }
            // PDF processing - lazy loaded
            if (id.includes('node_modules/pdfjs-dist')) {
              return 'vendor-pdf';
            }
            // UI Icons
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            // HTML/Canvas utilities - let these be dynamically imported chunks
            // Don't bundle them into a manual chunk so dynamic imports work
            if (id.includes('node_modules/html2canvas') || id.includes('node_modules/jspdf')) {
              return; // Let Rollup handle these dynamically
            }
            // NLP libraries
            if (id.includes('node_modules/natural') || id.includes('node_modules/compromise')) {
              return 'vendor-nlp';
            }
            // HTTP/networking
            if (id.includes('node_modules/axios') || id.includes('node_modules/cheerio')) {
              return 'vendor-http';
            }
            // Student components - Assessment
            if (id.includes('frontend/student/components/Assessment')) {
              return 'student-assessment';
            }
            // Student components - Courses
            if (id.includes('frontend/student/components/Courses')) {
              return 'student-courses';
            }
            // Student components - Labs
            if (id.includes('frontend/student/components/Labs')) {
              return 'student-labs';
            }
            // Student components - Career
            if (id.includes('frontend/student/components/Career')) {
              return 'student-career';
            }
            // Admin components
            if (id.includes('frontend/admin/')) {
              return 'admin';
            }
            // Teacher components
            if (id.includes('frontend/teacher/')) {
              return 'teacher';
            }
            // Services
            if (id.includes('frontend/services/')) {
              return 'services';
            }
            // Data files
            if (id.includes('frontend/data/')) {
              return 'data';
            }
          },
        },
      },
      chunkSizeWarningLimit: 500,
    },
  };
});
