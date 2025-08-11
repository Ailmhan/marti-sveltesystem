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
		// Загружаем данные школы если их еще нет
		if (!$authStore.schoolData && $authStore.token) {
			await authStore.loadSchoolData();
		}
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

			console.log('✅ Все данные загружены для лендинга');

		} catch (error) {
			console.error('❌ Критическая ошибка загрузки данных для лендинга:', error);
		} finally {
			loading = false;
		}
	}

	function scrollToSection(sectionId: string) {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}
</script>

<svelte:head>
	<title>{$languageStore === 'ru' ? $authStore.schoolData?.nameRu : $authStore.schoolData?.nameKz} - Официальный сайт</title>
	<meta name="description" content={$languageStore === 'ru' ? $authStore.schoolData?.descriptionRu : $authStore.schoolData?.descriptionKz} />
</svelte:head>

<!-- Hero Section -->
<section class="hero-section">
	<!-- Фоновое изображение школы -->
	<div class="hero-background">
		{#if $authStore.schoolData?.logoUrl}
			<img 
				src={$authStore.schoolData.logoUrl} 
				alt="Фото школы" 
				class="hero-bg-image"
			/>
		{/if}
		<div class="hero-overlay"></div>
	</div>

	<div class="hero-content">
		<div class="hero-container">
			<!-- Логотип школы -->
			{#if $authStore.schoolData?.logoUrl}
				<div class="hero-logo">
					<img src={$authStore.schoolData.logoUrl} alt="Логотип школы" />
				</div>
			{:else}
				<div class="hero-logo-placeholder">
					🏫
				</div>
			{/if}

			<!-- Название и описание школы -->
			<div class="hero-text">
				<h1 class="hero-title">
					{$authStore.schoolData ? 
						($languageStore === 'ru' ? $authStore.schoolData.nameRu : $authStore.schoolData.nameKz) :
						'Добро пожаловать в школьную систему'
					}
				</h1>
				<p class="hero-description">
					{$authStore.schoolData ? 
						($languageStore === 'ru' ? $authStore.schoolData.descriptionRu : $authStore.schoolData.descriptionKz) :
						'Современная система управления школой с удобным интерфейсом для учителей, учеников и родителей'
					}
				</p>
				{#if $authStore.schoolData?.addressRu}
					<p class="hero-address">
						📍 {$languageStore === 'ru' ? $authStore.schoolData.addressRu : $authStore.schoolData.addressKz}
					</p>
				{:else if !$authStore.schoolData}
					<p class="hero-address">
						🏫 Для просмотра информации конкретной школы войдите в систему
					</p>
				{/if}
			</div>

			<!-- Быстрая навигация -->
			<div class="hero-nav">
				<button type="button" on:click={() => scrollToSection('news')} class="hero-nav-btn">
					📰 Новости
				</button>
				<button type="button" on:click={() => scrollToSection('teachers')} class="hero-nav-btn">
					👥 Учителя
				</button>
				<button type="button" on:click={() => scrollToSection('schedule')} class="hero-nav-btn">
					📅 Расписание
				</button>
				<a href="/login" class="hero-cta">
					🔐 Войти в систему
				</a>
			</div>
		</div>
	</div>
</section>

{#if loading}
	<div class="loading-section">
		<LoadingSpinner />
		<p>Загружаем информацию о школе...</p>
	</div>
{:else if !$authStore.schoolData}
	<!-- Секция для неавторизованных пользователей -->
	<section class="demo-section">
		<div class="section-container">
			<div class="demo-header">
				<h2>🚀 Возможности системы</h2>
				<p class="demo-subtitle">Полнофункциональная система управления школой</p>
			</div>
			
			<div class="features-grid">
				<div class="feature-card">
					<div class="feature-icon">📰</div>
					<h3>Новости и объявления</h3>
					<p>Актуальная информация о событиях в школе, объявления для учеников и родителей</p>
				</div>
				
				<div class="feature-card">
					<div class="feature-icon">👥</div>
					<h3>База учителей</h3>
					<p>Профили преподавателей с контактной информацией и специализациями</p>
				</div>
				
				<div class="feature-card">
					<div class="feature-icon">📅</div>
					<h3>Расписание занятий</h3>
					<p>Удобное отображение расписания с возможностью просмотра по дням и неделям</p>
				</div>
				
				<div class="feature-card">
					<div class="feature-icon">🏆</div>
					<h3>Доска почета</h3>
					<p>Достижения и награды учеников школы</p>
				</div>
				
				<div class="feature-card">
					<div class="feature-icon">🍽️</div>
					<h3>Меню столовой</h3>
					<p>Актуальное меню школьной столовой на каждый день</p>
				</div>
				
				<div class="feature-card">
					<div class="feature-icon">🎓</div>
					<h3>Информация о классах</h3>
					<p>Списки классов с информацией о классных руководителях</p>
				</div>
			</div>
			
			<div class="demo-cta">
				<p>Войдите в систему для просмотра информации конкретной школы</p>
				<a href="/login" class="demo-login-btn">
					🔐 Войти в систему
				</a>
			</div>
		</div>
	</section>
{:else}
	<!-- Новости -->
	{#if news.length > 0}
		<section id="news" class="content-section">
			<div class="section-container">
				<div class="section-header">
					<h2>📰 Последние новости</h2>
					<a href="/news" class="section-link">Все новости →</a>
				</div>
				<div class="cards-grid">
					{#each news as item}
						<DataCard
							{item}
							type="news"
							language={$languageStore}
							showActions={false}
						/>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Учителя -->
	{#if teachers.length > 0}
		<section id="teachers" class="content-section alt">
			<div class="section-container">
				<div class="section-header">
					<h2>👥 Наши учителя</h2>
					<a href="/teachers" class="section-link">Все учителя →</a>
				</div>
				<div class="cards-grid">
					{#each teachers as item}
						<DataCard
							{item}
							type="teacher"
							language={$languageStore}
							showActions={false}
						/>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Расписание -->
	{#if schedule.length > 0}
		<section id="schedule" class="content-section">
			<div class="section-container">
				<div class="section-header">
					<h2>📅 Расписание занятий</h2>
					<a href="/schedule" class="section-link">Полное расписание →</a>
				</div>
				<div class="schedule-preview">
					<Schedule 
						{schedule}
						showNavigation={false}
						showToday={true}
						on:itemClick={() => {}}
						on:dateSelect={() => {}}
						on:viewChange={() => {}}
					/>
				</div>
			</div>
		</section>
	{/if}

	<!-- Доска почета -->
	{#if honorBoard.length > 0}
		<section id="honor-board" class="content-section alt">
			<div class="section-container">
				<div class="section-header">
					<h2>🏆 Доска почета</h2>
					<a href="/honor-board" class="section-link">Все достижения →</a>
				</div>
				<div class="cards-grid">
					{#each honorBoard as item}
						<DataCard
							{item}
							type="honorBoard"
							language={$languageStore}
							showActions={false}
						/>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Меню столовой -->
	{#if canteenMenu.length > 0}
		<section id="canteen" class="content-section">
			<div class="section-container">
				<div class="section-header">
					<h2>🍽️ Меню столовой</h2>
					<a href="/canteen" class="section-link">Полное меню →</a>
				</div>
				<div class="cards-grid">
					{#each canteenMenu as item}
						<DataCard
							{item}
							type="canteen"
							language={$languageStore}
							showActions={false}
						/>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Классы -->
	{#if classes.length > 0}
		<section id="classes" class="content-section alt">
			<div class="section-container">
				<div class="section-header">
					<h2>🎓 Наши классы</h2>
					<a href="/classes" class="section-link">Все классы →</a>
				</div>
				<div class="classes-grid">
					{#each classes as classItem}
						<div class="class-card">
							<div class="class-number">{classItem.grade}{classItem.letter}</div>
							<div class="class-info">
								<p><strong>Учеников:</strong> {classItem.studentsCount || 'Не указано'}</p>
								{#if classItem.Teacher}
									<p><strong>Классный руководитель:</strong></p>
									<p class="class-teacher">
										{$languageStore === 'ru' ? classItem.Teacher.nameRu : classItem.Teacher.nameKz}
									</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}
{/if}

<style>
	/* Hero Section */
	.hero-section {
		position: relative;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.hero-background {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1;
	}

	.hero-bg-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: brightness(0.4) blur(1px);
	}

	.hero-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			135deg,
			hsl(var(--primary) / 0.8) 0%,
			hsl(var(--primary) / 0.4) 50%,
			hsl(var(--accent) / 0.6) 100%
		);
	}

	.hero-content {
		position: relative;
		z-index: 10;
		width: 100%;
		padding: 2rem 1rem;
	}

	.hero-container {
		max-width: 800px;
		margin: 0 auto;
		text-align: center;
		color: white;
	}

	.hero-logo {
		width: 120px;
		height: 120px;
		margin: 0 auto 2rem;
		border-radius: 50%;
		overflow: hidden;
		border: 4px solid white;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.hero-logo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.hero-logo-placeholder {
		width: 120px;
		height: 120px;
		margin: 0 auto 2rem;
		border-radius: 50%;
		background: hsl(var(--primary));
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 3rem;
		border: 4px solid white;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.hero-title {
		font-size: 3.5rem;
		font-weight: 700;
		margin-bottom: 1.5rem;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
		line-height: 1.1;
	}

	.hero-description {
		font-size: 1.25rem;
		margin-bottom: 1rem;
		opacity: 0.95;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	.hero-address {
		font-size: 1rem;
		margin-bottom: 2.5rem;
		opacity: 0.9;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
	}

	.hero-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: center;
		align-items: center;
	}

	.hero-nav-btn {
		background: rgba(255, 255, 255, 0.2);
		border: 2px solid rgba(255, 255, 255, 0.3);
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 2rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
	}

	.hero-nav-btn:hover {
		background: rgba(255, 255, 255, 0.3);
		border-color: rgba(255, 255, 255, 0.5);
		transform: translateY(-2px);
	}

	.hero-cta {
		background: hsl(var(--primary));
		color: white;
		padding: 1rem 2rem;
		border-radius: 2rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
	}

	.hero-cta:hover {
		background: hsl(var(--primary) / 0.9);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
	}

	/* Content Sections */
	.content-section {
		padding: 4rem 0;
	}

	.content-section.alt {
		background: hsl(var(--muted) / 0.3);
	}

	.section-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2.5rem;
	}

	.section-header h2 {
		font-size: 2.5rem;
		font-weight: 700;
		color: hsl(var(--foreground));
		margin: 0;
	}

	.section-link {
		color: hsl(var(--primary));
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s ease;
		font-size: 1.1rem;
	}

	.section-link:hover {
		color: hsl(var(--primary) / 0.8);
	}

	.cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 1.5rem;
	}

	.schedule-preview {
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 1rem;
		padding: 1.5rem;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
	}

	.classes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.class-card {
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 1rem;
		padding: 1.5rem;
		text-align: center;
		transition: all 0.3s ease;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
	}

	.class-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
	}

	.class-number {
		font-size: 2.5rem;
		font-weight: 700;
		color: hsl(var(--primary));
		margin-bottom: 1rem;
	}

	.class-info p {
		margin-bottom: 0.5rem;
		color: hsl(var(--muted-foreground));
		font-size: 0.875rem;
	}

	.class-teacher {
		color: hsl(var(--foreground)) !important;
		font-weight: 500 !important;
	}

	.loading-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 1rem;
		text-align: center;
	}

	.loading-section p {
		margin-top: 1rem;
		color: hsl(var(--muted-foreground));
		font-size: 1.1rem;
	}

	/* Demo Section для неавторизованных */
	.demo-section {
		padding: 4rem 0;
		background: hsl(var(--muted) / 0.3);
	}

	.demo-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.demo-header h2 {
		font-size: 2.5rem;
		font-weight: 700;
		color: hsl(var(--foreground));
		margin: 0 0 1rem 0;
	}

	.demo-subtitle {
		font-size: 1.25rem;
		color: hsl(var(--muted-foreground));
		margin: 0;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.feature-card {
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 1rem;
		padding: 2rem;
		text-align: center;
		transition: all 0.3s ease;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
	}

	.feature-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.feature-card h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		margin: 0 0 1rem 0;
	}

	.feature-card p {
		color: hsl(var(--muted-foreground));
		line-height: 1.6;
		margin: 0;
	}

	.demo-cta {
		text-align: center;
		padding: 2rem;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 1rem;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
	}

	.demo-cta p {
		font-size: 1.125rem;
		color: hsl(var(--muted-foreground));
		margin: 0 0 1.5rem 0;
	}

	.demo-login-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		padding: 1rem 2rem;
		border-radius: 2rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
		font-size: 1.125rem;
	}

	.demo-login-btn:hover {
		background: hsl(var(--primary) / 0.9);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.hero-title {
			font-size: 2.5rem;
		}

		.hero-description {
			font-size: 1.125rem;
		}

		.hero-nav {
			flex-direction: column;
			gap: 0.75rem;
		}

		.hero-nav-btn,
		.hero-cta {
			width: 100%;
			max-width: 280px;
		}

		.section-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.section-header h2 {
			font-size: 2rem;
		}

		.cards-grid {
			grid-template-columns: 1fr;
		}

		.classes-grid {
			grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		}

		.features-grid {
			grid-template-columns: 1fr;
		}

		.demo-header h2 {
			font-size: 2rem;
		}

		.demo-subtitle {
			font-size: 1.125rem;
		}
	}

	@media (max-width: 480px) {
		.hero-title {
			font-size: 2rem;
		}

		.hero-logo,
		.hero-logo-placeholder {
			width: 100px;
			height: 100px;
		}

		.hero-logo-placeholder {
			font-size: 2.5rem;
		}

		.content-section {
			padding: 3rem 0;
		}

		.demo-section {
			padding: 3rem 0;
		}

		.features-grid {
			gap: 1.5rem;
		}

		.feature-card {
			padding: 1.5rem;
		}

		.demo-cta {
			padding: 1.5rem;
		}
	}
</style>


