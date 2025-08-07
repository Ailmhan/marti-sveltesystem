<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';

	onMount(() => {
		// Простая проверка: если не авторизован - перенаправляем на логин
		if (!$authStore.isAuthenticated) {
			goto('/login');
		}
	});
</script>

<svelte:head>
	<title>Главная - Школьная система</title>
</svelte:head>

<div class="dashboard">
	<div class="welcome-section">
		<h1 class="text-3xl font-bold text-gray-900 mb-4">
			{#if $authStore.schoolData}
				Добро пожаловать в {$authStore.schoolData.nameRu}
			{:else}
				Добро пожаловать в школьную систему
			{/if}
		</h1>
		<p class="text-lg text-gray-600 mb-8">
			{#if $authStore.schoolData}
				{$authStore.schoolData.addressRu || 'Управляйте новостями, учителями, расписанием и другими аспектами школьной жизни'}
			{:else}
				Управляйте новостями, учителями, расписанием и другими аспектами школьной жизни
			{/if}
		</p>
	</div>

	{#if $authStore.schoolData}
		<div class="school-info">
			<div class="info-card">
				<h3 class="info-title">Информация о школе</h3>
				<div class="info-grid">
					<div class="info-item">
						<label>ID школы:</label>
						<span>{$authStore.schoolId}</span>
					</div>
					<div class="info-item">
						<label>Название (Русский):</label>
						<span>{$authStore.schoolData.nameRu}</span>
					</div>
					<div class="info-item">
						<label>Название (Казахский):</label>
						<span>{$authStore.schoolData.nameKz}</span>
					</div>
					<div class="info-item">
						<label>Email:</label>
						<span>{$authStore.schoolData.email}</span>
					</div>
					{#if $authStore.schoolData.addressRu}
						<div class="info-item">
							<label>Адрес (Русский):</label>
							<span>{$authStore.schoolData.addressRu}</span>
						</div>
					{/if}
					{#if $authStore.schoolData.addressKz}
						<div class="info-item">
							<label>Адрес (Казахский):</label>
							<span>{$authStore.schoolData.addressKz}</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<div class="stats-grid">
		<div class="stat-card">
			<div class="stat-icon">📰</div>
			<div class="stat-content">
				<h3 class="stat-title">Новости</h3>
				<p class="stat-description">Управление школьными новостями</p>
				<a href="/news" class="stat-link">Перейти к новостям</a>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">👥</div>
			<div class="stat-content">
				<h3 class="stat-title">Учителя</h3>
				<p class="stat-description">База данных учителей</p>
				<a href="/teachers" class="stat-link">Перейти к учителям</a>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">🏆</div>
			<div class="stat-content">
				<h3 class="stat-title">Доска почета</h3>
				<p class="stat-description">Лучшие ученики школы</p>
				<a href="/honor-board" class="stat-link">Перейти к доске почета</a>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">🍽️</div>
			<div class="stat-content">
				<h3 class="stat-title">Меню столовой</h3>
				<p class="stat-description">Ежедневное меню</p>
				<a href="/canteen" class="stat-link">Перейти к меню</a>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">📅</div>
			<div class="stat-content">
				<h3 class="stat-title">Расписание</h3>
				<p class="stat-description">Школьное расписание</p>
				<a href="/schedule" class="stat-link">Перейти к расписанию</a>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">🎓</div>
			<div class="stat-content">
				<h3 class="stat-title">Классы</h3>
				<p class="stat-description">Управление классами</p>
				<a href="/classes" class="stat-link">Перейти к классам</a>
			</div>
		</div>
	</div>
</div>

<style>
	.dashboard {
		padding: 2rem 0;
	}

	.welcome-section {
		text-align: center;
		margin-bottom: 3rem;
	}

	.school-info {
		margin-bottom: 3rem;
	}

	.info-card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e7eb;
	}

	.info-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: #111827;
		margin-bottom: 1.5rem;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.info-item label {
		font-weight: 500;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.info-item span {
		color: #111827;
		font-weight: 500;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-top: 2rem;
	}

	.stat-card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e7eb;
		transition: all 0.3s ease;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.stat-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
	}

	.stat-icon {
		font-size: 2.5rem;
		flex-shrink: 0;
	}

	.stat-content {
		flex: 1;
	}

	.stat-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.5rem 0;
	}

	.stat-description {
		color: #6b7280;
		margin: 0 0 1rem 0;
		line-height: 1.5;
	}

	.stat-link {
		display: inline-block;
		color: #3b82f6;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s ease;
	}

	.stat-link:hover {
		color: #2563eb;
		text-decoration: underline;
	}

	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}

		.stat-card {
			padding: 1.5rem;
		}

		.stat-icon {
			font-size: 2rem;
		}

		.info-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
