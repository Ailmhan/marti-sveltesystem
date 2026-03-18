import adapterStatic from '@sveltejs/adapter-static';
import adapterVercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isTauriBuild =
	process.env.BUILD_TARGET === 'tauri' || !!process.env.TAURI_ENV_PLATFORM;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: isTauriBuild
			? adapterStatic({
				fallback: 'index.html',
				strict: false
			})
			: adapterVercel({
				runtime: 'nodejs20.x'
			})
	},
	preprocess: vitePreprocess()
};

export default config;
