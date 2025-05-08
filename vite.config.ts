import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cesium from 'vite-plugin-cesium';

export default defineConfig({
  plugins: [react(), cesium()],
  optimizeDeps: {
    include: ["to-fast-properties"],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});