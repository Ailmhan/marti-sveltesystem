<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let open = false;
	export let title = '';
	export let loading = false;
	export let submitText = 'Сохранить';
	export let cancelText = 'Отмена';
	export let disableSubmit = false; // Новый пропс для блокировки кнопки

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
					disabled={loading || disableSubmit}
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
		background: hsl(var(--background) / 0.8);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
	}

	.modal-content {
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		box-shadow: 0 20px 25px -5px hsl(var(--foreground) / 0.1), 0 10px 10px -5px hsl(var(--foreground) / 0.04);
		width: 90%;
		max-width: 600px;
		max-height: 90vh;
		overflow-y: auto;
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

	/* Стили для кнопок */
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: var(--radius);
		font-weight: 500;
		transition: all 0.2s ease;
		border: none;
		cursor: pointer;
	}

	.btn-primary {
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
	}

	.btn-primary:hover:not(:disabled) {
		background: hsl(var(--primary) / 0.9);
	}

	.btn-secondary {
		background: hsl(var(--secondary));
		color: hsl(var(--secondary-foreground));
	}

	.btn-secondary:hover:not(:disabled) {
		background: hsl(var(--secondary) / 0.9);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: hsl(var(--muted));
		color: hsl(var(--muted-foreground));
	}

	.btn:disabled:hover {
		background: hsl(var(--muted));
		color: hsl(var(--muted-foreground));
		transform: none;
	}

	.loading-spinner {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	/* Улучшенные стили для темной темы */
	:global(.dark) .modal-body input,
	:global(.dark) .modal-body textarea,
	:global(.dark) .modal-body select {
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		border-color: hsl(var(--border));
	}

	:global(.dark) .modal-body input::placeholder,
	:global(.dark) .modal-body textarea::placeholder {
		color: hsl(var(--muted-foreground));
	}

	/* Стили для полей ввода в модальных окнах */
	:global(.modal-body input),
	:global(.modal-body textarea),
	:global(.modal-body select) {
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		transition: all 0.2s ease;
	}

	:global(.modal-body input:focus),
	:global(.modal-body textarea:focus),
	:global(.modal-body select:focus) {
		border-color: hsl(var(--ring));
		box-shadow: 0 0 0 3px hsl(var(--ring) / 0.1);
		outline: none;
	}

	:global(.modal-body label) {
		color: hsl(var(--foreground));
		font-weight: 500;
		margin-bottom: 0.5rem;
		display: block;
	}

	/* Стили для заголовка и футера модального окна */
	:global(.dark) .modal-header {
		background: hsl(var(--card));
		border-bottom-color: hsl(var(--border));
	}

	:global(.dark) .modal-footer {
		background: hsl(var(--muted) / 0.2);
		border-top-color: hsl(var(--border));
	}

	:global(.dark) .modal-content {
		background: hsl(var(--card));
		border-color: hsl(var(--border));
	}
</style> 