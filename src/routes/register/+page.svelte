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
	<div class="auth-card" style="max-width: 500px;">
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
	
	.auth-footer {
		margin-top: 2rem;
	}
	
	.auth-footer .card {
		background: var(--gray-50);
		border: 1px solid var(--gray-200);
	}
</style> 