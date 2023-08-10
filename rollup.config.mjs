import tailwind from "@superflows/rollup-plugin-tailwindcss";
import typescript from "rollup-plugin-typescript2";
import postcss from "rollup-plugin-postcss";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

import pkg from "./package.json" assert { type: "json" };

export default {
  input: "src/index.tsx",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      exports: "named",
      sourcemap: true,
      strict: false,
    },
  ],
  plugins: [
    resolve(),
    commonjs({
      include: "node_modules/**",
    }),
    postcss({
      config: {
        path: "./postcss.config.js",
      },
      extensions: [".css"],
      minimize: true,
      inject: {
        insertAt: "top",
      },
    }),
    tailwind({
      input: "src/index.css",
      // Tailor the emitted stylesheet to the bundle by removing any unused CSS
      // (highly recommended when packaging for distribution).
      purge: true,
    }),
    typescript({}),
  ],
  external: ["react", "react-dom", "@headlessui/react", "@heroicons/react"],
};
