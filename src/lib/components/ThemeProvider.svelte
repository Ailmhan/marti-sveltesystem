<script lang="ts">
	import { onMount } from 'svelte';
	import { themeStore } from '$lib/stores/theme';
	import { browser } from '$app/environment';

	onMount(() => {
		if (browser) {
			// Инициализируем тему немедленно
			themeStore.init();
			
			// Принудительно устанавливаем тему по умолчанию
			if (!document.documentElement.classList.contains('light') && 
				!document.documentElement.classList.contains('dark')) {
				document.documentElement.classList.add('light');
			}
		}
	});
</script>

<!-- Всегда показываем содержимое - без блокировки -->
<slot />

<style>
	/* Минимальные стили для ThemeProvider */
</style>


