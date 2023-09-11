import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default ({ mode }: { mode: string }) => {
  if (mode === "development") {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  }

  return defineConfig({
    plugins: [react(), dts(), nodePolyfills({})],
    optimizeDeps: {
      include: ["linked-dep"],
    },
    build: {
      sourcemap: true,
      lib: {
        // Could also be a dictionary or array of multiple entry points
        entry: resolve(__dirname, "src/index.tsx"),
        name: "@superflows/chat-ui-react",
        fileName: "@superflows/chat-ui-react",
      },
      rollupOptions: {
        // make sure to externalize deps that shouldn't be bundled
        // into your library
        external: ["react", "react-dom"],
        output: {
          // Provide global variables to use in the UMD build
          // for externalized deps
          globals: {
            react: "react",
          },
        },
      },
    },
  });
};
