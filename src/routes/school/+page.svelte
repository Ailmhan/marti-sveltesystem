<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { languageStore } from '$lib/stores/language';
	import { apiClient } from '$lib/api/client';
	import DataCard from '$lib/components/DataCard.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import Schedule from '$lib/components/Schedule.svelte';
	import type { News, Teacher, HonorBoard, CanteenMenu, Schedule as ScheduleType, Class } from '$lib/types/api';
	
	// Данные для превью
	let news: News[] = [];
	let teachers: Teacher[] = [];
	let honorBoard: HonorBoard[] = [];
	let canteenMenu: CanteenMenu[] = [];
	let schedule: ScheduleType[] = [];
	let classes: Class[] = [];
	let loading = true;

	onMount(async () => {
		console.log('🏫 School Landing Page onMount, authStore:', {
			hasToken: !!$authStore.token,
			hasSchoolData: !!$authStore.schoolData,
			logoUrl: $authStore.schoolData?.logoUrl,
			schoolId: $authStore.schoolId
		});
		
		await loadPreviewData();
	});

	async function loadPreviewData() {
		if (!$authStore.schoolId) {
			console.log('🏫 School ID не найден, пропускаем загрузку данных');
			loading = false;
			return;
		}

		try {
			loading = true;
			console.log('🏫 Загружаем данные для лендинга школы:', $authStore.schoolId);
			
			// Загружаем превью данных из каждого модуля (по 3-4 элемента)
			const [
				newsData,
				teachersData,
				honorBoardData,
				canteenData,
				scheduleData,
				classesData
			] = await Promise.all([
				apiClient.getNews($authStore.schoolId).then(data => {
					console.log('📰 Загружено новостей:', data.length);
					return data.slice(0, 3);
				}).catch(err => {
					console.warn('❌ Ошибка загрузки новостей:', err);
					return [];
				}),
				apiClient.getTeachers($authStore.schoolId).then(data => {
					console.log('👥 Загружено учителей:', data.length);
					return data.slice(0, 4);
				}).catch(err => {
					console.warn('❌ Ошибка загрузки учителей:', err);
					return [];
				}),
				apiClient.getHonorBoard($authStore.schoolId).then(data => {
					console.log('🏆 Загружено достижений:', data.length);
					return data.slice(0, 3);
				}).catch(err => {
					console.warn('❌ Ошибка загрузки доски почета:', err);
					return [];
				}),
				apiClient.getCanteenMenu($authStore.schoolId).then(data => {
					console.log('🍽️ Загружено меню:', data.length);
					return data.slice(0, 2);
				}).catch(err => {
					console.warn('❌ Ошибка загрузки меню:', err);
					return [];
				}),
				apiClient.getSchedule($authStore.schoolId).then(data => {
					// Берем расписание на сегодня и завтра
					const today = new Date();
					const tomorrow = new Date(today);
					tomorrow.setDate(today.getDate() + 1);
					
					const filtered = data.filter(item => {
						const itemDate = new Date(item.date);
						return itemDate.toDateString() === today.toDateString() || 
							   itemDate.toDateString() === tomorrow.toDateString();
					}).slice(0, 6);
					
					console.log('📅 Загружено расписание:', data.length, 'на сегодня/завтра:', filtered.length);
					return filtered;
				}).catch(err => {
					console.warn('❌ Ошибка загрузки расписания:', err);
					return [];
				}),
				apiClient.getClasses($authStore.schoolId).then(data => {
					console.log('🎓 Загружено классов:', data.length);
					return data.slice(0, 6);
				}).catch(err => {
					console.warn('❌ Ошибка загрузки классов:', err);
					return [];
				})
			]);

			news = newsData;
			teachers = teachersData;
			honorBoard = honorBoardData;
			canteenMenu = canteenData;
			schedule = scheduleData;
			classes = classesData;

		} catch (error) {
			console.error('❌ Ошибка загрузки данных для лендинга:', error);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Лендинг школы</title>
</svelte:head>

<div class="school-landing">
	<!-- Hero Section -->
	<section class="hero-section">
		{#if $authStore.schoolData?.logoUrl}
			<div class="hero-background" style="background-image: url('{$authStore.schoolData.logoUrl}')"></div>
		{/if}
		<div class="hero-content">
			<div class="hero-text">
				<h1 class="hero-title">
					{#if $authStore.schoolData}
						{($languageStore === 'ru' ? $authStore.schoolData.nameRu : $authStore.schoolData.nameKz) || 'Школьная система'}
					{:else}
						Школьная система
					{/if}
				</h1>
				<p class="hero-subtitle">
					{#if $authStore.schoolData}
						{($languageStore === 'ru' ? $authStore.schoolData.descriptionRu : $authStore.schoolData.descriptionKz)
						|| ($languageStore === 'ru' ? $authStore.schoolData.addressRu : $authStore.schoolData.addressKz)
						|| 'Добро пожаловать в нашу школу'}
					{:else}
						Добро пожаловать в нашу школу
					{/if}
				</p>
				{#if $authStore.schoolData?.addressRu || $authStore.schoolData?.addressKz}
					<div class="hero-address">
						📍 {$languageStore === 'ru' ? $authStore.schoolData.addressRu : $authStore.schoolData.addressKz}
					</div>
				{/if}
			</div>
		</div>
	</section>

	<!-- Quick Actions -->
	<section class="quick-actions">
		<div class="container">
			<h2>Быстрый доступ</h2>
			<div class="actions-grid">
				<a href="/news" class="action-card">
					<div class="action-icon">📰</div>
					<h3>Новости</h3>
					<p>Последние события и объявления</p>
				</a>
				<a href="/teachers" class="action-card">
					<div class="action-icon">👥</div>
					<h3>Учителя</h3>
					<p>Наш педагогический состав</p>
				</a>
				<a href="/schedule" class="action-card">
					<div class="action-icon">📅</div>
					<h3>Расписание</h3>
					<p>Расписание уроков и мероприятий</p>
				</a>
				<a href="/" class="action-card">
					<div class="action-icon">📊</div>
					<h3>Панель управления</h3>
					<p>Перейти в основную систему</p>
				</a>
			</div>
		</div>
	</section>

	<!-- Preview Sections -->
	{#if !loading && $authStore.schoolId}
		<!-- News Preview -->
		{#if news.length > 0}
			<section class="preview-section">
				<div class="container">
					<h2>Последние новости</h2>
					<div class="preview-grid">
						{#each news as item}
							<DataCard 
								data={item}
								type="news"
								showActions={false}
							/>
						{/each}
					</div>
					<div class="section-footer">
						<a href="/news" class="view-all-btn">Посмотреть все новости →</a>
					</div>
				</div>
			</section>
		{/if}

		<!-- Teachers Preview -->
		{#if teachers.length > 0}
			<section class="preview-section">
				<div class="container">
					<h2>Наши учителя</h2>
					<div class="preview-grid">
						{#each teachers as item}
							<DataCard 
								data={item}
								type="teacher"
								showActions={false}
							/>
						{/each}
					</div>
					<div class="section-footer">
						<a href="/teachers" class="view-all-btn">Посмотреть всех учителей →</a>
					</div>
				</div>
			</section>
		{/if}

		<!-- Honor Board Preview -->
		{#if honorBoard.length > 0}
			<section class="preview-section">
				<div class="container">
					<h2>Доска почета</h2>
					<div class="preview-grid">
						{#each honorBoard as item}
							<DataCard 
								data={item}
								type="honorBoard"
								showActions={false}
							/>
						{/each}
					</div>
					<div class="section-footer">
						<a href="/honor-board" class="view-all-btn">Посмотреть все достижения →</a>
					</div>
				</div>
			</section>
		{/if}

		<!-- Schedule Preview -->
		{#if schedule.length > 0}
			<section class="preview-section">
				<div class="container">
					<h2>Расписание на сегодня</h2>
					<Schedule schedule={schedule} showActions={false} />
					<div class="section-footer">
						<a href="/schedule" class="view-all-btn">Посмотреть полное расписание →</a>
					</div>
				</div>
			</section>
		{/if}

		<!-- Canteen Menu Preview -->
		{#if canteenMenu.length > 0}
			<section class="preview-section">
				<div class="container">
					<h2>Меню столовой</h2>
					<div class="preview-grid">
						{#each canteenMenu as item}
							<DataCard 
								data={item}
								type="canteenMenu"
								showActions={false}
							/>
						{/each}
					</div>
					<div class="section-footer">
						<a href="/canteen" class="view-all-btn">Посмотреть полное меню →</a>
					</div>
				</div>
			</section>
		{/if}
	{:else if loading}
		<section class="loading-section">
			<div class="container">
				<LoadingSpinner />
				<p>Загружаем информацию о школе...</p>
			</div>
		</section>
	{:else}
		<section class="no-data-section">
			<div class="container">
				<h2>Добро пожаловать!</h2>
				<p>Для просмотра информации о школе необходимо войти в систему.</p>
				<a href="/" class="cta-button">Перейти в систему</a>
			</div>
		</section>
	{/if}
</div>

<style>
	.school-landing {
		min-height: 100vh;
		background: hsl(var(--background));
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	/* Hero Section */
	.hero-section {
		position: relative;
		min-height: 60vh;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		color: white;
		overflow: hidden;
	}

	.hero-background {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-size: cover;
		background-position: center;
		filter: blur(8px) brightness(0.7);
		z-index: 1;
	}

	.hero-content {
		position: relative;
		z-index: 2;
		max-width: 800px;
		padding: 2rem;
	}

	.hero-title {
		font-size: 3rem;
		font-weight: 700;
		margin-bottom: 1rem;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
	}

	.hero-subtitle {
		font-size: 1.25rem;
		margin-bottom: 1.5rem;
		opacity: 0.9;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
	}

	.hero-address {
		font-size: 1.125rem;
		opacity: 0.8;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
	}

	/* Quick Actions */
	.quick-actions {
		padding: 4rem 0;
		background: hsl(var(--card));
	}

	.quick-actions h2 {
		text-align: center;
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 3rem;
		color: hsl(var(--foreground));
	}

	.actions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.action-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 2rem;
		background: hsl(var(--background));
		border-radius: 1rem;
		border: 1px solid hsl(var(--border));
		text-decoration: none;
		color: inherit;
		transition: all 0.3s ease;
	}

	.action-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
		border-color: hsl(var(--primary));
	}

	.action-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.action-card h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: hsl(var(--foreground));
	}

	.action-card p {
		color: hsl(var(--muted-foreground));
		line-height: 1.5;
	}

	/* Preview Sections */
	.preview-section {
		padding: 4rem 0;
		border-bottom: 1px solid hsl(var(--border));
	}

	.preview-section h2 {
		text-align: center;
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 3rem;
		color: hsl(var(--foreground));
	}

	.preview-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.section-footer {
		text-align: center;
	}

	.view-all-btn {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		text-decoration: none;
		border-radius: 0.5rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.view-all-btn:hover {
		background: hsl(var(--primary) / 0.9);
		transform: translateY(-1px);
	}

	/* Loading & No Data */
	.loading-section,
	.no-data-section {
		padding: 4rem 0;
		text-align: center;
	}

	.loading-section p,
	.no-data-section p {
		margin-top: 1rem;
		color: hsl(var(--muted-foreground));
	}

	.cta-button {
		display: inline-block;
		margin-top: 1rem;
		padding: 0.75rem 1.5rem;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		text-decoration: none;
		border-radius: 0.5rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.cta-button:hover {
		background: hsl(var(--primary) / 0.9);
		transform: translateY(-1px);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.hero-title {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1rem;
		}

		.actions-grid {
			grid-template-columns: 1fr;
		}

		.preview-grid {
			grid-template-columns: 1fr;
		}

		.container {
			padding: 0 0.5rem;
		}
	}
</style>