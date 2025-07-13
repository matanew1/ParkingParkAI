import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://gisn.tel-aviv.gov.il',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  optimizeDeps: {
    include: ["to-fast-properties"],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});