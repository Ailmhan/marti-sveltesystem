<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let isOpen = false;
	export let title = '';
	
	const dispatch = createEventDispatcher();
	
	function closeModal() {
		dispatch('close');
	}
	
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeModal();
		}
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" on:click={handleBackdropClick}>
		<div class="modal">
			<div class="modal-header">
				<h2>{title}</h2>
				<button class="modal-close" on:click={closeModal}>&times;</button>
			</div>
			<div class="modal-body">
				<slot />
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal {
		background: var(--bg-primary);
		border-radius: 12px;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
		width: 100%;
		max-width: 600px;
		max-height: 90vh;
		overflow-y: auto;
		border: 1px solid var(--border-primary);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 1.5rem 0 1.5rem;
		border-bottom: 1px solid var(--border-primary);
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.modal-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: var(--text-secondary);
		padding: 0.25rem;
		border-radius: 4px;
		transition: color 0.2s;
	}

	.modal-close:hover {
		color: var(--text-primary);
		background: var(--bg-secondary);
	}

	.modal-body {
		padding: 1.5rem;
	}
</style> 