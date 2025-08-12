<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { adminStore } from '$lib/stores/admin';

	export let open = false;

	const dispatch = createEventDispatcher();

	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	async function handleSubmit() {
		if (!email || !password) {
			error = 'Пожалуйста, заполните все поля';
			return;
		}

		try {
			loading = true;
			error = '';
			
			// Здесь должна быть логика входа администратора
			console.log('🔐 Admin login attempt:', { email, password });
			
			// В реальном приложении здесь был бы API вызов
			// await authStore.adminLogin(email, password);
			
			// Пока что просто входим в админ-режим для демонстрации
			adminStore.enterAdminMode({ email });
			
			closeModal();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка входа';
		} finally {
			loading = false;
		}
	}

	function closeModal() {
		open = false;
		email = '';
		password = '';
		error = '';
		dispatch('close');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeModal();
		}
	}
</script>

{#if open}
	<div class="modal-overlay" on:click={closeModal}>
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h2 class="modal-title">Вход для администратора</h2>
				<button class="close-button" on:click={closeModal}>✕</button>
			</div>

			<form on:submit|preventDefault={handleSubmit} class="modal-body">
				<div class="form-group">
					<label for="email">Email</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="admin@school.com"
						required
						disabled={loading}
						class="form-input"
					/>
				</div>

				<div class="form-group">
					<label for="password">Пароль</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						placeholder="Введите пароль"
						required
						disabled={loading}
						class="form-input"
					/>
				</div>

				{#if error}
					<div class="error-message">{error}</div>
				{/if}

				<div class="form-actions">
					<button 
						type="button" 
						class="btn btn-cancel" 
						on:click={closeModal} 
						disabled={loading}
					>
						Отмена
					</button>
					<button 
						type="submit" 
						class="btn btn-submit" 
						disabled={loading}
					>
						{#if loading}
							<span class="loading-spinner">⏳</span>
						{/if}
						{loading ? 'Вход...' : 'Войти'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<svelte:window on:keydown={handleKeydown} />

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: hsl(var(--background) / 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(8px);
		padding: 1rem;
	}

	.modal-content {
		background: hsl(var(--card));
		border-radius: var(--radius);
		padding: 0;
		max-width: 400px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		border: 1px solid hsl(var(--border));
		box-shadow: var(--shadow-xl);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem 1.5rem 0;
		border-bottom: 1px solid hsl(var(--border));
		padding-bottom: 1rem;
	}

	.modal-title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: hsl(var(--foreground));
	}

	.close-button {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: calc(var(--radius) - 0.25rem);
		color: hsl(var(--muted-foreground));
		transition: all 0.2s ease;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
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

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: hsl(var(--foreground));
		font-size: 0.875rem;
	}

	.form-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid hsl(var(--border));
		border-radius: calc(var(--radius) - 0.25rem);
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		font-size: 0.875rem;
		transition: all 0.2s ease;
		box-sizing: border-box;
	}

	.form-input:focus {
		outline: none;
		border-color: hsl(var(--primary));
		box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
	}

	.form-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		background: hsl(var(--muted));
	}

	.error-message {
		padding: 0.75rem;
		background: hsl(var(--destructive) / 0.1);
		border: 1px solid hsl(var(--destructive) / 0.2);
		border-radius: calc(var(--radius) - 0.25rem);
		color: hsl(var(--destructive));
		font-size: 0.875rem;
		margin-bottom: 1.5rem;
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border-radius: calc(var(--radius) - 0.25rem);
		border: none;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s ease;
		font-size: 0.875rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
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

	:global(.dark) .form-input {
		background: hsl(var(--background));
		border-color: hsl(var(--border));
		color: hsl(var(--foreground));
	}

	:global(.dark) .form-input:focus {
		border-color: hsl(var(--primary));
	}

	:global(.dark) .form-input:disabled {
		background: hsl(var(--muted));
	}

	@media (max-width: 640px) {
		.modal-overlay {
			padding: 0.5rem;
		}

		.modal-content {
			width: 95%;
		}

		.form-actions {
			flex-direction: column;
		}

		.btn {
			width: 100%;
			justify-content: center;
		}
	}
</style>
