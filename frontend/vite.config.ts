import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const simulatorUrls: Record<string, string> = {
  development: "https://solar.limziyang.ml/simulator?model=https://xxx.com/static/models/video_7/3DModel.glb&lat=5.237826&lng=100.452277&usage=700&tariff=domestic&gmap=https://xxx.com/static/measurement/eco_horizon.png",
  staging: "https://solar.limziyang.ml/simulator?model=https://xxx.com/static/models/video_7/3DModel.glb&lat=5.237826&lng=100.452277&usage=700&tariff=domestic&gmap=https://xxx.com/static/measurement/eco_horizon.png",
  production: "https://solar.limziyang.ml/simulator?model=https://xxx.com/static/models/video_7/3DModel.glb&lat=5.237826&lng=100.452277&usage=700&tariff=domestic&gmap=https://xxx.com/static/measurement/eco_horizon.png",
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
    },
  };
});
