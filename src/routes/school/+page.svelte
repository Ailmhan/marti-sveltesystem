<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { languageStore } from '$lib/stores/language';
	import { apiClient } from '$lib/api/client';

	// Твой UI
	import DataCard from '$lib/components/DataCard.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import Schedule from '$lib/components/Schedule.svelte';

	import type {
		News,
		Teacher,
		HonorBoard,
		CanteenMenu,
		Schedule as ScheduleType,
		Class
	} from '$lib/types/api';

	// Состояния
	let news: News[] = [];
	let teachers: Teacher[] = [];
	let honorBoard: HonorBoard[] = [];
	let canteenMenu: CanteenMenu[] = [];
	let schedule: ScheduleType[] = [];
	let classes: Class[] = [];
	let loading = true;
	let error = '';

	// Для плавного появления
	let hydrated = false;

	onMount(async () => {
		hydrated = true;

		// Лог только в dev
		if (import.meta.env.DEV) {
			console.log('🏫 School Landing Page onMount:', {
				hasToken: !!$authStore.token,
				hasSchoolData: !!$authStore.schoolData,
				logoUrl: $authStore.schoolData?.logoUrl,
				schoolId: $authStore.schoolId
			});
		}

		await loadPreviewData();
	});

	async function loadPreviewData() {
		if (!$authStore.schoolId) {
			loading = false;
			return;
		}

		try {
			loading = true;
			error = '';

			const [
				newsData,
				teachersData,
				honorBoardData,
				canteenData,
				scheduleData,
				classesData
			] = await Promise.all([
				apiClient
					.getNews($authStore.schoolId)
					.then((data) => data.slice(0, 3))
					.catch(() => []),
				apiClient
					.getTeachers($authStore.schoolId)
					.then((data) => data.slice(0, 4))
					.catch(() => []),
				apiClient
					.getHonorBoard($authStore.schoolId)
					.then((data) => data.slice(0, 3))
					.catch(() => []),
				apiClient
					.getCanteenMenu($authStore.schoolId)
					.then((data) => data.slice(0, 2))
					.catch(() => []),
				apiClient
					.getSchedule($authStore.schoolId)
					.then((data) => {
						console.log('Raw schedule data:', data);
						
						// Фильтруем по сегодняшнему и завтрашнему дню
						const today = new Date();
						const tomorrow = new Date(today);
						tomorrow.setDate(today.getDate() + 1);
						
						const filteredData = data
							.filter((item) => {
								const itemDate = new Date(item.date);
								return (
									itemDate.toDateString() === today.toDateString() ||
									itemDate.toDateString() === tomorrow.toDateString()
								);
							})
							.slice(0, 10);
						
						console.log('Filtered schedule data:', filteredData);
						return filteredData;
					})
					.catch((error) => {
						console.error('Schedule API error:', error);
						return [];
					}),
				apiClient
					.getClasses($authStore.schoolId)
					.then((data) => data.slice(0, 6))
					.catch(() => [])
			]);

			news = newsData;
			teachers = teachersData;
			honorBoard = honorBoardData;
			canteenMenu = canteenData;
			schedule = scheduleData;
			classes = classesData;
		} catch (e) {
			error = 'Ошибка загрузки данных';
			console.error('Landing load error', e);
		} finally {
			loading = false;
		}
	}

	// Вспомогательные геттеры
	$: schoolName =
		$authStore.schoolData &&
		(($languageStore === 'ru'
			? $authStore.schoolData.nameRu
			: $authStore.schoolData.nameKz) ||
			'Школьная система');

	$: schoolLead =
		$authStore.schoolData &&
		(($languageStore === 'ru'
			? $authStore.schoolData.descriptionRu
			: $authStore.schoolData.descriptionKz) ||
			($languageStore === 'ru'
				? $authStore.schoolData.addressRu
				: $authStore.schoolData.addressKz) ||
			'Добро пожаловать в нашу школу');

	$: schoolAddress =
		$languageStore === 'ru' ? $authStore.schoolData?.addressRu : $authStore.schoolData?.addressKz;

	// Архитектурная мелочь: формируем src для hero фоновой картинки
	$: heroBg = $authStore.schoolData?.logoUrl || '';

	// Статистика для отображения
	$: stats = {
		teachers: teachers.length,
		news: news.length,
		achievements: honorBoard.length,
		classes: classes.length
	};
