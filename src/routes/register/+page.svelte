<script lang="ts">
	import { apiClient } from '$lib/api/client';
	import { goto } from '$app/navigation';

	let loading = false;
	let error = '';
	let success = '';

	let formData = {
		nameRu: '',
		nameKz: '',
		email: '',
		password: '',
		addressRu: '',
		addressKz: '',
		descriptionRu: '',
		descriptionKz: '',
		logoUrl: ''
	};

	async function handleSubmit() {
		loading = true;
		error = '';
		success = '';

		try {
			await apiClient.createSchool(formData);
			success = 'Школа успешно зарегистрирована! Перенаправление на страницу входа...';
			setTimeout(() => {
				goto('/login');
			}, 2000);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Произошла ошибка при регистрации';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Регистрация школы - Школьная система</title>
</svelte:head>

<div class="auth-container">
	<div class="auth-card">
		<div class="auth-header">
			<h1 class="auth-title">Регистрация школы</h1>
			<p class="auth-subtitle">Создайте аккаунт для вашей школы</p>
		</div>

		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<!-- Основная информация -->
			<div class="card">
				<div class="card-header">
					<h3 class="card-title">Основная информация</h3>
				</div>
				<div class="card-body space-y-4">
					<div class="form-group">
						<label for="nameRu" class="form-label">Название школы (русский)</label>
						<input
							id="nameRu"
							type="text"
							bind:value={formData.nameRu}
							class="form-input"
							placeholder="Название школы"
							required
							disabled={loading}
						/>
					</div>

					<div class="form-group">
						<label for="nameKz" class="form-label">Название школы (казахский)</label>
						<input
							id="nameKz"
							type="text"
							bind:value={formData.nameKz}
							class="form-input"
							placeholder="Мектеп атауы"
							required
							disabled={loading}
						/>
					</div>

					<div class="form-group">
						<label for="email" class="form-label">Email</label>
						<input
							id="email"
							type="email"
							bind:value={formData.email}
							class="form-input"
							placeholder="school@example.com"
							required
							disabled={loading}
						/>
					</div>

					<div class="form-group">
						<label for="password" class="form-label">Пароль</label>
						<input
							id="password"
							type="password"
							bind:value={formData.password}
							class="form-input"
							placeholder="Минимум 6 символов"
							minlength="6"
							required
							disabled={loading}
						/>
					</div>
				</div>
			</div>

			<!-- Адрес -->
			<div class="card">
				<div class="card-header">
					<h3 class="card-title">Адрес</h3>
				</div>
				<div class="card-body space-y-4">
					<div class="form-group">
						<label for="addressRu" class="form-label">Адрес (русский)</label>
						<input
							id="addressRu"
							type="text"
							bind:value={formData.addressRu}
							class="form-input"
							placeholder="Полный адрес школы"
							disabled={loading}
						/>
					</div>

					<div class="form-group">
						<label for="addressKz" class="form-label">Адрес (казахский)</label>
						<input
							id="addressKz"
							type="text"
							bind:value={formData.addressKz}
							class="form-input"
							placeholder="Мектеп мекенжайы"
							disabled={loading}
						/>
					</div>
				</div>
			</div>

			<!-- Описание -->
			<div class="card">
				<div class="card-header">
					<h3 class="card-title">Описание</h3>
				</div>
				<div class="card-body space-y-4">
					<div class="form-group">
						<label for="descriptionRu" class="form-label">Описание (русский)</label>
						<textarea
							id="descriptionRu"
							bind:value={formData.descriptionRu}
							class="form-textarea"
							placeholder="Краткое описание школы"
							rows="3"
							disabled={loading}
						></textarea>
					</div>

					<div class="form-group">
						<label for="descriptionKz" class="form-label">Описание (казахский)</label>
						<textarea
							id="descriptionKz"
							bind:value={formData.descriptionKz}
							class="form-textarea"
							placeholder="Мектеп сипаттамасы"
							rows="3"
							disabled={loading}
						></textarea>
					</div>
				</div>
			</div>

			<!-- Логотип -->
			<div class="card">
				<div class="card-header">
					<h3 class="card-title">Логотип</h3>
				</div>
				<div class="card-body">
					<div class="form-group">
						<label for="logoUrl" class="form-label">URL логотипа</label>
						<input
							id="logoUrl"
							type="url"
							bind:value={formData.logoUrl}
							class="form-input"
							placeholder="https://example.com/logo.png"
							disabled={loading}
						/>
					</div>
				</div>
			</div>

			{#if error}
				<div class="form-error">{error}</div>
			{/if}

			{#if success}
				<div class="form-success">{success}</div>
			{/if}

			<button 
				type="submit" 
				class="btn btn-primary w-full"
				disabled={loading}
			>
				{#if loading}
					<div class="loading"></div>
				{/if}
				{loading ? 'Регистрация...' : 'Зарегистрировать школу'}
			</button>
		</form>

		<div class="auth-footer">
			<div class="text-center">
				<p class="text-sm text-gray-600">
					Уже есть аккаунт? 
					<a href="/login" class="text-primary hover:text-primary-dark font-medium">
						Войти в систему
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
		--auth-success-bg: rgba(34, 197, 94, 0.15);
		--auth-success-border: rgba(34, 197, 94, 0.3);
		--auth-success-text: #86efac;
		--card-bg: rgba(51, 65, 85, 0.6);
		--card-border: rgba(139, 92, 246, 0.2);
		--card-header-bg: rgba(71, 85, 105, 0.8);
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
	}

	:global(.dark) .auth-container {
		background: var(--auth-bg);
	}

	/* Auth Card */
	.auth-card {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border-radius: 1rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		padding: 2rem;
		width: 100%;
		max-width: 600px;
		position: relative;
		z-index: 10;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	:global(.dark) .auth-card {
		background: var(--auth-card-bg);
		border: 1px solid var(--auth-card-border);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
	}

	/* Auth Header */
	.auth-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.auth-title {
		font-size: 2rem;
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

	/* Utility Classes */
	.space-y-6 > * + * {
		margin-top: 1.5rem;
	}
	
	.space-y-4 > * + * {
		margin-top: 1rem;
	}
	
	.w-full {
		width: 100%;
	}
	
	.text-sm {
		font-size: 0.875rem;
	}
	
	.text-center {
		text-align: center;
	}

	/* Card Styles */
	.card {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		overflow: hidden;
	}

	:global(.dark) .card {
		background: var(--card-bg);
		border: 1px solid var(--card-border);
	}

	.card-header {
		background: #f3f4f6;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	:global(.dark) .card-header {
		background: var(--card-header-bg);
		border-bottom-color: var(--card-border);
	}

	.card-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #374151;
		margin: 0;
	}

	:global(.dark) .card-title {
		color: var(--auth-text-primary);
	}

	.card-body {
		padding: 1.5rem;
	}

	/* Form Styles */
	.form-group {
		margin-bottom: 1rem;
	}

	.form-label {
		display: block;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}

	:global(.dark) .form-label {
		color: var(--auth-text-secondary);
	}

	.form-input,
	.form-textarea {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 2px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		transition: all 0.2s ease;
		background: #ffffff;
		color: #111827;
	}

	:global(.dark) .form-input,
	:global(.dark) .form-textarea {
		background: var(--auth-input-bg);
		border-color: var(--auth-input-border);
		color: var(--auth-input-text);
	}

	.form-input:focus,
	.form-textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	:global(.dark) .form-input:focus,
	:global(.dark) .form-textarea:focus {
		border-color: #a855f7;
		box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
	}

	.form-input:disabled,
	.form-textarea:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.form-input::placeholder,
	.form-textarea::placeholder {
		color: #9ca3af;
	}

	:global(.dark) .form-input::placeholder,
	:global(.dark) .form-textarea::placeholder {
		color: #64748b;
	}

	.form-textarea {
		resize: vertical;
		min-height: 80px;
	}

	/* Button Styles */
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.75rem 1.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 0.5rem;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
	}

	.btn-primary {
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		color: white;
	}

	:global(.dark) .btn-primary {
		background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
	}

	:global(.dark) .btn-primary:hover:not(:disabled) {
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	/* Loading Spinner */
	.loading {
		width: 1rem;
		height: 1rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top: 2px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-right: 0.5rem;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Error and Success Messages */
	.form-error {
		padding: 1rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: 0.5rem;
		color: #dc2626;
		font-size: 0.875rem;
		margin-bottom: 1rem;
	}

	:global(.dark) .form-error {
		background: var(--auth-error-bg);
		border-color: var(--auth-error-border);
		color: var(--auth-error-text);
	}

	.form-success {
		padding: 1rem;
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.2);
		border-radius: 0.5rem;
		color: #16a34a;
		font-size: 0.875rem;
		margin-bottom: 1rem;
	}

	:global(.dark) .form-success {
		background: var(--auth-success-bg);
		border-color: var(--auth-success-border);
		color: var(--auth-success-text);
	}

	/* Auth Footer */
	.auth-footer {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}

	:global(.dark) .auth-footer {
		border-top-color: #334155;
	}

	.text-gray-600 {
		color: #6b7280;
	}

	:global(.dark) .text-gray-600 {
		color: var(--auth-text-secondary);
	}

	.text-primary {
		color: #3b82f6;
	}

	:global(.dark) .text-primary {
		color: #a855f7;
	}

	.hover\:text-primary-dark:hover {
		color: #1d4ed8;
	}

	:global(.dark) .hover\:text-primary-dark:hover {
		color: #7c3aed;
	}

	.font-medium {
		font-weight: 500;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.auth-card {
			padding: 1.5rem;
			margin: 1rem;
		}

		.auth-title {
			font-size: 1.75rem;
		}

		.card-body {
			padding: 1rem;
		}
	}

	@media (max-width: 480px) {
		.auth-card {
			padding: 1rem;
		}

		.auth-title {
			font-size: 1.5rem;
		}

		.card-header {
			padding: 0.75rem 1rem;
		}

		.card-body {
			padding: 0.75rem;
		}
	}
</style> 