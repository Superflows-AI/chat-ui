import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import react from '@vitejs/plugin-react'
import path from "path";
import postcssImport from 'postcss-import'
import { dependencies } from './package.json'
 import css from 'rollup-plugin-css-only';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({
      include: ['src/'],
      // insertTypesEntry: true,
    }),
    css({ output: 'bundle.css' })
  ],
   css: {
     postcss: {
       plugins: [
         postcssImport,
       ]
     }
   },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: [
        ...Object.keys(dependencies),
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          // 'styled-components': 'styled',
        },
      },
    },
  },
})
