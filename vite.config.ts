import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  esbuild: {
    target: 'es2020',
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://gisn.tel-aviv.gov.il',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    hmr: {
      overlay: false
    }
  },
  optimizeDeps: {
    include: ["to-fast-properties"],
    force: true
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Split the vendor bundle into cacheable chunks so a code change
        // doesn't force users to re-download React/MUI/Leaflet every deploy.
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled',
          ],
          'leaflet-vendor': [
            'leaflet',
            'react-leaflet',
            'react-leaflet-cluster',
            'leaflet-arrowheads',
          ],
          'utils-vendor': ['axios', 'proj4', 'zustand', 'framer-motion', 'lodash'],
        },
      },
    },
  },
});