import { defineConfig } from 'vite'

export default defineConfig({
	base: '/fatbird/',
	build: {
		outDir: 'dist',
		rollupOptions: {
			external: [],
		},
		commonjsOptions: {
			transformMixedEsModules: true,
		}
	},
	resolve: {
		dedupe: ['pixi.js', 'matter-js'],
		alias: {
			'pixi.js': 'pixi.js',
			'matter-js': 'matter-js'
		}
	}
})