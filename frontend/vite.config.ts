import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelFile = path.resolve(__dirname, "../backend/generated_models/hunyuan_textured_768.glb");
const modelRoute = "/models/hunyuan_textured_768.glb";

function generatedModelPlugin(): Plugin {
  return {
    name: "generated-model",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(modelRoute, (_request: IncomingMessage, response: ServerResponse) => {
        response.setHeader("Content-Type", "model/gltf-binary");
        response.end(readFileSync(modelFile));
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "models/hunyuan_textured_768.glb",
        source: readFileSync(modelFile),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), generatedModelPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5174,
    host: true,
  },
});
