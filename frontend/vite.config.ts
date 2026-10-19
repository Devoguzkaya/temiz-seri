import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    // Geliştirmede /api isteklerini Spring Boot'a yönlendir
    proxy: { "/api": "http://localhost:8080" },
  },
});
