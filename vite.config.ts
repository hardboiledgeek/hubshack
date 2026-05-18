/// <reference types="vitest/config" />

import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  test: {
    globals: true,
    include: ['spec/**/*.spec.ts', 'spec/**/*.spec.svelte.ts']
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@src': path.resolve('./src'),
      '@app': path.resolve('./src/app'),
      '@components': path.resolve('./src/components'),
      '@domain': path.resolve('./src/domain'),
      '@views': path.resolve('./src/views'),
      '@panels': path.resolve('./src/panels'),
      '@spec': path.resolve('./spec')
    }
  }
})
