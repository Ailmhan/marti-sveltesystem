<script lang="ts">
	import { themeStore, currentTheme, isDark } from '$lib/stores/theme';
</script>

<svelte:head>
	<title>Тест темы</title>
</svelte:head>

<div class="theme-test-page">
	<h1>Тестирование системы тем</h1>
	
	<div class="theme-info">
		<h2>Текущее состояние:</h2>
		<p><strong>Тема:</strong> {$currentTheme}</p>
		<p><strong>Темная:</strong> {$isDark ? 'Да' : 'Нет'}</p>
		<p><strong>HTML класс:</strong> {typeof document !== 'undefined' ? document.documentElement.className : 'N/A'}</p>
	</div>

	<div class="theme-controls">
		<h2>Управление темой:</h2>
		<button on:click={() => themeStore.setTheme('light')} class="btn btn-light">
			☀️ Светлая тема
		</button>
		<button on:click={() => themeStore.setTheme('dark')} class="btn btn-dark">
			🌙 Темная тема
		</button>
		<button on:click={() => themeStore.setTheme('system')} class="btn btn-system">
			🖥️ Системная тема
		</button>
		<button on:click={() => themeStore.toggleTheme()} class="btn btn-toggle">
			🔄 Переключить
		</button>
		<button on:click={() => themeStore.cycleTheme()} class="btn btn-cycle">
			🔄 Циклично
		</button>
	</div>

	<div class="theme-preview">
		<h2>Предварительный просмотр:</h2>
		<div class="preview-card">
			<h3>Карточка</h3>
			<p>Это пример карточки для демонстрации стилей темы.</p>
			<button class="btn btn-primary">Кнопка</button>
		</div>
	</div>

	<div class="debug-info">
		<h2>Отладочная информация:</h2>
		<pre>{JSON.stringify({
			theme: $currentTheme,
			isDark: $isDark,
			htmlClass: typeof document !== 'undefined' ? document.documentElement.className : 'N/A',
			localStorage: typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : 'N/A',
			userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
		}, null, 2)}</pre>
	</div>
</div>

<style>
	.theme-test-page {
		padding: 2rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.theme-info, .theme-controls, .theme-preview, .debug-info {
		margin-bottom: 2rem;
		padding: 1.5rem;
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		background: var(--bg-secondary);
	}

	.theme-controls {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.btn-light {
		background: #fbbf24;
		color: #1f2937;
	}

	.btn-dark {
		background: #7c3aed;
		color: white;
	}

	.btn-system {
		background: #10b981;
		color: white;
	}

	.btn-toggle {
		background: #ef4444;
		color: white;
	}

	.btn-cycle {
		background: #8b5cf6;
		color: white;
	}

	.btn-primary {
		background: var(--accent-color);
		color: white;
	}

	.btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.preview-card {
		padding: 1.5rem;
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		background: var(--bg-primary);
	}

	.debug-info pre {
		background: var(--bg-primary);
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		font-size: 0.875rem;
		border: 1px solid var(--border-color);
	}

	h1, h2, h3 {
		color: var(--text-primary);
		margin-bottom: 1rem;
	}

	p {
		color: var(--text-secondary);
		margin-bottom: 0.5rem;
	}
</style>
