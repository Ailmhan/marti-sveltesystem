<script lang="ts">
	import { goto } from '$app/navigation';
	import { apiClient } from '$lib/api/client';
	import { authStore } from '$lib/stores/auth';

	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	async function handleSubmit() {
		loading = true;
		error = '';

		try {
			const response = await apiClient.login(email, password);
			await authStore.login(response.token);
			goto('/');
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : 'Ошибка входа';
			if (errorMsg.includes('Неверный email или пароль') || errorMsg.includes('Unauthorized')) {
				error = 'Неверные учетные данные. Если у вас нет аккаунта, зарегистрируйте новую школу.';
			} else {
				error = errorMsg;
			}
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Вход - Школьная система</title>
</svelte:head>

<div class="auth-container">
	<div class="auth-card">
		<div class="auth-header">
			<div class="logo-container">
				<div class="logo-icon">🏫</div>
			</div>
			<h1 class="auth-title">Добро пожаловать</h1>
			<p class="auth-subtitle">Войдите в школьную систему управления</p>
		</div>

		<form on:submit|preventDefault={handleSubmit} class="auth-form">
			<div class="form-group">
				<label for="email" class="form-label">
					<span class="label-icon">📧</span>
					Email
				</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					class="form-input"
					placeholder="school@example.com"
					required
					disabled={loading}
				/>
			</div>

			<div class="form-group">
				<label for="password" class="form-label">
					<span class="label-icon">🔒</span>
					Пароль
				</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					class="form-input"
					placeholder="Введите пароль"
					required
					disabled={loading}
				/>
			</div>

			{#if error}
				<div class="error-message">
					<span class="error-icon">⚠️</span>
					{error}
					{#if error.includes('Если у вас нет аккаунта')}
						<a href="/register" class="register-link">Регистрация</a>
					{/if}
				</div>
			{/if}

			<button 
				type="submit" 
				class="submit-btn"
				disabled={loading}
			>
				{#if loading}
					<div class="loading-spinner"></div>
				{/if}
				<span class="btn-text">{loading ? 'Вход...' : 'Войти в систему'}</span>
			</button>
		</form>

		<div class="auth-footer">
			<div class="auth-links">
				<p class="register-text">
					Нет аккаунта? 
					<a href="/register" class="register-link">
						Зарегистрировать школу
					</a>
				</p>
				<p class="test-hint">
					💡 Для тестирования: school@example.com / password123
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	/* Auth Container */
	.auth-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: hsl(var(--background));
		padding: 1rem;
		position: relative;
	}



	/* Auth Card */
	.auth-card {
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 0.75rem;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
		padding: 3rem;
		width: 100%;
		max-width: 450px;
		position: relative;
		animation: slideInUp 0.6s ease-out;
	}

	@keyframes slideInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Auth Header */
	.auth-header {
		text-align: center;
		margin-bottom: 2.5rem;
	}

	.logo-container {
		margin-bottom: 1.5rem;
	}

	.logo-icon {
		font-size: 3rem;
		animation: bounce 2s infinite;
	}

	@keyframes bounce {
		0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
		40% { transform: translateY(-10px); }
		60% { transform: translateY(-5px); }
	}

	.auth-title {
		font-size: 2.25rem;
		font-weight: 700;
		color: hsl(var(--foreground));
		margin: 0 0 0.5rem 0;
	}

	.auth-subtitle {
		color: hsl(var(--muted-foreground));
		font-size: 1rem;
		margin: 0;
	}

	/* Auth Form */
	.auth-form {
		margin-bottom: 2rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		margin-bottom: 0.75rem;
		font-size: 0.875rem;
	}

	.label-icon {
		font-size: 1rem;
	}

	.form-input {
		width: 100%;
		padding: 1rem 1.25rem;
		border: 2px solid hsl(var(--border));
		border-radius: 0.5rem;
		font-size: 1rem;
		transition: all 0.2s ease;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
	}

	.form-input:focus {
		outline: none;
		border-color: hsl(var(--primary));
		box-shadow: 0 0 0 4px hsl(var(--primary) / 0.1);
		transform: translateY(-1px);
	}

	.form-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Error Message */
	.error-message {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		background: hsl(var(--destructive) / 0.1);
		border: 1px solid hsl(var(--destructive) / 0.3);
		border-radius: 0.5rem;
		color: hsl(var(--destructive));
		font-size: 0.875rem;
		margin-bottom: 1.5rem;
	}

	.error-icon {
		font-size: 1rem;
	}

	.register-link {
		color: hsl(var(--primary));
		text-decoration: underline;
		font-weight: 500;
		margin-left: 0.5rem;
		transition: opacity 0.2s ease;
	}

	.register-link:hover {
		opacity: 0.8;
	}

	.test-note {
		margin-top: 1rem;
		font-size: 0.875rem;
		color: var(--text-secondary);
		text-align: center;
	}

	.register-link-inline {
		color: hsl(var(--primary));
		text-decoration: underline;
		font-weight: 500;
	}

	.register-link-inline:hover {
		opacity: 0.8;
	}

	.test-hint {
		margin-top: 0.5rem;
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
		text-align: center;
	}

	/* Submit Button */
	.submit-btn {
		width: 100%;
		padding: 1rem 1.5rem;
		background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
		color: white;
		border: none;
		border-radius: var(--radius-lg);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		position: relative;
		overflow: hidden;
	}

	.submit-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s;
	}

	.submit-btn:hover::before {
		left: 100%;
	}

	.submit-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.submit-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}

	.loading-spinner {
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top: 2px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Auth Footer */
	.auth-footer {
		border-top: 1px solid var(--gray-200);
		padding-top: 2rem;
	}

	.auth-links {
		text-align: center;
	}

	.register-text {
		color: hsl(var(--muted-foreground));
		font-size: 0.875rem;
		margin: 0;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.auth-card {
			padding: 2rem;
			margin: 1rem;
		}

		.auth-title {
			font-size: 1.875rem;
		}

		.logo-icon {
			font-size: 2.5rem;
		}
	}

	@media (max-width: 480px) {
		.auth-card {
			padding: 1.5rem;
		}

		.auth-title {
			font-size: 1.5rem;
		}
	}
</style> 