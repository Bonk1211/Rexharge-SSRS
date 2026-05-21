import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const simulatorUrls: Record<string, string> = {
  development: "https://solar.limziyang.ml",
  staging: "https://solar.limziyang.ml",
  production: "https://solar.limziyang.ml",
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const simulatorUrl = env.VITE_SIMULATOR_URL || simulatorUrls[mode] || simulatorUrls.development;

  return {
    plugins: [react()],
    define: {
      __SIMULATOR_URL__: JSON.stringify(simulatorUrl),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5174,
      host: true,
      proxy: {
        "/cs-assets": {
          target: "https://solar.limziyang.ml",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/cs-assets/, "/static"),
        },
      },
    },
  };
});
