<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import { authStore } from '$lib/stores/auth';
	import { languageStore } from '$lib/stores/language';
	import type { 
		News, 
		Teacher, 
		HonorBoard, 
		Section, 
		CanteenMenu, 
		Schedule, 
		Class,
		School 
	} from '$lib/types/api';
	import DataCard from '$lib/components/DataCard.svelte';
	import LanguageSwitch from '$lib/components/LanguageSwitch.svelte';

	// Состояние компонента
	let mounted = false;

	let isMobileMenuOpen = $state(false);
	let loading = $state(true);
	let currentNewsIndex = 0;

	// Данные из API
	let schoolData = $state<School | null>(null);
	let news = $state<News[]>([]);
	let teachers = $state<Teacher[]>([]);
	let honorBoard = $state<HonorBoard[]>([]);
	let sections = $state<Section[]>([]);
	let canteenMenu = $state<CanteenMenu[]>([]);
	let schedule = $state<Schedule[]>([]);
	let classes = $state<Class[]>([]);

	// Статистика школы
	let schoolStats = $state([
		{ label: "Учеников", value: "0+", icon: "👥" },
		{ label: "Учителей", value: "0+", icon: "👨‍🏫" },
		{ label: "Лет опыта", value: "0+", icon: "📚" },
		{ label: "Наград", value: "0+", icon: "🏆" }
	]);

	onMount(() => {
		mounted = true;
		
		// Загружаем данные школы и все необходимые данные
		loadAllData();
		
		// Симуляция загрузки для плавности
		const timer = setTimeout(() => loading = false, 1000);
		
		// Авто-ротация новостей
		const newsTimer = setInterval(() => {
			if (news.length > 0) {
				currentNewsIndex = (currentNewsIndex + 1) % news.length;
			}
		}, 5000);
		
		// Очистка таймеров
		return () => {
			clearTimeout(timer);
			clearInterval(newsTimer);
		};
	});

	// Загружаем все данные
	async function loadAllData() {
		try {
			// Загружаем данные школы через authStore
			if (!$authStore.schoolId) {
				await authStore.loadSchoolData();
			}

			if ($authStore.schoolId) {
				// Загружаем все данные параллельно
				const [
					schoolDataResult,
					newsData,
					teachersData,
					honorBoardData,
					sectionsData,
					canteenMenuData,
					scheduleData,
					classesData
				] = await Promise.all([
					apiClient.getSchool($authStore.schoolId),
					apiClient.getNews($authStore.schoolId),
					apiClient.getTeachers($authStore.schoolId),
					apiClient.getHonorBoard($authStore.schoolId),
					apiClient.getSections($authStore.schoolId),
					apiClient.getCanteenMenu($authStore.schoolId),
					apiClient.getSchedule($authStore.schoolId),
					apiClient.getClasses($authStore.schoolId)
				]);

				// Обновляем состояние
				schoolData = schoolDataResult;
				news = newsData;
				teachers = teachersData;
				honorBoard = honorBoardData;
				sections = sectionsData;
				canteenMenu = canteenMenuData;
				schedule = scheduleData;
				classes = classesData;

				// Обновляем статистику на основе реальных данных
				updateSchoolStats();
			}
		} catch (error) {
			console.error('Error loading data:', error);
		}
	}

	// Обновляем статистику школы на основе реальных данных
	function updateSchoolStats() {
		schoolStats = [
			{ 
				label: "Учеников", 
				value: `${classes.length * 25}+`, 
				icon: "👥" 
			},
			{ 
				label: "Учителей", 
				value: `${teachers.length}+`, 
				icon: "👨‍🏫" 
			},
			{ 
				label: "Лет опыта", 
				value: "25+", 
				icon: "📚" 
			},
			{ 
				label: "Наград", 
				value: `${honorBoard.length}+`, 
				icon: "🏆" 
			}
		];
	}



	function scrollToSection(sectionId: string) {
		document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
		isMobileMenuOpen = false;
	}

	// Получаем текущую дату
	let currentDate = new Date().toLocaleDateString("ru-RU", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	// Получаем язык из store
	let currentLanguage = $derived($languageStore);
</script>

<div class="min-h-screen transition-colors duration-300">
	<!-- Navigation -->
	<nav class="fixed top-0 left-0 right-0 z-50 bg-white/20 backdrop-blur-md border-b border-white/20 shadow-sm">
		<div class="container mx-auto px-4">
			<div class="flex items-center justify-between h-16">
				<!-- Logo -->
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center animate-glow overflow-hidden">
						{#if schoolData?.schoolEmblem}
							<img src={schoolData.schoolEmblem} alt="Эмблема школы" class="w-8 h-8 object-contain" />
						{:else if schoolData?.logoUrl}
							<img src={schoolData.logoUrl} alt="Logo" class="w-8 h-8 object-cover rounded" />
						{:else}
							<span class="text-white font-bold text-lg">🎓</span>
						{/if}
					</div>
					<span class="text-xl font-bold text-white">
						{schoolData ? (currentLanguage === 'kz' ? schoolData.nameKz : schoolData.nameRu) : 'Школа'}
					</span>
				</div>
				


				<!-- Desktop Menu -->
				<div class="hidden md:flex items-center gap-8">
					<button onclick={() => scrollToSection('news')} class="text-white hover:text-blue-200 transition-colors font-medium">
						Новости
					</button>
					<button onclick={() => scrollToSection('teachers')} class="text-white hover:text-blue-200 transition-colors font-medium">
						Учителя
					</button>
					<button onclick={() => scrollToSection('achievements')} class="text-white hover:text-blue-200 transition-colors font-medium">
						Достижения
					</button>
					<button onclick={() => scrollToSection('schedule')} class="text-white hover:text-blue-200 transition-colors font-medium">
						Расписание
					</button>
					<button onclick={() => scrollToSection('contact')} class="text-white hover:text-blue-200 transition-colors font-medium">
						Контакты
					</button>
				</div>

				<!-- Language Switch & Mobile Menu -->
				<div class="flex items-center gap-4">
					<LanguageSwitch 
						language={currentLanguage === 'kz' ? 'kz' : 'ru'} 
						on:change={(e) => $languageStore = e.detail}
					/>

					<button 
						onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
						class="md:hidden w-9 h-9 rounded-md border border-border bg-card hover:bg-accent transition-colors flex items-center justify-center"
					>
						{#if isMobileMenuOpen}
							<span class="text-lg">✕</span>
						{:else}
							<span class="text-lg">☰</span>
						{/if}
					</button>
				</div>
			</div>

			<!-- Mobile Menu -->
			{#if isMobileMenuOpen}
				<div class="md:hidden py-4 border-t border-white/20 bg-white/10 backdrop-blur-sm">
					<div class="flex flex-col gap-4">
						<button onclick={() => scrollToSection('news')} class="text-left text-white hover:text-blue-200 transition-colors font-medium">
							Новости
						</button>
						<button onclick={() => scrollToSection('teachers')} class="text-left text-white hover:text-blue-200 transition-colors font-medium">
							Учителя
						</button>
						<button onclick={() => scrollToSection('achievements')} class="text-left text-white hover:text-blue-200 transition-colors font-medium">
							Достижения
						</button>
						<button onclick={() => scrollToSection('schedule')} class="text-left text-white hover:text-blue-200 transition-colors font-medium">
							Расписание
						</button>
						<button onclick={() => scrollToSection('contact')} class="text-left text-white hover:text-blue-200 transition-colors font-medium">
							Контакты
						</button>
					</div>
				</div>
			{/if}
		</div>
	</nav>

	<!-- Hero Section -->
	<section class="hero-section relative overflow-hidden text-white pt-16 min-h-screen">
		<!-- Фон школы -->
		{#if schoolData?.logoUrl}
			<div class="absolute inset-0 overflow-hidden">
				<div class="w-full h-full hero-background" style="background-image: url({schoolData.logoUrl});"></div>
			</div>
		{:else}
			<!-- Fallback background when no image -->
			<div class="absolute inset-0 bg-neutral-200 dark:bg-neutral-800"></div>
		{/if}
		

		
		<!-- Animated Background Elements (убрано для чистого фото) -->

		<div class="relative container mx-auto px-4 py-96 text-center">
			<div class="mx-auto max-w-4xl">
				<!-- Loading state -->
				{#if loading}
					<div class="mb-8 inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-full backdrop-blur-sm animate-pulse">
						<span class="text-4xl">⏳</span>
					</div>
					<h1 class="mb-6 text-5xl md:text-7xl font-bold tracking-tight animate-pulse">
						Загрузка...
					</h1>
				{:else}
					<!-- School Icon -->
					<div class="mb-8 inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-full backdrop-blur-sm animate-bounce overflow-hidden">
						{#if schoolData?.schoolEmblem}
							<img src={schoolData.schoolEmblem} alt="Эмблема школы" class="w-16 h-16 object-contain" />
						{:else if schoolData?.logoUrl}
							<img src={schoolData.logoUrl} alt="School Logo" class="w-16 h-16 rounded-full object-cover" />
						{:else}
							<span class="text-4xl">🎓</span>
						{/if}
					</div>

					<h1 class="mb-6 text-5xl md:text-7xl font-bold tracking-tight">
						{schoolData ? (currentLanguage === 'kz' ? schoolData.nameKz : schoolData.nameRu) : 'Школа'}
					</h1>
					<p class="mb-8 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
						{schoolData?.descriptionRu || 'Современное образование для будущих лидеров. Развиваем таланты, воспитываем характер, строим будущее вместе.'}
					</p>

					<div class="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
						{#if schoolData?.addressRu}
							<div class="flex items-center gap-2 text-white/90 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
								<span class="text-lg">📍</span>
								<span>{currentLanguage === 'kz' ? schoolData.addressKz : schoolData.addressRu}</span>
							</div>
						{/if}

						<a href="/login" class="bg-white text-primary hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-lg px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
							Войти в систему
							<span class="text-lg">→</span>
						</a>
					</div>


				{/if}
			</div>
		</div>
	</section>

	<!-- News Section -->
	<section id="news" class="py-20 bg-muted/30">
		<div class="container mx-auto px-4">
			<div class="text-center mb-16">
				<h2 class="text-4xl font-bold text-foreground mb-4">Последние новости</h2>
				<p class="text-muted-foreground max-w-2xl mx-auto text-lg">
					Следите за важными событиями и достижениями нашей школы
				</p>
			</div>

			{#if loading}
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{#each Array(6) as _, i}
						<div class="animate-pulse">
							<div class="bg-muted h-48 rounded-t-lg"></div>
							<div class="bg-card p-6 rounded-b-lg border border-border">
								<div class="h-4 bg-muted rounded mb-2"></div>
								<div class="h-4 bg-muted rounded mb-4"></div>
								<div class="h-3 bg-muted rounded"></div>
							</div>
						</div>
					{/each}
				</div>
			{:else if news.length > 0}
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{#each news as item}
						<DataCard 
							data={item} 
							type="news" 
							language={currentLanguage}
							class="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
						/>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<p class="text-muted-foreground text-lg">Новости пока не добавлены</p>
				</div>
			{/if}
		</div>
	</section>

	<!-- Teachers Section -->
	<section id="teachers" class="py-20 bg-background">
		<div class="container mx-auto px-4">
			<div class="text-center mb-16">
				<h2 class="text-4xl font-bold text-foreground mb-4">Наши учителя</h2>
				<p class="text-muted-foreground max-w-2xl mx-auto text-lg">
					Опытные педагоги, которые вдохновляют и направляют наших учеников к успеху
				</p>
			</div>

			{#if loading}
				<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
					{#each Array(8) as _, i}
						<div class="animate-pulse">
							<div class="bg-muted h-48 rounded-t-lg"></div>
							<div class="bg-card p-6 rounded-b-lg border border-border">
								<div class="h-4 bg-muted rounded mb-2"></div>
								<div class="h-4 bg-muted rounded mb-4"></div>
								<div class="h-3 bg-muted rounded"></div>
							</div>
						</div>
					{/each}
				</div>
			{:else if teachers.length > 0}
				<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
					{#each teachers as teacher}
						<DataCard 
							data={teacher} 
							type="teacher" 
							language={currentLanguage}
							class="text-center group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
						/>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<p class="text-muted-foreground text-lg">Информация об учителях пока не добавлена</p>
				</div>
			{/if}
		</div>
	</section>

	<!-- Achievements Section -->
	<section id="achievements" class="py-20 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
		<div class="container mx-auto px-4">
			<div class="text-center mb-16">
				<h2 class="text-4xl font-bold text-foreground mb-4">Достижения учеников</h2>
				<p class="text-muted-foreground max-w-2xl mx-auto text-lg">
					Гордимся успехами наших талантливых учеников и их выдающимися результатами
				</p>
			</div>

			{#if loading}
				<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
					{#each Array(8) as _, i}
						<div class="animate-pulse">
							<div class="bg-muted h-48 rounded-t-lg"></div>
							<div class="bg-card p-6 rounded-b-lg border border-border">
								<div class="h-4 bg-muted rounded mb-2"></div>
								<div class="h-4 bg-muted rounded mb-4"></div>
								<div class="h-3 bg-muted rounded"></div>
							</div>
						</div>
					{/each}
				</div>
			{:else if honorBoard.length > 0}
				<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
					{#each honorBoard as achievement}
						<DataCard 
							data={achievement} 
							type="honor-board" 
							language={currentLanguage}
							class="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
						/>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<p class="text-muted-foreground text-lg">Информация о достижениях пока не добавлена</p>
				</div>
			{/if}
		</div>
	</section>

	<!-- Schedule Section -->
	<section id="schedule" class="py-20 bg-background">
		<div class="container mx-auto px-4">
			<div class="text-center mb-16">
				<h2 class="text-4xl font-bold text-foreground mb-4">Расписание на сегодня</h2>
				<p class="text-muted-foreground max-w-2xl mx-auto text-lg">
					Актуальное расписание занятий на сегодняшний день
				</p>
			</div>

			{#if loading}
				<div class="max-w-4xl mx-auto">
					<div class="overflow-hidden bg-card border border-border rounded-lg shadow-lg">
						<div class="bg-primary/10 p-6 border-b border-border">
							<h3 class="flex items-center gap-2 text-xl font-semibold text-card-foreground">
								<span class="text-2xl">📅</span>
								{currentDate}
							</h3>
						</div>
						
						<div class="divide-y divide-border">
							{#each Array(6) as _, i}
								<div class="p-6 animate-pulse">
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-6">
											<div class="h-8 w-20 bg-muted rounded"></div>
											<div>
												<div class="h-5 w-32 bg-muted rounded mb-2"></div>
												<div class="h-4 w-24 bg-muted rounded"></div>
											</div>
										</div>
										<div class="h-6 w-16 bg-muted rounded"></div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{:else if schedule.length > 0}
				<div class="max-w-4xl mx-auto">
					<div class="overflow-hidden bg-card border border-border rounded-lg shadow-lg">
						<div class="bg-primary/10 p-6 border-b border-border">
							<h3 class="flex items-center gap-2 text-xl font-semibold text-card-foreground">
								<span class="text-2xl">📅</span>
								{currentDate}
							</h3>
						</div>
						
						<div class="divide-y divide-border">
							{#each schedule.filter((item, index, arr) => 
								arr.findIndex(s => s.startTime === item.startTime && 
								(currentLanguage === 'kz' ? s.subjectKz : s.subjectRu) === (currentLanguage === 'kz' ? item.subjectKz : item.subjectRu)) === index
							) as item, index}
								<div class="p-6 hover:bg-muted/50 transition-colors group">
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-6">
											<div class="text-2xl font-bold text-primary min-w-[80px] group-hover:scale-110 transition-transform">
												{item.startTime}
											</div>
											<div>
												<h4 class="font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors">
													{currentLanguage === 'kz' ? item.subjectKz : item.subjectRu}
												</h4>
												<p class="text-muted-foreground">
													{item.Teacher ? (currentLanguage === 'kz' ? item.Teacher.nameKz : item.Teacher.nameRu) : 'Учитель не указан'}
												</p>
											</div>
										</div>
										<div class="text-right">
											<span class="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm font-medium">
												{item.Class ? `Класс ${item.Class.grade}${item.Class.letter}` : 'Класс не указан'}
											</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{:else}
				<div class="text-center py-12">
					<p class="text-muted-foreground text-lg">Расписание пока не добавлено</p>
				</div>
			{/if}
		</div>
	</section>

	<!-- Canteen Menu Section -->
	<section class="py-20 bg-muted/30">
		<div class="container mx-auto px-4">
			<div class="text-center mb-16">
				<h2 class="text-4xl font-bold text-foreground mb-4">Меню столовой</h2>
				<p class="text-muted-foreground max-w-2xl mx-auto text-lg">
					Вкусное и полезное питание для наших учеников
				</p>
			</div>

			{#if loading}
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
					{#each Array(6) as _, i}
						<div class="animate-pulse">
							<div class="bg-muted h-48 rounded-t-lg"></div>
							<div class="bg-card p-6 rounded-b-lg border border-border">
								<div class="h-4 bg-muted rounded mb-2"></div>
								<div class="h-4 bg-muted rounded mb-4"></div>
								<div class="h-3 bg-muted rounded"></div>
							</div>
						</div>
					{/each}
				</div>
			{:else if canteenMenu.length > 0}
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
					{#each canteenMenu as item}
						<DataCard 
							data={item}
							type="canteen"
							language={currentLanguage}
							class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
						/>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<p class="text-muted-foreground text-lg">Меню столовой пока не добавлено</p>
				</div>
			{/if}
		</div>
	</section>

	<!-- Classes Section -->
	<section class="py-20 bg-background">
		<div class="container mx-auto px-4">
			<div class="text-center mb-16">
				<h2 class="text-4xl font-bold text-foreground mb-4">Наши классы</h2>
				<p class="text-muted-foreground max-w-2xl mx-auto text-lg">
					Информация о классах и классных руководителях
				</p>
			</div>

			{#if loading}
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each Array(9) as _, i}
						<div class="text-center animate-pulse bg-card border border-border rounded-lg p-6">
							<div class="w-16 h-16 bg-muted rounded-full mx-auto mb-4"></div>
							<div class="h-6 bg-muted rounded mb-2"></div>
							<div class="h-4 bg-muted rounded mb-4"></div>
							<div class="h-4 bg-muted rounded"></div>
						</div>
					{/each}
				</div>
			{:else if classes.length > 0}
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each classes as classItem}
						<div class="text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card border border-border rounded-lg p-6">
							<div class="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
								<span class="text-2xl font-bold text-green-600 dark:text-green-400">
									{classItem.grade}{classItem.letter}
								</span>
							</div>
							
							<h3 class="text-xl font-semibold text-card-foreground group-hover:text-green-600 transition-colors mb-2">
								{classItem.grade} класс "{classItem.letter}"
							</h3>
							
							<div class="space-y-2 mb-4">
								<div class="flex items-center justify-center gap-2 text-muted-foreground">
									<span>👥</span>
									<span>25 учеников</span>
	</div>
							</div>
							
							{#if classItem.Teacher}
								<p class="text-sm text-muted-foreground">
									Классный руководитель: <br>
									<span class="font-medium">{classItem.Teacher.nameRu}</span>
								</p>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<p class="text-muted-foreground text-lg">Информация о классах пока не добавлена</p>
				</div>
			{/if}
		</div>
	</section>

	<!-- Contact Section -->
	<section id="contact" class="py-20 bg-gradient-to-br from-slate-900 to-primary text-white">
		<div class="container mx-auto px-4">
			<div class="text-center mb-16">
				<h2 class="text-4xl font-bold mb-4">Свяжитесь с нами</h2>
				<p class="text-white/90 max-w-2xl mx-auto text-lg">
					Мы всегда готовы ответить на ваши вопросы и предоставить необходимую информацию
				</p>
			</div>

			<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
				{#if schoolData?.addressRu}
					<div class="text-center group">
						<div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform animate-glow">
							<span class="text-2xl">📍</span>
						</div>
						<h3 class="text-xl font-semibold mb-2">Адрес</h3>
						<p class="text-white/90">{currentLanguage === 'kz' ? schoolData.addressKz : schoolData.addressRu}</p>
					</div>
				{/if}

				<div class="text-center group">
					<div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform animate-glow" style="animation-delay: 0.5s;">
						<span class="text-2xl">📞</span>
					</div>
					<h3 class="text-xl font-semibold mb-2">Телефон</h3>
											<p class="text-white/90">+7 (727) 123-45-67</p>
				</div>

				{#if schoolData?.email}
					<div class="text-center group">
						<div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform animate-glow" style="animation-delay: 1s;">
							<span class="text-2xl">📧</span>
						</div>
						<h3 class="text-xl font-semibold mb-2">Email</h3>
						<p class="text-white/90">{schoolData.email}</p>
					</div>
				{/if}

				<div class="text-center group">
					<div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform animate-glow" style="animation-delay: 1.5s;">
						<span class="text-2xl">🕒</span>
					</div>
					<h3 class="text-xl font-semibold mb-2">Режим работы</h3>
											<p class="text-white/90">Пн-Пт: 8:00 - 18:00</p>
				</div>
			</div>

			<div class="text-center">
				<a href="/" class="inline-block bg-white text-primary hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-lg px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-3 mx-auto">
					<span class="text-2xl">🏆</span>
					Войти в систему
				</a>
			</div>
		</div>
	</section>
</div>

<style>
	/* Custom animations */
	@keyframes float {
		0%, 100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-20px);
		}
	}

	@keyframes glow {
		0%, 100% {
			box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
		}
		50% {
			box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
		}
	}

	.animate-float {
		animation: float 6s ease-in-out infinite;
	}

	.animate-glow {
		animation: glow 3s ease-in-out infinite;
	}

	/* Hero Section - Full Screen Height */
	.hero-section {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* High Quality Background Image */
	.hero-background {
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		background-attachment: fixed; /* Фиксированный фон для лучшего качества */
		image-rendering: -webkit-optimize-contrast; /* Улучшение контраста в WebKit */
		image-rendering: crisp-edges; /* Четкие края */
		image-rendering: pixelated; /* Пиксельная четкость */
		-webkit-backface-visibility: hidden; /* Предотвращение размытия */
		backface-visibility: hidden;
		transform: translateZ(0); /* Аппаратное ускорение */
		will-change: transform; /* Оптимизация производительности */
	}

	/* Responsive container */
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	/* CSS Variables for colors - Light theme by default */
	:root {
		--background: #ffffff;
		--foreground: #1f2937;
		--card: #ffffff;
		--card-foreground: #1f2937;
		--border: #e5e7eb;
		--muted: #f9fafb;
		--muted-foreground: #6b7280;
		--primary: #1e40af;
		--primary-foreground: #ffffff;
		--secondary: #3b82f6;
		--secondary-foreground: #ffffff;
		--accent: #3b82f6;
		--accent-foreground: #ffffff;
	}



	/* Responsive background quality for different screen densities */
	@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
		.hero-background {
			background-size: cover;
			image-rendering: -webkit-optimize-contrast;
			image-rendering: crisp-edges;
		}
	}

	@media (-webkit-min-device-pixel-ratio: 3), (min-resolution: 288dpi) {
		.hero-background {
			background-size: cover;
			image-rendering: -webkit-optimize-contrast;
			image-rendering: crisp-edges;
		}
	}

	/* Disable background-attachment: fixed on mobile for better performance */
	@media (max-width: 768px) {
		.hero-background {
			background-attachment: scroll;
		}
	}
</style>
