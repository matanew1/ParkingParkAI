import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["to-fast-properties"],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
