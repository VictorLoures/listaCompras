import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Caminhos relativos: funciona tanto na raiz (Vercel) quanto em subpasta.
  base: "./",
  // Mantém a pasta "build" do CRA para não quebrar o deploy existente.
  build: { outDir: "build" },
  server: { port: 5173 },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
});
