<script lang="ts">
	import { toastStore, type ToastMessage } from '$lib/stores/toast';
	import Toast from './Toast.svelte';

	$: toasts = $toastStore;
</script>

<div class="toast-container">
	{#each toasts as toast (toast.id)}
		<Toast
			message={toast.message}
			type={toast.type}
			duration={toast.duration}
			show={true}
			on:close={() => toastStore.remove(toast.id)}
		/>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		pointer-events: none;
	}

	.toast-container :global(.toast) {
		pointer-events: all;
	}

	@media (max-width: 768px) {
		.toast-container {
			top: 5rem;
			right: 1rem;
			left: 1rem;
		}
	}
</style>