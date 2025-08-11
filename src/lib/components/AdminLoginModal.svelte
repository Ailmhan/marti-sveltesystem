<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import LoadingSpinner from './LoadingSpinner.svelte';
	import { adminStore } from '$lib/stores/admin';
	import { toastStore } from '$lib/stores/toast';

	const dispatch = createEventDispatcher();

	export let open = false;

	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	async function handleSubmit(event: Event) {
		event.preventDefault();
		
		if (!email.trim() || !password.trim()) {
			error = 'Пожалуйста, заполните все поля';
			return;
		}

		loading = true;
		error = '';

		try {
			await adminStore.enterAdminMode(email, password);
			toastStore.success('Вы вошли в режим администратора');
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка входа в режим администратора';
			toastStore.error('Не удалось войти в режим администратора');
		} finally {
			loading = false;
		}
	}

	function close() {
		open = false;
		email = '';
		password = '';
		error = '';
		loading = false;
		dispatch('close');
	}

	function handleOutsideClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			close();
		}
	}
</script>

{#if open}
	<!-- Modal backdrop -->
	<div class="modal-backdrop" on:click={handleOutsideClick} role="presentation">
		<div class="modal-container" role="dialog" aria-labelledby="admin-modal-title" aria-modal="true">
			<div class="modal-header">
				<h2 id="admin-modal-title">🔐 Вход в режим администратора</h2>
				<button
					type="button"
					class="close-btn"
					on:click={close}
					disabled={loading}
					aria-label="Закрыть"
				>
					✕
				</button>
			</div>

			<form on:submit={handleSubmit} class="modal-form">
				<div class="modal-body">
					{#if error}
						<div class="alert alert-error">
							<span class="alert-icon">❌</span>
							<span>{error}</span>
						</div>
					{/if}

					<div class="admin-info">
						<div class="admin-info-icon">👨‍💼</div>
						<p class="admin-info-text">
							Для получения временных прав администратора введите ваши учетные данные.
							Сессия администратора автоматически истечет через <strong>10 минут</strong> для безопасности.
						</p>
					</div>

					<div class="form-group">
						<label for="admin-email" class="form-label">Email</label>
						<input
							id="admin-email"
							type="email"
							bind:value={email}
							placeholder="admin@school.edu"
							disabled={loading}
							required
							class="form-input"
							autocomplete="username"
						>
					</div>

					<div class="form-group">
						<label for="admin-password" class="form-label">Пароль</label>
						<input
							id="admin-password"
							type="password"
							bind:value={password}
							placeholder="Введите пароль"
							disabled={loading}
							required
							class="form-input"
							autocomplete="current-password"
						>
					</div>
				</div>

				<div class="modal-footer">
					<button
						type="button"
						class="btn btn-secondary"
						on:click={close}
						disabled={loading}
					>
						Отмена
					</button>
					<button
						type="submit"
						class="btn btn-admin"
						disabled={loading || !email.trim() || !password.trim()}
					>
						{#if loading}
							<LoadingSpinner size="small" />
							<span>Вход...</span>
						{:else}
							<span>🔓 Войти как администратор</span>
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
		background: rgba(0, 0, 0, 0.6);
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
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		width: 100%;
		max-width: 450px;
		max-height: 90vh;
		overflow-y: auto;
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
		padding: 1.5rem 1.5rem 0 1.5rem;
		border-bottom: 1px solid hsl(var(--border));
		margin-bottom: 0;
		padding-bottom: 1rem;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
		color: hsl(var(--foreground));
		display: flex;
		align-items: center;
		gap: 0.5rem;
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

	.admin-info {
		background: linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--accent) / 0.1) 100%);
		border: 1px solid hsl(var(--primary) / 0.2);
		border-radius: 0.5rem;
		padding: 1rem;
		margin-bottom: 1.5rem;
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
	}

	.admin-info-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
		margin-top: 0.1rem;
	}

	.admin-info-text {
		color: hsl(var(--foreground));
		font-size: 0.875rem;
		line-height: 1.5;
		margin: 0;
	}

	.form-group {
		margin-bottom: 1.25rem;
	}

	.form-label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		font-size: 0.875rem;
	}

	.form-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		font-size: 0.9rem;
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

	.alert {
		padding: 0.75rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.alert-error {
		background: hsl(var(--destructive) / 0.1);
		color: hsl(var(--destructive));
		border: 1px solid hsl(var(--destructive) / 0.2);
	}

	.alert-icon {
		flex-shrink: 0;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1rem 1.5rem 1.5rem 1.5rem;
		border-top: 1px solid hsl(var(--border));
		background: hsl(var(--muted) / 0.3);
	}

	.btn {
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		min-width: auto;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none !important;
	}

	.btn-admin {
		background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
		color: white;
		box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.3);
		border: 1px solid rgba(139, 92, 246, 0.4);
	}

	.btn-admin:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
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