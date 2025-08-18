<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';

	export let timeout = 30000; // 30 секунд по умолчанию
	export let redirectTo = '/school'; // Куда перенаправлять

	let idleTimeout: NodeJS.Timeout;

	// Сбрасываем таймер
	function resetIdleTimer() {
		clearTimeout(idleTimeout);
		idleTimeout = setTimeout(() => {
			// Перенаправляем на лендинг
			goto(redirectTo);
		}, timeout);
	}

	onMount(() => {
		// Проверяем, что мы в браузере
		if (typeof window === 'undefined') return;

		// Слушаем действия пользователя
		window.addEventListener('mousemove', resetIdleTimer);
		window.addEventListener('keydown', resetIdleTimer);
		window.addEventListener('click', resetIdleTimer);
		window.addEventListener('scroll', resetIdleTimer);
		window.addEventListener('touchstart', resetIdleTimer);

		// Запускаем изначально
		resetIdleTimer();
	});

	onDestroy(() => {
		// Проверяем, что мы в браузере
		if (typeof window === 'undefined') return;

		// Чистим слушатели и таймер
		window.removeEventListener('mousemove', resetIdleTimer);
		window.removeEventListener('keydown', resetIdleTimer);
		window.removeEventListener('click', resetIdleTimer);
		window.removeEventListener('scroll', resetIdleTimer);
		window.removeEventListener('touchstart', resetIdleTimer);
		clearTimeout(idleTimeout);
	});
</script>

<!-- Компонент не рендерит ничего видимого -->
<slot />