</script>

<svelte:head>
	<title>{schoolName || 'Лендинг школы'}</title>
	<meta name="description" content={schoolLead || 'Добро пожаловать в нашу школу'} />
</svelte:head>

<div class="page {hydrated ? 'is-hydrated' : ''}">
	<!-- HERO -->
	<section class="hero" aria-labelledby="hero-title">
		<!-- фон-картинка только если есть, без blur-мыла; подложка с градиентом всегда -->
		{#if heroBg}
			<div
				class="hero__bg"
				style="background-image: image-set(
					url('{$authStore.schoolData.logoUrl}') 1x
				)"
				role="img"
				aria-label={schoolName}
			/>
		{/if}
		<div class="hero__overlay" />
		<div class="hero__container container">
			<div class="hero__panel">
				<h1 id="hero-title" class="hero__title">{schoolName}</h1>
				<p class="hero__subtitle">{schoolLead}</p>
				{#if schoolAddress}
					<div class="hero__meta">
						<span class="hero__meta-icon">📍</span>
						{schoolAddress}
					</div>
				{/if}
				
				<!-- Статистика школы -->
				{#if $authStore.schoolId && !loading}
					<div class="hero__stats">
						<div class="stat-item">
							<span class="stat-number">{stats.teachers}</span>
							<span class="stat-label">Учителей</span>
						</div>
						<div class="stat-item">
							<span class="stat-number">{stats.classes}</span>
							<span class="stat-label">Классов</span>
						</div>
						<div class="stat-item">
							<span class="stat-number">{stats.achievements}</span>
							<span class="stat-label">Достижений</span>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</section>

	<!-- БЫСТРЫЕ ДЕЙСТВИЯ -->
	<section class="section section--muted">
		<div class="container">
			<header class="section__head">
				<h2 class="section__title">Быстрый доступ</h2>
				<p class="section__subtitle">Основные разделы системы</p>
			</header>

			<div class="actions">
				<a href="/news" class="action" aria-label="Перейти в новости">
					<span class="action__icon">📰</span>
					<span class="action__title">Новости</span>
					<span class="action__desc">События и объявления</span>
					{#if stats.news > 0}
						<span class="action__badge">{stats.news}</span>
					{/if}
				</a>

				<a href="/teachers" class="action" aria-label="Перейти к учителям">
					<span class="action__icon">👥</span>
					<span class="action__title">Учителя</span>
					<span class="action__desc">Педагогический состав</span>
					{#if stats.teachers > 0}
						<span class="action__badge">{stats.teachers}</span>
					{/if}
				</a>

				<a href="/schedule" class="action" aria-label="Открыть расписание">
					<span class="action__icon">📅</span>
					<span class="action__title">Расписание</span>
					<span class="action__desc">Уроки и мероприятия</span>
				</a>

				<a href="/" class="action" aria-label="Перейти в систему">
					<span class="action__icon">🏠</span>
					<span class="action__title">Панель</span>
					<span class="action__desc">Основная система</span>
				</a>
			</div>
		</div>
	</section>

	<!-- ПРЕВЬЮ БЛОКИ -->
	{#if $authStore.schoolId}
		{#if error}
			<section class="section">
				<div class="container">
					<div class="error-message">
						<span class="error-icon">⚠️</span>
						<h3>Ошибка загрузки данных</h3>
						<p>{error}</p>
						<button class="btn btn-retry" on:click={loadPreviewData}>
							Попробовать снова
						</button>
					</div>
				</div>
			</section>
		{:else}
			<!-- NEWS -->
			<section class="section">
				<div class="container">
					<header class="section__head">
						<h2 class="section__title">Последние новости</h2>
						<a href="/news" class="link">Все новости →</a>
					</header>

					{#if loading}
						<div class="grid grid--cards">
							{#each Array(3) as _}
								<div class="skeleton skeleton--card" />
							{/each}
						</div>
					{:else if news.length > 0}
						<div class="grid grid--cards">
							{#each news as item}
								<DataCard 
									data={item} 
									type="news" 
									language={$languageStore}
									showActions={false} 
								/>
							{/each}
						</div>
					{:else}
						<div class="empty">
							<span class="empty-icon">📰</span>
							<h3>Пока нет новостей</h3>
							<p>Новости появятся в ближайшее время</p>
						</div>
					{/if}
				</div>
			</section>

			<!-- TEACHERS -->
			<section class="section section--alt">
				<div class="container">
					<header class="section__head">
						<h2 class="section__title">Наши учителя</h2>
						<a href="/teachers" class="link">Все учителя →</a>
					</header>

					{#if loading}
						<div class="grid grid--cards">
							{#each Array(4) as _}
								<div class="skeleton skeleton--card" />
							{/each}
						</div>
					{:else if teachers.length > 0}
						<div class="grid grid--cards">
							{#each teachers as item}
								<DataCard 
									data={item} 
									type="teacher" 
									language={$languageStore}
									showActions={false} 
								/>
							{/each}
						</div>
					{:else}
						<div class="empty">
							<span class="empty-icon">👥</span>
							<h3>Список учителей скоро появится</h3>
							<p>Информация о педагогах обновится позже</p>
						</div>
					{/if}
				</div>
			</section>

			<!-- HONOR BOARD -->
			<section class="section">
				<div class="container">
					<header class="section__head">
						<h2 class="section__title">Доска почёта</h2>
						<a href="/honor-board" class="link">Все достижения →</a>
					</header>

					{#if loading}
						<div class="grid grid--cards">
							{#each Array(3) as _}
								<div class="skeleton skeleton--card" />
							{/each}
						</div>
					{:else if honorBoard.length > 0}
						<div class="grid grid--cards">
							{#each honorBoard as item}
								<DataCard 
									data={item} 
									type="honor-board" 
									language={$languageStore}
									showActions={false} 
								/>
							{/each}
						</div>
					{:else}
						<div class="empty">
							<span class="empty-icon">🏆</span>
							<h3>Пока нет наград</h3>
							<p>Достижения учеников появятся позже</p>
						</div>
					{/if}
				</div>
			</section>

			<!-- SCHEDULE -->
			<section class="section section--alt">
				<div class="container">
					<header class="section__head">
						<h2 class="section__title">Ближайшее расписание</h2>
						<a href="/schedule" class="link">Полное расписание →</a>
					</header>

					{#if loading}
						<div class="skeleton skeleton--table" />
					{:else if schedule.length > 0}
						<!-- Отладочная информация -->
						{#if import.meta.env.DEV}
							<div class="debug-info" style="background: #f0f0f0; padding: 1rem; margin-bottom: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 0.8rem;">
								<strong>DEBUG Schedule:</strong><br>
								Количество элементов: {schedule.length}<br>
								Первый элемент: {schedule[0] ? `${schedule[0].subjectRu || schedule[0].subjectKz} (${schedule[0].date})` : 'Нет данных'}
							</div>
						{/if}
						
						<Schedule schedule={schedule} />
					{:else}
						<div class="empty">
							<span class="empty-icon">📅</span>
							<h3>Нет занятий на ближайшие даты</h3>
							<p>Расписание обновится позже</p>
						</div>
					{/if}
				</div>
			</section>

			<!-- CANTEEN -->
			<section class="section">
				<div class="container">
					<header class="section__head">
						<h2 class="section__title">Меню столовой</h2>
						<a href="/canteen" class="link">Полное меню →</a>
					</header>

					{#if loading}
						<div class="grid grid--cards">
							{#each Array(2) as _}
								<div class="skeleton skeleton--card" />
							{/each}
						</div>
					{:else if canteenMenu.length > 0}
						<div class="grid grid--cards">
							{#each canteenMenu as item}
								<DataCard 
									data={item} 
									type="canteen" 
									language={$languageStore}
									showActions={false} 
								/>
							{/each}
						</div>
					{:else}
						<div class="empty">
							<span class="empty-icon">🍽️</span>
							<h3>Меню обновится позже</h3>
							<p>Информация о питании появится в ближайшее время</p>
						</div>
					{/if}
				</div>
			</section>
		{/if}
	{:else}
		<section class="section">
			<div class="container">
				<div class="welcome-section">
					<span class="welcome-icon">🏫</span>
					<h2 class="welcome-title">Добро пожаловать!</h2>
					<p class="welcome-text">Чтобы увидеть информацию о школе, войдите в систему.</p>
					<a href="/" class="btn btn-primary">Перейти в систему</a>
				</div>
			</div>
		</section>
	{/if}
</div>

<style>
	:root {
		/* аккуратная палитра под твой стиль: синий/белый с зелёным акцентом */
		--c-bg: hsl(var(--background));
		--c-fg: hsl(var(--foreground));
		--c-muted: hsl(var(--muted-foreground));
		--c-card: hsl(var(--card));
		--c-border: hsl(var(--border));
		--c-primary: hsl(var(--primary));
		--c-primary-fg: hsl(var(--primary-foreground));
		--radius: 16px;
	}

	/* Базовая сетка */
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 20px;
	}

	.page {
		background: var(--c-bg);
		color: var(--c-fg);
	}

	/* HERO */
	.hero {
		position: relative;
		min-height: clamp(420px, 52vh, 600px);
		display: grid;
		place-items: center;
		overflow: clip;
		isolation: isolate;
	}

	.hero__bg {
		position: absolute;
		inset: 0;
		background-size: cover;
		background-position: center;
		transform: scale(1.02); /* лёгкий параллакс без blur */
	}

	.hero__overlay {
		position: absolute;
		inset: 0;
		background: radial-gradient(120% 90% at 50% 10%, rgba(0,0,0,.35), rgba(0,0,0,.62) 70%, rgba(0,0,0,.75));
		pointer-events: none;
	}

	.hero__container {
		position: relative;
		z-index: 1;
		width: 100%;
	}

	.hero__panel {
		margin-inline: auto;
		max-width: 820px;
		padding: clamp(20px, 4vw, 36px);
		background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.02));
		-webkit-backdrop-filter: saturate(1.3) blur(10px);
		backdrop-filter: saturate(1.3) blur(10px);
		border: 1px solid rgba(255,255,255,.16);
		border-radius: calc(var(--radius) + 8px);
		color: white;
		box-shadow: 0 20px 60px rgba(0,0,0,.25);
		transition: transform .35s ease;
	}

	@media (hover:hover) {
		.hero__panel:hover { transform: translateY(-2px); }
	}

	.hero__title {
		font-size: clamp(28px, 5vw, 42px);
		font-weight: 800;
		line-height: 1.1;
		margin: 0 0 10px;
		letter-spacing: .2px;
		text-wrap: balance;
	}

	.hero__subtitle {
		font-size: clamp(14px, 2.2vw, 18px);
		opacity: .95;
		margin: 0 0 12px;
		text-wrap: pretty;
	}

	.hero__meta {
		font-size: 15px;
		opacity: .85;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.hero__meta-icon {
		font-size: 1.1em;
	}

	.hero__stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(255,255,255,.2);
	}

	.stat-item {
		text-align: center;
	}

	.stat-number {
		display: block;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--c-primary);
	}

	.stat-label {
		font-size: 0.8rem;
		opacity: 0.8;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* СЕКЦИИ */
	.section {
		padding: clamp(36px, 6vw, 64px) 0;
		border-top: 1px solid var(--c-border);
	}

	.section:first-of-type { border-top: none; }

	.section--muted {
		background: var(--c-card);
	}

	.section--alt {
		background: color-mix(in oklab, var(--c-card), white 8%);
	}

	.section__head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: clamp(18px, 3vw, 28px);
	}

	.section__title {
		font-size: clamp(22px, 3.6vw, 28px);
		font-weight: 700;
		margin: 0;
	}

	.section__subtitle {
		color: var(--c-muted);
		font-size: 0.9rem;
		margin: 0;
	}

	.link {
		color: var(--c-primary);
		text-decoration: none;
		font-weight: 600;
		transition: opacity .2s ease;
	}
	.link:hover, .link:focus-visible { opacity: .8; outline: none; }

	/* ACTIONS */
	.actions {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 16px;
	}

	.action {
		display: grid;
		align-content: start;
		gap: 8px;
		padding: 18px;
		background: var(--c-bg);
		border: 1px solid var(--c-border);
		border-radius: var(--radius);
		text-decoration: none;
		color: inherit;
		box-shadow: 0 6px 24px rgba(0,0,0,.06);
		transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
		position: relative;
	}
	.action:focus-visible { outline: 2px solid var(--c-primary); outline-offset: 2px; }
	@media (hover:hover) {
		.action:hover {
			transform: translateY(-2px);
			border-color: var(--c-primary);
			box-shadow: 0 10px 26px rgba(0,0,0,.08);
		}
	}

	.action__icon {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.action__title {
		font-weight: 700;
		font-size: 16px;
	}
	.action__desc {
		color: var(--c-muted);
		font-size: 14px;
	}

	.action__badge {
		position: absolute;
		top: 12px;
		right: 12px;
		background: var(--c-primary);
		color: var(--c-primary-fg);
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		min-width: 1.5rem;
		text-align: center;
	}

	/* GRID */
	.grid {
		display: grid;
		gap: 16px;
	}
	.grid--cards {
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	}

	/* ЭЛЕМЕНТЫ */
	.btn {
		display: inline-block;
		background: var(--c-primary);
		color: var(--c-primary-fg);
		text-decoration: none;
		border-radius: 12px;
		padding: 10px 16px;
		font-weight: 600;
		transition: transform .15s ease, opacity .15s ease;
		border: none;
		cursor: pointer;
		font-size: 0.9rem;
	}
	.btn:hover { transform: translateY(-1px); }
	.btn:focus-visible { outline: 2px solid var(--c-primary); outline-offset: 3px; }

	.btn-primary {
		background: var(--c-primary);
		color: var(--c-primary-fg);
	}

	.btn-retry {
		background: var(--c-primary);
		color: var(--c-primary-fg);
		margin-top: 1rem;
	}

	.lead { color: var(--c-muted); margin: 8px 0 16px; }

	.empty {
		border: 1px dashed var(--c-border);
		border-radius: var(--radius);
		padding: 2rem;
		text-align: center;
		color: var(--c-muted);
		background: var(--c-bg);
	}

	.empty-icon {
		font-size: 2rem;
		display: block;
		margin-bottom: 1rem;
	}

	.empty h3 {
		margin: 0 0 0.5rem;
		font-size: 1.1rem;
		font-weight: 600;
	}

	.empty p {
		margin: 0;
		font-size: 0.9rem;
		opacity: 0.8;
	}

	.welcome-section {
		text-align: center;
		padding: 3rem 1rem;
	}

	.welcome-icon {
		font-size: 3rem;
		display: block;
		margin-bottom: 1rem;
	}

	.welcome-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 1rem;
	}

	.welcome-text {
		color: var(--c-muted);
		margin: 0 0 1.5rem;
		font-size: 1rem;
	}

	.error-message {
		text-align: center;
		padding: 2rem;
		border: 1px solid hsl(var(--destructive) / 0.2);
		border-radius: var(--radius);
		background: hsl(var(--destructive) / 0.05);
	}

	.error-icon {
		font-size: 2rem;
		display: block;
		margin-bottom: 1rem;
	}

	.error-message h3 {
		margin: 0 0 0.5rem;
		color: hsl(var(--destructive));
	}

	.error-message p {
		margin: 0;
		color: var(--c-muted);
	}

	/* SKELETONS */
	@keyframes pulse {
		0% { opacity: .6; }
		50% { opacity: .35; }
		100% { opacity: .6; }
	}
	.skeleton {
		border-radius: var(--radius);
		background:
			linear-gradient(90deg, rgba(0,0,0,.04), rgba(0,0,0,.07), rgba(0,0,0,.04));
		animation: pulse 1.6s ease-in-out infinite;
	}
	.skeleton--card { height: 220px; }
	.skeleton--table { height: 260px; }

	/* АДАПТИВ */
	@media (max-width: 768px) {
		.container { padding: 0 14px; }
		
		.hero__stats {
			grid-template-columns: repeat(3, 1fr);
			gap: 0.5rem;
		}

		.stat-number {
			font-size: 1.2rem;
		}

		.stat-label {
			font-size: 0.7rem;
		}

		.section__head {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}
	}

	@media (max-width: 480px) {
		.hero__stats {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.actions {
			grid-template-columns: 1fr;
		}
	}

	/* Предпочтение пользователя по анимации */
	@media (prefers-reduced-motion: reduce) {
		* { transition: none !important; animation: none !important; }
	}

	/* Плавное появление страницы */
	.page { opacity: 0; transform: translateY(6px); transition: opacity .25s ease, transform .25s ease; }
	.page.is-hydrated { opacity: 1; transform: translateY(0); }
</style>
