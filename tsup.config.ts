import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'external/**/*.ts',
    'core/**/*.ts',
    'box/**/*.ts',
    'util/**/*.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: true,
  outDir: 'dist',
})