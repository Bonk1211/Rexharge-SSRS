import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const modelFile = resolve(__dirname, "../generated_models/hunyuan_textured_768.glb");
const modelRoute = "/models/hunyuan_textured_768.glb";

function generatedModelPlugin() {
  return {
    name: "generated-model",
    configureServer(server) {
      server.middlewares.use(modelRoute, (_request, response) => {
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
});
