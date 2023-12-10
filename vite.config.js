// @ts-nocheck
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { visualizer } from "rollup-plugin-visualizer"

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    modules: {
      // https://github.com/webpack/loader-utils#interpolatename
      generateScopedName: `[folder]__[local]`,
      // @ts-ignore
      root: `.`,
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, `src`),
    },
  },
  server: {
    open: true,
  },
  plugins: [
    react(),
    svgr(),
    visualizer({
      emitFile: true,
    }),
  ],
})
