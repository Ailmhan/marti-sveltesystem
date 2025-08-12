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
		class="modal-backdrop"
		on:click={handleBackdropClick}
		on:keydown={handleKeyDown}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="modal-container">
			<!-- Header -->
			<div class="modal-header">
				<h2 class="modal-title">{title}</h2>
				<button 
					type="button"
					on:click={handleClose}
					disabled={loading}
					class="close-btn"
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
					class="btn-cancel"
				>
					{cancelText}
				</button>
				<button 
					type="button"
					on:click={handleSubmit}
					disabled={loading}
					class="btn-submit"
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
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
		padding: 1rem;
	}

	.modal-container {
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 0.75rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		width: 100%;
		max-width: 32rem;
		max-height: 90vh;
		overflow: hidden;
		position: relative;
		animation: modal-appear 0.3s ease-out;
	}

	@keyframes modal-appear {
		from {
			opacity: 0;
			transform: scale(0.9) translateY(-20px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid hsl(var(--border));
		background: hsl(var(--background));
	}

	.modal-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		margin: 0;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.25rem;
		color: hsl(var(--muted-foreground));
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.375rem;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.close-btn:hover:not(:disabled) {
		color: hsl(var(--foreground));
		background: hsl(var(--muted));
	}

	.close-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.modal-body {
		padding: 1.5rem;
		max-height: 60vh;
		overflow-y: auto;
	}

	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: end;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: 1px solid hsl(var(--border));
		background: hsl(var(--muted) / 0.3);
	}

	.btn-cancel {
		padding: 0.5rem 1rem;
		border: 1px solid hsl(var(--border));
		border-radius: 0.375rem;
		color: hsl(var(--foreground));
		background: hsl(var(--background));
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.btn-cancel:hover:not(:disabled) {
		background: hsl(var(--muted));
	}

	.btn-cancel:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-submit {
		padding: 0.5rem 1rem;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.875rem;
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn-submit:hover:not(:disabled) {
		background: hsl(var(--primary) / 0.9);
	}

	.btn-submit:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.loading-spinner {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style> 