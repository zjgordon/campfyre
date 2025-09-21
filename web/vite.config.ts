import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    // Base path for production builds (useful for deployment in subdirectories)
    base: env.VITE_BASE_PATH || '/',

    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,

      // Optimize chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks for better caching
            vendor: ['react', 'react-dom'],
            mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
            router: ['react-router-dom'],
            query: ['@tanstack/react-query'],
            state: ['zustand'],
            forms: ['react-hook-form', 'zod', '@hookform/resolvers'],
          },
          // Asset naming for better caching
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name?.split('.').pop();
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (/woff2?|eot|ttf|otf/i.test(extType || '')) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },

      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,

      // Ensure proper asset handling for containerization
      assetsInlineLimit: 4096, // 4kb - inline smaller assets

      // Target modern browsers for better performance
      target: 'es2015',
    },

    // Development server configuration
    server: {
      host: '0.0.0.0', // Allow external connections (important for Docker)
      port: parseInt(env.VITE_DEV_PORT || '3000'),
      strictPort: true,
      watch: {
        usePolling: true, // Useful for Docker on Windows/Mac
      },
    },

    // Preview server configuration (for testing production builds)
    preview: {
      host: '0.0.0.0',
      port: parseInt(env.VITE_PREVIEW_PORT || '4173'),
      strictPort: true,
    },

    // Resolve configuration
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@stores': resolve(__dirname, 'src/stores'),
        '@types': resolve(__dirname, 'src/types'),
        '@lib': resolve(__dirname, 'src/lib'),
        '@utils': resolve(__dirname, 'src/utils'),
      },
    },

    // CSS configuration
    css: {
      devSourcemap: mode === 'development',
    },

    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },

    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@mui/material',
        '@emotion/react',
        '@emotion/styled',
        'react-router-dom',
        '@tanstack/react-query',
        'zustand',
        'react-hook-form',
        'zod',
        '@hookform/resolvers',
      ],
    },
  };
});
