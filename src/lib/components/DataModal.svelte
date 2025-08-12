<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let open = false;
	export let title = '';
	export let loading = false;
	export let submitText = 'Сохранить';
	export let cancelText = 'Отмена';

	const dispatch = createEventDispatcher();

	function handleClose() {
		if (!loading) {
			dispatch('close');
		}
	}

	function handleSubmit() {
		console.log('DataModal handleSubmit called, loading:', loading);
		if (!loading) {
			console.log('Dispatching submit event');
			dispatch('submit');
		} else {
			console.log('Submit blocked due to loading state');
		}
	}

	function handleBackdropClick(mouseEvent: MouseEvent) {
		if (mouseEvent.target === mouseEvent.currentTarget) {
			handleClose();
		}
	}

	function handleKeyDown(keyboardEvent: KeyboardEvent) {
		if (keyboardEvent.key === 'Escape') {
			handleClose();
		}
	}
</script>

{#if open}
	<div 
		class="modal-overlay"
		on:click={handleBackdropClick}
		on:keydown={handleKeyDown}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="modal-content">
			<!-- Header -->
			<div class="modal-header">
				<h2 class="modal-title">{title}</h2>
				<button 
					type="button"
					on:click={handleClose}
					disabled={loading}
					class="close-button"
				>
					<span>✕</span>
				</button>
			</div>

			<!-- Content -->
			<div class="modal-body">
				<slot />
			</div>

			<!-- Footer -->
			<div class="modal-footer">
				<button 
					type="button"
					on:click={handleClose}
					disabled={loading}
					class="btn btn-cancel"
				>
					{cancelText}
				</button>
				<button 
					type="button"
					on:click={handleSubmit}
					disabled={loading}
					class="btn btn-submit"
				>
					{#if loading}
						<span class="loading-spinner">⏳</span>
					{/if}
					{submitText}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
		background: hsl(var(--background) / 0.8);
		backdrop-filter: blur(8px);
		padding: 1rem;
	}

	.modal-content {
		position: relative;
		width: 100%;
		max-width: 32rem;
		background: hsl(var(--card));
		border-radius: var(--radius);
		box-shadow: var(--shadow-xl);
		border: 1px solid hsl(var(--border));
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid hsl(var(--border));
		background: hsl(var(--card));
	}

	.modal-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		margin: 0;
	}

	.close-button {
		padding: 0.5rem;
		border-radius: calc(var(--radius) - 0.25rem);
		border: none;
		background: transparent;
		color: hsl(var(--muted-foreground));
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
	}

	.close-button:hover:not(:disabled) {
		background: hsl(var(--muted));
		color: hsl(var(--foreground));
	}

	.close-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.modal-body {
		padding: 1.5rem;
	}

	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: 1px solid hsl(var(--border));
		background: hsl(var(--muted) / 0.3);
	}

	.btn {
		padding: 0.5rem 1rem;
		border-radius: calc(var(--radius) - 0.25rem);
		border: none;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		min-width: 5rem;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-cancel {
		background: hsl(var(--secondary));
		color: hsl(var(--secondary-foreground));
		border: 1px solid hsl(var(--border));
	}

	.btn-cancel:hover:not(:disabled) {
		background: hsl(var(--secondary) / 0.8);
	}

	.btn-submit {
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
	}

	.btn-submit:hover:not(:disabled) {
		background: hsl(var(--primary) / 0.9);
		transform: translateY(-1px);
	}

	.loading-spinner {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	/* Темная тема */
	:global(.dark) .modal-overlay {
		background: hsl(var(--background) / 0.9);
	}

	:global(.dark) .modal-content {
		background: hsl(var(--card));
		border-color: hsl(var(--border));
	}

	:global(.dark) .modal-header {
		background: hsl(var(--card));
		border-color: hsl(var(--border));
	}

	:global(.dark) .modal-title {
		color: hsl(var(--foreground));
	}

	:global(.dark) .close-button {
		color: hsl(var(--muted-foreground));
	}

	:global(.dark) .close-button:hover:not(:disabled) {
		background: hsl(var(--muted));
		color: hsl(var(--foreground));
	}

	:global(.dark) .modal-footer {
		background: hsl(var(--muted) / 0.2);
		border-color: hsl(var(--border));
	}

	@media (max-width: 640px) {
		.modal-overlay {
			padding: 0.5rem;
		}

		.modal-content {
			max-width: 100%;
		}

		.modal-footer {
			flex-direction: column;
		}

		.btn {
			width: 100%;
		}
	}
</style> 