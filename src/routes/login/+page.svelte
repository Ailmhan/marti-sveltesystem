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
			error = err instanceof Error ? err.message : 'Ошибка входа';
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
					placeholder="Введите email"
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
			</div>
		</div>
	</div>
</div>

<style>
	/* CSS переменные для темной темы */
	:global(.dark) {
		--auth-bg: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
		--auth-card-bg: rgba(30, 41, 59, 0.95);
		--auth-card-border: rgba(139, 92, 246, 0.3);
		--auth-text-primary: #f8fafc;
		--auth-text-secondary: #cbd5e1;
		--auth-input-bg: rgba(51, 65, 85, 0.8);
		--auth-input-border: rgba(139, 92, 246, 0.4);
		--auth-input-text: #f1f5f9;
		--auth-error-bg: rgba(239, 68, 68, 0.15);
		--auth-error-border: rgba(239, 68, 68, 0.3);
		--auth-error-text: #fca5a5;
	}

	/* Auth Container */
	.auth-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		padding: 1rem;
		position: relative;
		overflow: hidden;
	}

	:global(.dark) .auth-container {
		background: var(--auth-bg);
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

	:global(.dark) .shape {
		opacity: 0.05;
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
		border-radius: 1rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		padding: 3rem;
		width: 100%;
		max-width: 450px;
		position: relative;
		z-index: 10;
		border: 1px solid rgba(255, 255, 255, 0.2);
		animation: slideInUp 0.6s ease-out;
	}

	:global(.dark) .auth-card {
		background: var(--auth-card-bg);
		border: 1px solid var(--auth-card-border);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
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
		color: #111827;
		margin: 0 0 0.5rem 0;
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	:global(.dark) .auth-title {
		color: var(--auth-text-primary);
		background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.auth-subtitle {
		color: #6b7280;
		font-size: 1rem;
		margin: 0;
	}

	:global(.dark) .auth-subtitle {
		color: var(--auth-text-secondary);
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
		color: #374151;
		margin-bottom: 0.75rem;
		font-size: 0.875rem;
	}

	:global(.dark) .form-label {
		color: var(--auth-text-secondary);
	}

	.label-icon {
		font-size: 1rem;
	}

	.form-input {
		width: 100%;
		padding: 1rem 1.25rem;
		border: 2px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 1rem;
		transition: all 0.2s ease;
		background: #ffffff;
		color: #111827;
	}

	:global(.dark) .form-input {
		background: var(--auth-input-bg);
		border-color: var(--auth-input-border);
		color: var(--auth-input-text);
	}

	.form-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
		transform: translateY(-1px);
	}

	:global(.dark) .form-input:focus {
		border-color: #a855f7;
		box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.2);
	}

	.form-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.form-input::placeholder {
		color: #9ca3af;
	}

	:global(.dark) .form-input::placeholder {
		color: #64748b;
	}

	/* Error Message */
	.error-message {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: 0.5rem;
		color: #dc2626;
		font-size: 0.875rem;
		margin-bottom: 1.5rem;
	}

	:global(.dark) .error-message {
		background: var(--auth-error-bg);
		border-color: var(--auth-error-border);
		color: var(--auth-error-text);
	}

	.error-icon {
		font-size: 1rem;
	}

	/* Submit Button */
	.submit-btn {
		width: 100%;
		padding: 1rem 1.5rem;
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		position: relative;
		overflow: hidden;
	}

	:global(.dark) .submit-btn {
		background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
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
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}

	:global(.dark) .submit-btn:hover:not(:disabled) {
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
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
		border-top: 1px solid #e5e7eb;
		padding-top: 2rem;
	}

	:global(.dark) .auth-footer {
		border-top-color: #334155;
	}

	.auth-links {
		text-align: center;
	}

	.register-text {
		color: #6b7280;
		font-size: 0.875rem;
		margin: 0;
	}

	:global(.dark) .register-text {
		color: var(--auth-text-secondary);
	}

	.register-link {
		color: #3b82f6;
		text-decoration: none;
		font-weight: 600;
		transition: color 0.2s ease;
	}

	:global(.dark) .register-link {
		color: #a855f7;
	}

	.register-link:hover {
		color: #1d4ed8;
		text-decoration: underline;
	}

	:global(.dark) .register-link:hover {
		color: #7c3aed;
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
	}
</style> 