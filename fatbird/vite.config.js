import { defineConfig } from "vite"

export default defineConfig({
	base: './',
	assetsInclude: ['**/*.vert', '**/*.frag'],
	build: {
		outDir: 'dist',
		target: 'esnext'
	}
});