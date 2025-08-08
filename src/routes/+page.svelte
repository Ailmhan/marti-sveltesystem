<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { languageStore } from '$lib/stores/language';

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
	<div class="container">
		<!-- Hero Section -->
		<div class="hero-section">
		{#if $authStore.schoolData?.logoUrl}
			<div class="hero-background" style="background-image: url('{$authStore.schoolData.logoUrl}')">
				<div class="hero-overlay"></div>
			</div>
		{:else}
			<div class="hero-background" style="background-image: url('https://images.unsplash.com/photo-1523050854058-8df90110c9e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')">
				<div class="hero-overlay"></div>
			</div>
		{/if}
		<div class="hero-content">
			<div class="hero-text-overlay">
				<div class="welcome-badge">
					<span class="badge-icon">👋</span>
					<span class="badge-text">Добро пожаловать</span>
				</div>
				<h1 class="hero-title">
					{#if $authStore.schoolData}
						{$authStore.schoolData.nameRu}
					{:else}
						Школьная система
					{/if}
				</h1>
				<p class="hero-subtitle">
					{#if $authStore.schoolData}
						{$authStore.schoolData.addressRu || 'Управляйте всеми аспектами школьной жизни'}
					{:else}
						Управляйте всеми аспектами школьной жизни
					{/if}
				</p>
			</div>
		</div>
	</div>

	<div class="modules-section">
		<div class="section-header">
			<div class="section-icon">⚡</div>
			<h2 class="section-title">Модули системы</h2>
			<p class="section-subtitle">Управляйте всеми аспектами школьной жизни</p>
		</div>
		<div class="modules-grid">
			<div class="module-card">
				<div class="module-icon">📰</div>
				<div class="module-content">
					<h3 class="module-title">Новости</h3>
					<p class="module-description">Управление школьными новостями</p>
					<a href="/news" class="module-link">Перейти к новостям</a>
				</div>
			</div>

			<div class="module-card">
				<div class="module-icon">👥</div>
				<div class="module-content">
					<h3 class="module-title">Учителя</h3>
					<p class="module-description">База данных учителей</p>
					<a href="/teachers" class="module-link">Перейти к учителям</a>
				</div>
			</div>

			<div class="module-card">
				<div class="module-icon">🏆</div>
				<div class="module-content">
					<h3 class="module-title">Доска почета</h3>
					<p class="module-description">Лучшие ученики школы</p>
					<a href="/honor-board" class="module-link">Перейти к доске почета</a>
				</div>
			</div>

			<div class="module-card">
				<div class="module-icon">🍽️</div>
				<div class="module-content">
					<h3 class="module-title">Меню столовой</h3>
					<p class="module-description">Ежедневное меню</p>
					<a href="/canteen" class="module-link">Перейти к меню</a>
				</div>
			</div>

			<div class="module-card">
				<div class="module-icon">📅</div>
				<div class="module-content">
					<h3 class="module-title">Расписание</h3>
					<p class="module-description">Школьное расписание</p>
					<a href="/schedule" class="module-link">Перейти к расписанию</a>
				</div>
			</div>

			<div class="module-card">
				<div class="module-icon">🎓</div>
				<div class="module-content">
					<h3 class="module-title">Классы</h3>
					<p class="module-description">Управление классами</p>
					<a href="/classes" class="module-link">Перейти к классам</a>
				</div>
			</div>
		</div>
	</div>

	{#if $authStore.schoolData}
		<div class="school-info-section">
			<div class="section-header">
				<div class="section-icon">🏫</div>
				<h2 class="section-title">Информация о школе</h2>
				<p class="section-subtitle">Подробная информация о вашем учебном заведении</p>
			</div>
			<div class="info-card">
				<div class="info-grid">
					<div class="info-item">
						<div class="info-icon">📧</div>
						<div class="info-content">
							<label>Email</label>
							<span>{$authStore.schoolData.email}</span>
						</div>
					</div>
					<div class="info-item">
						<div class="info-icon">🏫</div>
						<div class="info-content">
							<label>Название</label>
							<span>{$languageStore === 'ru' ? $authStore.schoolData.nameRu : $authStore.schoolData.nameKz}</span>
						</div>
					</div>
					{#if ($languageStore === 'ru' && $authStore.schoolData.addressRu) || ($languageStore === 'kz' && $authStore.schoolData.addressKz)}
						<div class="info-item">
							<div class="info-icon">📍</div>
							<div class="info-content">
								<label>Адрес</label>
								<span>{$languageStore === 'ru' ? $authStore.schoolData.addressRu : $authStore.schoolData.addressKz}</span>
							</div>
						</div>
					{/if}
					{#if ($languageStore === 'ru' && $authStore.schoolData.descriptionRu) || ($languageStore === 'kz' && $authStore.schoolData.descriptionKz)}
						<div class="info-item description-item">
							<div class="info-icon">📝</div>
							<div class="info-content">
								<label>Описание</label>
								<span>{$languageStore === 'ru' ? $authStore.schoolData.descriptionRu : $authStore.schoolData.descriptionKz}</span>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
	</div>
</div>

<style>
	.dashboard {
		min-height: 100vh;
		background: linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.3) 100%);
	}

	.container {
		max-width: 1210px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	@media (max-width: 768px) {
		.container {
			padding: 0 1rem;
		}
	}

	/* Hero Section */
	.hero-section {
		position: relative;
		padding: 6rem 0;
		margin-bottom: 4rem;
		overflow: hidden;
		min-height: 500px;
		width: 100%;
	}

	.hero-background {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(262 83% 68% / 0.05) 100%);
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}

	.hero-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			135deg,
			rgba(0, 0, 0, 0.3) 0%,
			rgba(0, 0, 0, 0.2) 50%,
			rgba(0, 0, 0, 0.4) 100%
		);
	}

	.hero-content {
		position: relative;
		z-index: 1;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		padding: 0 2rem;
	}

	.school-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4rem;
		margin-bottom: 3rem;
	}

	.school-logo {
		flex-shrink: 0;
		width: 350px;
		height: 220px;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 
			0 20px 40px -12px rgba(0, 0, 0, 0.15),
			0 8px 16px -4px rgba(0, 0, 0, 0.1);
		border: 1px solid hsl(var(--border));
		background: white;
		transition: all 0.3s ease;
	}

	.school-logo:hover {
		transform: translateY(-4px);
		box-shadow: 
			0 25px 50px -12px rgba(0, 0, 0, 0.2),
			0 12px 24px -4px rgba(0, 0, 0, 0.15);
	}

	.school-logo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.school-logo-placeholder {
		flex-shrink: 0;
		width: 350px;
		height: 220px;
		border-radius: 16px;
		background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(262 83% 68%) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 
			0 20px 40px -12px rgba(0, 0, 0, 0.15),
			0 8px 16px -4px rgba(0, 0, 0, 0.1);
		border: 1px solid hsl(var(--border));
		position: relative;
		transition: all 0.3s ease;
	}

	.school-logo-placeholder:hover {
		transform: translateY(-4px);
		box-shadow: 
			0 25px 50px -12px rgba(0, 0, 0, 0.2),
			0 12px 24px -4px rgba(0, 0, 0, 0.15);
	}

	.school-logo-placeholder::before {
		content: 'Логотип школы';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: white;
		font-size: 1.25rem;
		font-weight: 600;
		text-align: center;
		line-height: 1.4;
	}

	.placeholder-icon {
		font-size: 3.5rem;
		color: white;
		opacity: 0.2;
		position: absolute;
		top: 20px;
		right: 20px;
	}

	.school-info-text {
		flex: 1;
		max-width: 600px;
	}

	.welcome-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: rgba(255, 255, 255, 0.15);
		color: white;
		border-radius: 50px;
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 2rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.3);
	}

	.badge-icon {
		font-size: 1rem;
	}

	.hero-title {
		font-size: 4rem;
		font-weight: 800;
		color: white;
		margin: 0 0 1.5rem 0;
		line-height: 1.1;
		text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
	}

	.hero-subtitle {
		font-size: 1.5rem;
		color: rgba(255, 255, 255, 0.95);
		margin: 0;
		line-height: 1.5;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
	}


	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
		background: hsl(var(--card));
		border-radius: 12px;
		border: 1px solid hsl(var(--border));
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		min-width: 100px;
	}

	.stat-number {
		font-size: 1.5rem;
		font-weight: 700;
		color: hsl(var(--primary));
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
		font-weight: 500;
	}

	/* Section Headers */
	.section-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.section-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		display: inline-block;
	}

	.section-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: hsl(var(--foreground));
		margin: 0 0 1rem 0;
		background: linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--primary)) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.section-subtitle {
		font-size: 1.125rem;
		color: hsl(var(--muted-foreground));
		margin: 0;
		line-height: 1.6;
	}

	/* School Info Section */
	.school-info-section {
		margin-bottom: 4rem;
	}

	.info-card {
		background: hsl(var(--card));
		border-radius: 16px;
		padding: 2.5rem;
		box-shadow: 
			0 20px 40px -12px rgba(0, 0, 0, 0.1),
			0 8px 16px -4px rgba(0, 0, 0, 0.05);
		border: 1px solid hsl(var(--border));
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 1.5rem;
	}

	.info-item {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1.5rem;
		background: hsl(var(--background));
		border-radius: 12px;
		border: 1px solid hsl(var(--border));
		transition: all 0.3s ease;
	}

	.info-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px -3px rgba(0, 0, 0, 0.1);
		border-color: hsl(var(--primary) / 0.3);
	}

	.info-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(262 83% 68% / 0.1) 100%);
		border-radius: 8px;
	}

	.info-content {
		flex: 1;
	}

	.info-content label {
		font-weight: 600;
		color: hsl(var(--muted-foreground));
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
		display: block;
	}

	.info-content span {
		color: hsl(var(--foreground));
		font-weight: 500;
		line-height: 1.5;
	}

	.description-item {
		grid-column: 1 / -1;
	}

	.description-item span {
		line-height: 1.6;
		font-weight: 400;
	}

	/* Modules Section */
	.modules-section {
		padding-bottom: 4rem;
	}

	.modules-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		max-width: 1210px;
		margin: 0 auto;
	}

	.module-card {
		background: hsl(var(--card));
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 
			0 10px 25px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -1px rgba(0, 0, 0, 0.05);
		border: 1px solid hsl(var(--border));
		transition: all 0.3s ease;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.module-card:hover {
		transform: translateY(-4px);
		box-shadow: 
			0 20px 40px -12px rgba(0, 0, 0, 0.15),
			0 8px 16px -4px rgba(0, 0, 0, 0.1);
		border-color: hsl(var(--primary) / 0.3);
	}

	.module-icon {
		font-size: 2.5rem;
		flex-shrink: 0;
	}

	.module-content {
		flex: 1;
	}

	.module-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		margin: 0 0 0.5rem 0;
	}

	.module-description {
		color: hsl(var(--muted-foreground));
		margin: 0 0 1rem 0;
		line-height: 1.5;
	}

	.module-link {
		display: inline-block;
		color: hsl(var(--primary));
		text-decoration: none;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.module-link:hover {
		color: hsl(262 83% 68%);
		text-decoration: underline;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.hero-section {
			padding: 3rem 0;
			margin-bottom: 3rem;
		}

		.hero-content {
			padding: 0 1rem;
		}

		.hero-title {
			font-size: 2.5rem;
		}

		.hero-subtitle {
			font-size: 1.25rem;
		}

		.welcome-badge {
			padding: 0.5rem 1rem;
			font-size: 0.875rem;
			margin-bottom: 1.5rem;
		}

	

		.stat-item {
			flex-direction: row;
			justify-content: space-between;
			min-width: auto;
		}

		.section-title {
			font-size: 2rem;
		}



		.info-card {
			padding: 1.5rem;
		}

		.info-grid {
			grid-template-columns: 1fr;
		}

		.modules-section {
			padding-bottom: 2rem;
		}

		.modules-grid {
			grid-template-columns: 1fr;
		}

		.module-card {
			padding: 1.5rem;
		}
	}
</style>
