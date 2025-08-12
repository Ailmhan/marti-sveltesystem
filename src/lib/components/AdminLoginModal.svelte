<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import Button from './ui/button/button.svelte';

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
			// Пока что просто закрываем модальное окно
			console.log('🔐 Admin login attempt:', { email, password });
			
			// В реальном приложении здесь был бы API вызов
			// await authStore.adminLogin(email, password);
			
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
				<h2>Вход для администратора</h2>
				<button class="close-btn" on:click={closeModal}>✕</button>
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
					/>
				</div>

				{#if error}
					<div class="error-message">{error}</div>
				{/if}

				<div class="form-actions">
					<Button type="button" variant="outline" on:click={closeModal} disabled={loading}>
						Отмена
					</Button>
					<Button type="submit" disabled={loading}>
						{loading ? 'Вход...' : 'Войти'}
					</Button>
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
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(4px);
	}

	.modal-content {
		background: hsl(var(--background));
		border-radius: 0.75rem;
		padding: 0;
		max-width: 400px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		border: 1px solid hsl(var(--border));
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem 1.5rem 0;
		border-bottom: 1px solid hsl(var(--border));
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
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 0.25rem;
		color: hsl(var(--muted-foreground));
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: hsl(var(--muted));
		color: hsl(var(--foreground));
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
	}

	.form-group input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		font-size: 0.875rem;
		transition: border-color 0.2s ease;
	}

	.form-group input:focus {
		outline: none;
		border-color: hsl(var(--primary));
		box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
	}

	.form-group input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.error-message {
		padding: 0.75rem;
		background: hsl(var(--destructive) / 0.1);
		border: 1px solid hsl(var(--destructive) / 0.2);
		border-radius: 0.5rem;
		color: hsl(var(--destructive));
		font-size: 0.875rem;
		margin-bottom: 1.5rem;
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
	}

	@media (max-width: 640px) {
		.modal-content {
			width: 95%;
			margin: 1rem;
		}

		.form-actions {
			flex-direction: column;
		}
	}
</style>
