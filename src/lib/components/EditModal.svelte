<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import LoadingSpinner from './LoadingSpinner.svelte';

	const dispatch = createEventDispatcher();

	export let open = false;
	export let title = 'Редактировать запись';
	export let loading = false;
	export let submitText = 'Сохранить изменения';
	export let cancelText = 'Отмена';

	function handleSubmit(event: Event) {
		event.preventDefault();
		dispatch('submit');
	}

	function handleClose() {
		dispatch('close');
	}

	function handleOutsideClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}
</script>

{#if open}
	<!-- Modal backdrop -->
	<div class="modal-backdrop" on:click={handleOutsideClick} role="presentation">
		<div class="modal-container" role="dialog" aria-labelledby="modal-title" aria-modal="true">
			<div class="modal-header">
				<h2 id="modal-title">{title}</h2>
				<button
					type="button"
					class="close-btn"
					on:click={handleClose}
					disabled={loading}
					aria-label="Закрыть"
				>
					✕
				</button>
			</div>

			<form on:submit={handleSubmit} class="modal-form">
				<div class="modal-body">
					<slot />
				</div>

				<div class="modal-footer">
					<button
						type="button"
						class="btn btn-secondary"
						on:click={handleClose}
						disabled={loading}
					>
						{cancelText}
					</button>
					<button
						type="submit"
						class="btn btn-primary"
						disabled={loading}
					>
						{#if loading}
							<LoadingSpinner size="small" />
							<span>Сохранение...</span>
						{:else}
							{submitText}
						{/if}
					</button>
				</div>
			</form>
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
		z-index: 1000;
		padding: 1rem;
	}

	.modal-container {
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 0.75rem;
		box-shadow: var(--shadow-lg);
		width: 100%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
		animation: modal-appear 0.2s ease-out;
	}

	@keyframes modal-appear {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(-10px);
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
		padding: 1.5rem 1.5rem 0 1.5rem;
		border-bottom: 1px solid hsl(var(--border));
		margin-bottom: 0;
		padding-bottom: 1rem;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: hsl(var(--foreground));
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.25rem;
		color: hsl(var(--muted-foreground));
		cursor: pointer;
		padding: 0.25rem;
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

	.modal-form {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.modal-body {
		padding: 1.5rem;
		flex-grow: 1;
		overflow-y: auto;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1rem 1.5rem 1.5rem 1.5rem;
		border-top: 1px solid hsl(var(--border));
		background: hsl(var(--muted) / 0.5);
	}

	.btn {
		border: none;
		border-radius: 0.6rem;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.6rem 1.2rem;
		min-width: auto;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(262 83% 68%) 100%);
		color: hsl(var(--primary-foreground));
		box-shadow: var(--shadow-md);
		border: 1px solid hsl(var(--ring) / 0.3);
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
	}

	.btn-secondary {
		background: hsl(var(--secondary));
		color: hsl(var(--secondary-foreground));
		border: 1px solid hsl(var(--border));
		box-shadow: var(--shadow-sm);
	}

	.btn-secondary:hover:not(:disabled) {
		background: hsl(var(--secondary) / 0.8);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	@media (max-width: 640px) {
		.modal-backdrop {
			padding: 0.5rem;
		}
		
		.modal-container {
			max-height: 95vh;
		}
		
		.modal-header,
		.modal-body,
		.modal-footer {
			padding-left: 1rem;
			padding-right: 1rem;
		}
		
		.modal-footer {
			flex-direction: column-reverse;
		}
		
		.btn {
			width: 100%;
			justify-content: center;
		}
	}
</style>