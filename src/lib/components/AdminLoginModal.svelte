<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { adminStore } from '$lib/stores/admin';
	import { apiClient } from '$lib/api/client';

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
			
			// Используем тот же API endpoint для авторизации
			const loginResponse = await apiClient.login(email, password);
			
			// Если авторизация успешна, входим в режим администратора
			if (loginResponse.token) {
				adminStore.enterAdminMode({
					email,
					role: 'admin',
					loginTime: new Date().toISOString(),
					token: loginResponse.token
				});
				closeModal();
			} else {
				error = 'Неверные учетные данные';
			}
		} catch (err) {
			console.error('Login error:', err);
			error = err instanceof Error ? err.message : 'Ошибка входа. Проверьте логин и пароль.';
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
				<h2 class="modal-title">Вход в режим администратора</h2>
				<button class="close-button" on:click={closeModal}>✕</button>
			</div>

			<form on:submit|preventDefault={handleSubmit} class="modal-body">
				<div class="form-group">
					<label for="email">Email</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="Введите email школы"
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
	/* CSS переменные для темной темы */
	:global(.dark) {
		--modal-overlay-bg: rgba(0, 0, 0, 0.8);
		--modal-content-bg: #1e293b;
		--modal-border: #334155;
		--modal-text: #f8fafc;
		--modal-text-secondary: #cbd5e1;
		--modal-input-bg: #334155;
		--modal-input-border: #475569;
		--modal-input-text: #f1f5f9;
		--modal-error-bg: rgba(239, 68, 68, 0.15);
		--modal-error-border: rgba(239, 68, 68, 0.3);
		--modal-error-text: #fca5a5;
		--modal-primary: #a855f7;
		--modal-primary-hover: #7c3aed;
		--modal-secondary: #475569;
		--modal-secondary-hover: #334155;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(8px);
		padding: 1rem;
	}

	:global(.dark) .modal-overlay {
		background: var(--modal-overlay-bg);
	}

	.modal-content {
		background: #ffffff;
		border-radius: 0.75rem;
		padding: 0;
		max-width: 400px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		border: 1px solid #e5e7eb;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
	}

	:global(.dark) .modal-content {
		background: var(--modal-content-bg);
		border-color: var(--modal-border);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem 1.5rem 0;
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 1rem;
	}

	:global(.dark) .modal-header {
		border-color: var(--modal-border);
	}

	.modal-title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
	}

	:global(.dark) .modal-title {
		color: var(--modal-text);
	}

	.close-button {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 0.375rem;
		color: #6b7280;
		transition: all 0.2s ease;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.dark) .close-button {
		color: var(--modal-text-secondary);
	}

	.close-button:hover:not(:disabled) {
		background: #f3f4f6;
		color: #374151;
	}

	:global(.dark) .close-button:hover:not(:disabled) {
		background: var(--modal-secondary);
		color: var(--modal-text);
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
		color: #374151;
		font-size: 0.875rem;
	}

	:global(.dark) .form-group label {
		color: var(--modal-text-secondary);
	}

	.form-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		background: #ffffff;
		color: #111827;
		font-size: 0.875rem;
		transition: all 0.2s ease;
		box-sizing: border-box;
	}

	:global(.dark) .form-input {
		background: var(--modal-input-bg);
		border-color: var(--modal-input-border);
		color: var(--modal-input-text);
	}

	.form-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	:global(.dark) .form-input:focus {
		border-color: var(--modal-primary);
		box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
	}

	.form-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		background: #f9fafb;
	}

	:global(.dark) .form-input:disabled {
		background: var(--modal-secondary);
	}

	.form-input::placeholder {
		color: #9ca3af;
	}

	:global(.dark) .form-input::placeholder {
		color: #64748b;
	}

	.error-message {
		padding: 0.75rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: 0.5rem;
		color: #dc2626;
		font-size: 0.875rem;
		margin-bottom: 1.5rem;
	}

	:global(.dark) .error-message {
		background: var(--modal-error-bg);
		border-color: var(--modal-error-border);
		color: var(--modal-error-text);
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
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
		background: #f3f4f6;
		color: #374151;
		border: 1px solid #d1d5db;
	}

	:global(.dark) .btn-cancel {
		background: var(--modal-secondary);
		color: var(--modal-text);
		border-color: var(--modal-border);
	}

	.btn-cancel:hover:not(:disabled) {
		background: #e5e7eb;
	}

	:global(.dark) .btn-cancel:hover:not(:disabled) {
		background: var(--modal-secondary-hover);
	}

	.btn-submit {
		background: #3b82f6;
		color: #ffffff;
	}

	:global(.dark) .btn-submit {
		background: var(--modal-primary);
	}

	.btn-submit:hover:not(:disabled) {
		background: #2563eb;
		transform: translateY(-1px);
	}

	:global(.dark) .btn-submit:hover:not(:disabled) {
		background: var(--modal-primary-hover);
	}

	.loading-spinner {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
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
