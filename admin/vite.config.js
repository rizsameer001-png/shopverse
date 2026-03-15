// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';

// export default defineConfig({
//   plugins: [react()],
//   resolve: { alias: { '@': path.resolve(__dirname, './src') } },
//   server: {
//     port: 5174,
//     proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
//   },
// });


import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load environment variables prefixed with VITE_
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5174,
      proxy: {
        '/api': {
          // Remove /api/v1 from target because /api is already in path
          target: env.VITE_API_URL || 'https://shopverse-server-sfvj.onrender.com',
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      // Build output folder
      outDir: 'dist',
      // Ensure correct base path for production if hosted in subfolder
      sourcemap: false
    },
    // Base should be "/" unless you host in a subfolder
    base: '/',
  }
})