<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	// Автоматически перенаправляем на новый лендинг
	onMount(() => {
		console.log('🔄 Redirecting from /school to /school-landing');
		goto('/school-landing', { replaceState: true });
	});
</script>

<svelte:head>
	<title>Переадресация...</title>
</svelte:head>

<div class="redirect-page">
	<div class="redirect-content">
		<div class="spinner">🔄</div>
		<p>Переходим на лендинг школы...</p>
	</div>
</div>

<style>
	.redirect-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: hsl(var(--background));
	}

	.redirect-content {
		text-align: center;
		color: hsl(var(--muted-foreground));
	}

	.spinner {
		font-size: 2rem;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>