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
          target: env.VITE_API_URL || 'https://shopverse-server-sfvj.onrender.com/api/v1',
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})