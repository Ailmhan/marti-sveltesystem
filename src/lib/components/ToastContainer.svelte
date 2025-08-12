<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import Toast from './Toast.svelte';

	export let toasts: Array<{
		id: string;
		type: 'success' | 'error' | 'info';
		message: string;
		duration?: number;
	}> = [];

	const dispatch = createEventDispatcher();

	function removeToast(id: string) {
		toasts = toasts.filter(toast => toast.id !== id);
		dispatch('remove', { id });
	}

	function addToast(toast: {
		type: 'success' | 'error' | 'info';
		message: string;
		duration?: number;
	}) {
		const id = Math.random().toString(36).substr(2, 9);
		const newToast = { ...toast, id };
		
		toasts = [...toasts, newToast];
		
		if (toast.duration !== 0) {
			setTimeout(() => {
				removeToast(id);
			}, toast.duration || 5000);
		}
	}

	// Экспортируем функцию для добавления тостов
	export { addToast };
</script>

<div class="toast-container">
	{#each toasts as toast (toast.id)}
		<Toast
			type={toast.type}
			message={toast.message}
			on:close={() => removeToast(toast.id)}
		/>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		pointer-events: none;
	}

	.toast-container > :global(*) {
		pointer-events: auto;
	}
</style>
