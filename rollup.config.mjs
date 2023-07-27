import tailwind from "rollup-plugin-tailwindcss";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";

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
    postcss({
      extensions: [".css"],
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
