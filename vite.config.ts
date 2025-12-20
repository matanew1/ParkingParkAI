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
    minify: 'esbuild'
  },
});