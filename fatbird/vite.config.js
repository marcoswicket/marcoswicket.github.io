import { defineConfig } from "vite"
import { resolve } from 'path'

export default defineConfig({
    base: 'marcoswicket.github.io',
    assetsInclude: ['**/*.vert', '**/*.frag'],
    build: {
        outDir: 'dist',
        target: 'esnext',
        sourcemap: true,
    },
    resolve: {
        alias: {
            'pixi.js': resolve(__dirname, 'node_modules/pixi.js/dist/pixi.mjs'),
        }
    },
    optimizeDeps: {
        include: ['matter-js']
    }
});