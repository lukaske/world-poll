import path from "path"

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": process.env,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Only run certain operations when not in CI
    sourcemap: process.env.CI !== 'true',
    // Other build options
  }

});
