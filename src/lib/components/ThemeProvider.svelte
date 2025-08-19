<script lang="ts">
	import { onMount } from 'svelte';
	import { themeStore } from '$lib/stores/theme';
	import { browser } from '$app/environment';

	// Предотвращаем мерцание темы
	let themeInitialized = false;

	onMount(() => {
		if (browser) {
			// Инициализируем тему
			themeStore.init();
			themeInitialized = true;
		}
	});
</script>

<!-- Показываем содержимое только после инициализации темы -->
{#if themeInitialized || !browser}
	<slot />
{:else}
	<!-- Показываем скелетон или спиннер во время инициализации темы -->
	<div class="theme-loading">
		<div class="loading-spinner"></div>
	</div>
{/if}

<style>
	.theme-loading {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: #f8fafc;
	}

	:global(.dark) .theme-loading {
		background: #0f172a;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #e2e8f0;
		border-top: 4px solid #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	:global(.dark) .loading-spinner {
		border: 4px solid #334155;
		border-top: 4px solid #8b5cf6;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style>
