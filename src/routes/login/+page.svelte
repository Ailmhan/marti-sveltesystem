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
	<div class="auth-background">
		<div class="floating-shapes">
			<div class="shape shape-1">📚</div>
			<div class="shape shape-2">🎓</div>
			<div class="shape shape-3">📝</div>
			<div class="shape shape-4">🏫</div>
			<div class="shape shape-5">👨‍🏫</div>
		</div>
	</div>
	
	<div class="auth-card">
		<div class="auth-header">
			<div class="logo-container">
				<div class="logo-icon">🏫</div>
			</div>
			<h1 class="auth-title">Добро пожаловать</h1>
			<p class="auth-subtitle">Войдите в школьную систему управления</p>
			
			<!-- Test Credentials Info -->
			<div class="test-credentials">
				<h3>Тестовые учетные данные:</h3>
				<div class="credential-box">
					<div class="credential-row">
						<span class="credential-label">Email:</span>
						<span class="credential-value">school@example.com</span>
					</div>
					<div class="credential-row">
						<span class="credential-label">Пароль:</span>
						<span class="credential-value">password123</span>
					</div>
				</div>
				<p class="test-note">
					⚠️ Если тестовые данные не работают, <a href="/register" class="register-link-inline">зарегистрируйте новую школу</a>
				</p>
			</div>
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
			<div class="demo-credentials">
				<h4 class="demo-title">
					<span class="demo-icon">🧪</span>
					Тестовые данные
				</h4>
				<div class="credentials-grid">
					<div class="credential-item">
						<span class="credential-label">Email:</span>
						<span class="credential-value">school@example.com</span>
					</div>
					<div class="credential-item">
						<span class="credential-label">Пароль:</span>
						<span class="credential-value">password123</span>
					</div>
				</div>
			</div>
			
			<div class="auth-links">
				<p class="register-text">
					Нет аккаунта? 
					<a href="/register" class="register-link">
						Зарегистрировать школу
					</a>
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
		background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
		padding: 1rem;
		position: relative;
		overflow: hidden;
	}

	/* Background Animation */
	.auth-background {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
	}

	.floating-shapes {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.shape {
		position: absolute;
		font-size: 2rem;
		opacity: 0.1;
		animation: float 6s ease-in-out infinite;
	}

	.shape-1 {
		top: 10%;
		left: 10%;
		animation-delay: 0s;
	}

	.shape-2 {
		top: 20%;
		right: 15%;
		animation-delay: 1s;
	}

	.shape-3 {
		bottom: 30%;
		left: 20%;
		animation-delay: 2s;
	}

	.shape-4 {
		bottom: 20%;
		right: 10%;
		animation-delay: 3s;
	}

	.shape-5 {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		animation-delay: 4s;
	}

	@keyframes float {
		0%, 100% { transform: translateY(0px) rotate(0deg); }
		50% { transform: translateY(-20px) rotate(5deg); }
	}

	/* Auth Card */
	.auth-card {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border-radius: var(--radius-2xl);
		box-shadow: var(--shadow-xl);
		padding: 3rem;
		width: 100%;
		max-width: 450px;
		position: relative;
		z-index: 10;
		border: 1px solid rgba(255, 255, 255, 0.2);
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
		color: var(--gray-900);
		margin: 0 0 0.5rem 0;
		background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.auth-subtitle {
		color: var(--gray-600);
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
		color: var(--gray-700);
		margin-bottom: 0.75rem;
		font-size: 0.875rem;
	}

	.label-icon {
		font-size: 1rem;
	}

	.form-input {
		width: 100%;
		padding: 1rem 1.25rem;
		border: 2px solid var(--gray-200);
		border-radius: var(--radius-lg);
		font-size: 1rem;
		transition: all var(--transition-fast);
		background: var(--bg-primary);
		color: var(--text-primary);
	}

	.form-input:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
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
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: var(--radius-lg);
		color: var(--error);
		font-size: 0.875rem;
		margin-bottom: 1.5rem;
	}

	.error-icon {
		font-size: 1rem;
	}

	.register-link {
		color: var(--primary);
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
		color: var(--primary);
		text-decoration: underline;
		font-weight: 500;
	}

	.register-link-inline:hover {
		opacity: 0.8;
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

	.demo-credentials {
		background: var(--gray-50);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		border: 1px solid var(--gray-200);
	}

	.demo-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		color: var(--gray-900);
		margin: 0 0 1rem 0;
	}

	.demo-icon {
		font-size: 1.125rem;
	}

	.credentials-grid {
		display: grid;
		gap: 0.75rem;
	}

	.credential-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--gray-200);
	}

	.credential-item:last-child {
		border-bottom: none;
	}

	.credential-label {
		font-weight: 500;
		color: var(--gray-600);
		font-size: 0.875rem;
	}

	.credential-value {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--text-primary);
		background: var(--bg-secondary);
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-primary);
	}

	.auth-links {
		text-align: center;
	}

	.register-text {
		color: var(--gray-600);
		font-size: 0.875rem;
		margin: 0;
	}

	.register-link {
		color: var(--primary);
		text-decoration: none;
		font-weight: 600;
		transition: color var(--transition-fast);
	}

	.register-link:hover {
		color: var(--primary-dark);
		text-decoration: underline;
	}

	/* Test Credentials Styles */
	.test-credentials {
		margin-top: 2rem;
		padding: 1.5rem;
		background: var(--primary-lighter);
		border-radius: var(--radius-lg);
		border: 1px solid var(--primary-light);
	}

	.test-credentials h3 {
		font-size: 1rem;
		font-weight: 600;
		color: var(--primary-dark);
		margin-bottom: 1rem;
		text-align: center;
	}

	.credential-box {
		background: var(--bg-primary);
		padding: 1rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--border-primary);
	}

	.credential-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border-primary);
	}

	.credential-row:last-child {
		border-bottom: none;
	}

	.credential-label {
		font-weight: 500;
		color: var(--text-secondary);
		font-size: 0.875rem;
	}

	.credential-value {
		font-weight: 600;
		color: var(--text-primary);
		font-size: 0.875rem;
		font-family: var(--font-mono);
		background: var(--bg-secondary);
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-sm);
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

		.shape {
			font-size: 1.5rem;
		}
	}

	@media (max-width: 480px) {
		.auth-card {
			padding: 1.5rem;
		}

		.auth-title {
			font-size: 1.5rem;
		}

		.credential-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}
	}
</style> 