import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';

export default defineConfig({
  plugins: [react(), cesium()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/erddap': {
        target: 'https://erddap.incois.gov.in',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
