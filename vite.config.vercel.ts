import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // Vercel serves from root
  build: {
    chunkSizeWarningLimit: 1500, // Silence chunk size warnings for production
  },
});
