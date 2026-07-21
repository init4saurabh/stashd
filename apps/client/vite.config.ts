import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ command }) => {
  const isDev = command === "serve";

  let serverConfig = {};

  if (isDev) {
    const rawClientPort = process.env.CLIENT_PORT;
    if (!rawClientPort) {
      throw new Error("CLIENT_PORT environment variable is required but was not provided.");
    }
    const clientPort = Number(rawClientPort);
    if (Number.isNaN(clientPort) || clientPort <= 0) {
      throw new Error(`Invalid CLIENT_PORT value: "${rawClientPort}"`);
    }

    const backendPort = process.env.PORT;
    if (!backendPort) {
      throw new Error("PORT (backend) environment variable is required but was not provided.");
    }

    serverConfig = {
      port: clientPort,
      strictPort: true,
      proxy: {
        "/api": {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
        },
      },
    };
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
    },
    server: serverConfig,
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});