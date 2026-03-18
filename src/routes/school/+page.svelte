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
	import IllustratedEmptyState from '$lib/components/IllustratedEmptyState.svelte';
	import { BookOpen, Clock3, GraduationCap, LogIn, Mail, MapPin, Phone, ShieldCheck, Users } from 'lucide-svelte';

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
				}
			} catch (error) {
				console.error('Error loading data:', error);
			}
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
	const currentYear = new Date().getFullYear();

	// Получаем язык из store
	let currentLanguage = $derived($languageStore);
</script>

<div class="min-h-screen transition-colors duration-300">
	<!-- Navigation -->
	<nav class="top-nav fixed top-0 left-0 right-0 z-50 backdrop-blur-md">
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
								<GraduationCap class="w-5 h-5 text-white" />
							{/if}
						</div>
						<span class="text-xl font-bold text-foreground">
						{schoolData ? (currentLanguage === 'kz' ? schoolData.nameKz : schoolData.nameRu) : 'Школа'}
					</span>
				</div>
				


				<!-- Desktop Menu -->
				<div class="hidden md:flex items-center gap-8">
					<button onclick={() => scrollToSection('news')} class="menu-link">
						{currentLanguage === 'kz' ? 'Жаңалықтар' : 'Новости'}
					</button>
					<button onclick={() => scrollToSection('teachers')} class="menu-link">
						{currentLanguage === 'kz' ? 'Мұғалімдер' : 'Учителя'}
					</button>
					<button onclick={() => scrollToSection('achievements')} class="menu-link">
						{currentLanguage === 'kz' ? 'Жетістіктер' : 'Достижения'}
					</button>
					<button onclick={() => scrollToSection('schedule')} class="menu-link">
						{currentLanguage === 'kz' ? 'Кесте' : 'Расписание'}
					</button>
					<button onclick={() => scrollToSection('contact')} class="menu-link">
						{currentLanguage === 'kz' ? 'Байланыс' : 'Контакты'}
					</button>
				</div>

				<!-- Language Switch & Mobile Menu -->
				<div class="flex items-center gap-4">
					<LanguageSwitch 
						language={currentLanguage === 'kz' ? 'kz' : 'ru'} 
						on:change={(e) => $languageStore = e.detail}
					/>

					<button onclick={() => isMobileMenuOpen = !isMobileMenuOpen} class="mobile-menu-btn md:hidden w-9 h-9 rounded-md flex items-center justify-center">
						{#if isMobileMenuOpen}
							<span class="text-lg text-foreground">✕</span>
						{:else}
							<span class="text-lg text-foreground">☰</span>
						{/if}
					</button>
				</div>
			</div>

			<!-- Mobile Menu -->
			{#if isMobileMenuOpen}
				<div class="mobile-menu md:hidden py-4 border-t backdrop-blur-sm">
					<div class="flex flex-col gap-4">
						<button onclick={() => scrollToSection('news')} class="menu-link text-left">
							{currentLanguage === 'kz' ? 'Жаңалықтар' : 'Новости'}
						</button>
						<button onclick={() => scrollToSection('teachers')} class="menu-link text-left">
							{currentLanguage === 'kz' ? 'Мұғалімдер' : 'Учителя'}
						</button>
						<button onclick={() => scrollToSection('achievements')} class="menu-link text-left">
							{currentLanguage === 'kz' ? 'Жетістіктер' : 'Достижения'}
						</button>
						<button onclick={() => scrollToSection('schedule')} class="menu-link text-left">
							{currentLanguage === 'kz' ? 'Кесте' : 'Расписание'}
						</button>
						<button onclick={() => scrollToSection('contact')} class="menu-link text-left">
							{currentLanguage === 'kz' ? 'Байланыс' : 'Контакты'}
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
			<div class="absolute inset-0 hero-fallback"></div>
		{/if}

		<div class="absolute inset-0 hero-overlay"></div>

		<div class="relative container mx-auto px-4 py-24 md:py-36 text-center">
			<div class="mx-auto max-w-5xl">
				{#if loading}
					<div class="mx-auto h-16 md:h-24 w-4/5 max-w-3xl rounded-2xl bg-white/25 animate-pulse"></div>
				{:else}
					<h1 class="hero-title">
						{schoolData ? (currentLanguage === 'kz' ? schoolData.nameKz : schoolData.nameRu) : (currentLanguage === 'kz' ? 'Мектеп' : 'Школа')}
					</h1>
				{/if}
			</div>
		</div>
	</section>

	<!-- News Section -->
	<section id="news" class="section-shell section-shell-soft py-20">
		<div class="container mx-auto px-4">
			<div class="section-head text-center mb-16">
				<span class="section-kicker">{currentLanguage === 'kz' ? 'Жаңалықтар лентасы' : 'Лента новостей'}</span>
				<h2 class="section-title text-4xl font-bold text-foreground mb-4">{currentLanguage === 'kz' ? 'Соңғы жаңалықтар' : 'Последние новости'}</h2>
				<p class="section-sub text-muted-foreground max-w-2xl mx-auto text-lg">
					{currentLanguage === 'kz' ? 'Біздің мектептің маңызды оқиғалары мен жетістіктерін қадағалаңыз' : 'Следите за важными событиями и достижениями нашей школы'}
				</p>
			</div>

			{#if loading}
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{#each Array(6) as _, i}
						<div class="animate-pulse group">
							<!-- Image Skeleton -->
							<div class="bg-gradient-to-br from-muted to-secondary/40 h-48 rounded-t-lg relative overflow-hidden">
								<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
							</div>
							
							<!-- Content Skeleton -->
							<div class="bg-card p-6 rounded-b-lg border border-border">
								<!-- Title -->
								<div class="h-5 bg-gradient-to-r from-muted to-secondary/40 rounded mb-3"></div>
								<!-- Description -->
								<div class="space-y-2 mb-4">
									<div class="h-4 bg-gradient-to-r from-muted to-secondary/40 rounded w-full"></div>
									<div class="h-4 bg-gradient-to-r from-muted to-secondary/40 rounded w-4/5"></div>
									<div class="h-4 bg-gradient-to-r from-muted to-secondary/40 rounded w-3/5"></div>
								</div>
								<!-- Date -->
								<div class="h-3 bg-gradient-to-r from-muted to-secondary/40 rounded w-1/3"></div>
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
				<IllustratedEmptyState
					title={currentLanguage === 'kz' ? 'Жаңалықтар жақында шығады' : 'Новости скоро появятся'}
					description={currentLanguage === 'kz'
						? 'Мектеп өміріндегі маңызды жаңалықтар дайындалып жатыр. Жаңартулар жарияланған сәтте осы бөлімде пайда болады.'
						: 'Мы готовим важные новости о школьной жизни. Как только появятся обновления, они отобразятся в этом разделе.'}
					hint={currentLanguage === 'kz' ? 'Жаңарту күтілуде' : 'Ожидается обновление'}
					illustration="/illustrations/school-empty/news.svg"
					alt={currentLanguage === 'kz' ? 'Жаңалық иллюстрациясы' : 'Иллюстрация новостей'}
				/>
			{/if}
		</div>
	</section>

	<!-- Teachers Section -->
	<section id="teachers" class="section-shell py-20 bg-background">
		<div class="container mx-auto px-4">
			<div class="section-head text-center mb-16">
				<span class="section-kicker">{currentLanguage === 'kz' ? 'Педагогикалық команда' : 'Педагогическая команда'}</span>
				<h2 class="section-title text-4xl font-bold text-foreground mb-4">{currentLanguage === 'kz' ? 'Біздің мұғалімдеріміз' : 'Наши учителя'}</h2>
				<p class="section-sub text-muted-foreground max-w-2xl mx-auto text-lg">
					{currentLanguage === 'kz' ? 'Біздің оқушыларды табысқа жетелейтін, шабыттандыратын тәжірибелі педагогтар' : 'Опытные педагоги, которые вдохновляют и направляют наших учеников к успеху'}
				</p>
			</div>

			{#if loading}
				<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
					{#each Array(8) as _, i}
						<div class="animate-pulse text-center">
							<!-- Avatar Skeleton -->
							<div class="w-24 h-24 bg-gradient-to-br from-muted to-secondary/40 rounded-full mx-auto mb-4 relative overflow-hidden">
								<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
							</div>
							
							<!-- Content Skeleton -->
							<div class="bg-card p-4 rounded-lg border border-border">
								<!-- Name -->
								<div class="h-5 bg-gradient-to-r from-muted to-secondary/40 rounded mb-3"></div>
								<!-- Subject -->
								<div class="h-4 bg-gradient-to-r from-muted to-secondary/40 rounded mb-2 w-3/4 mx-auto"></div>
								<!-- Experience -->
								<div class="h-3 bg-gradient-to-r from-muted to-secondary/40 rounded w-1/2 mx-auto"></div>
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
				<IllustratedEmptyState
					title={currentLanguage === 'kz' ? 'Мұғалімдер профилі дайындалуда' : 'Профили учителей готовятся'}
					description={currentLanguage === 'kz'
						? 'Пәндер мен тәжірибе бойынша мұғалімдер туралы ақпарат жақында осы жерде көрсетіледі.'
						: 'Информация об учителях, предметах и опыте будет доступна здесь в ближайшее время.'}
					hint={currentLanguage === 'kz' ? 'Профильдер жүктелуде' : 'Профили загружаются'}
					illustration="/illustrations/school-empty/teachers.svg"
					alt={currentLanguage === 'kz' ? 'Мұғалімдер иллюстрациясы' : 'Иллюстрация учителей'}
				/>
			{/if}
		</div>
	</section>

	<!-- Achievements Section -->
	<section id="achievements" class="section-shell achievements-section py-20">
		<div class="container mx-auto px-4">
			<div class="section-head text-center mb-16">
				<span class="section-kicker">{currentLanguage === 'kz' ? 'Жеңістер галереясы' : 'Галерея побед'}</span>
				<h2 class="section-title text-4xl font-bold text-foreground mb-4">{currentLanguage === 'kz' ? 'Оқушылардың жетістіктері' : 'Достижения учеников'}</h2>
				<p class="section-sub text-muted-foreground max-w-2xl mx-auto text-lg">
					{currentLanguage === 'kz' ? 'Біздің дарынды оқушыларымыздың табыстары мен олардың керемет нәтижелерімен мақтанамыз' : 'Гордимся успехами наших талантливых учеников и их выдающимися результатами'}
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
				<IllustratedEmptyState
					title={currentLanguage === 'kz' ? 'Жетістіктер бөлімі жаңартылуда' : 'Раздел достижений обновляется'}
					description={currentLanguage === 'kz'
						? 'Оқушылардың марапаттары мен жеңістері туралы материалдар жиналып жатыр.'
						: 'Мы собираем материалы о наградах и победах учеников. Скоро здесь появятся яркие результаты.'}
					hint={currentLanguage === 'kz' ? 'Марапаттар жақында' : 'Награды скоро'}
					illustration="/illustrations/school-empty/achievements.svg"
					alt={currentLanguage === 'kz' ? 'Жетістіктер иллюстрациясы' : 'Иллюстрация достижений'}
				/>
			{/if}
		</div>
	</section>

	<!-- Schedule Section -->
	<section id="schedule" class="section-shell py-20 bg-background">
		<div class="container mx-auto px-4">
			<div class="section-head text-center mb-16">
				<span class="section-kicker">{currentLanguage === 'kz' ? 'Күн тәртібі' : 'День в расписании'}</span>
				<h2 class="section-title text-4xl font-bold text-foreground mb-4">{currentLanguage === 'kz' ? 'Бүгінгі кесте' : 'Расписание на сегодня'}</h2>
				<p class="section-sub text-muted-foreground max-w-2xl mx-auto text-lg">
					{currentLanguage === 'kz' ? 'Бүгінгі күндің өзекті сабақ кестесі' : 'Актуальное расписание занятий на сегодняшний день'}
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
													{item.Teacher ? (currentLanguage === 'kz' ? item.Teacher.nameKz : item.Teacher.nameRu) : (currentLanguage === 'kz' ? 'Мұғалім көрсетілмеген' : 'Учитель не указан')}
												</p>
											</div>
										</div>
										<div class="text-right">
											<span class="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm font-medium">
												{item.Class ? (currentLanguage === 'kz' ? `Сынып ${item.Class.grade}${item.Class.letter}` : `Класс ${item.Class.grade}${item.Class.letter}`) : (currentLanguage === 'kz' ? 'Сынып көрсетілмеген' : 'Класс не указан')}
											</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{:else}
				<IllustratedEmptyState
					title={currentLanguage === 'kz' ? 'Күнтізбе мен кесте дайындалуда' : 'Расписание формируется'}
					description={currentLanguage === 'kz'
						? 'Сабақ кестесі бекітілгеннен кейін осы бөлімде автоматты түрде көрсетіледі.'
						: 'После утверждения учебного плана расписание автоматически появится в этом разделе.'}
					hint={currentLanguage === 'kz' ? 'Кесте күтілуде' : 'Ожидается расписание'}
					illustration="/illustrations/school-empty/schedule.svg"
					alt={currentLanguage === 'kz' ? 'Кесте иллюстрациясы' : 'Иллюстрация расписания'}
				/>
			{/if}
		</div>
	</section>

	<!-- Canteen Menu Section -->
	<section class="section-shell section-shell-soft py-20">
		<div class="container mx-auto px-4">
			<div class="section-head text-center mb-16">
				<span class="section-kicker">{currentLanguage === 'kz' ? 'Дәмді және пайдалы' : 'Вкусно и полезно'}</span>
				<h2 class="section-title text-4xl font-bold text-foreground mb-4">{currentLanguage === 'kz' ? 'Асхана менюсі' : 'Меню столовой'}</h2>
				<p class="section-sub text-muted-foreground max-w-2xl mx-auto text-lg">
					{currentLanguage === 'kz' ? 'Біздің оқушыларға арналған дәмді және пайдалы тамақтану' : 'Вкусное и полезное питание для наших учеников'}
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
				<IllustratedEmptyState
					title={currentLanguage === 'kz' ? 'Асхана мәзірі дайындалуда' : 'Меню столовой готовится'}
					description={currentLanguage === 'kz'
						? 'Таңғы және түскі ас бойынша мәзір жақында жарияланады.'
						: 'Скоро здесь появится меню завтраков и обедов с актуальными позициями по дням.'}
					hint={currentLanguage === 'kz' ? 'Мәзір жаңаруда' : 'Меню обновляется'}
					illustration="/illustrations/school-empty/canteen.svg"
					alt={currentLanguage === 'kz' ? 'Асхана иллюстрациясы' : 'Иллюстрация столовой'}
				/>
			{/if}
		</div>
	</section>

	<!-- Classes Section -->
	<section class="section-shell py-20 bg-background">
		<div class="container mx-auto px-4">
			<div class="section-head text-center mb-16">
				<span class="section-kicker">{currentLanguage === 'kz' ? 'Оқу қауымдастығы' : 'Учебное сообщество'}</span>
				<h2 class="section-title text-4xl font-bold text-foreground mb-4">{currentLanguage === 'kz' ? 'Біздің сыныптарымыз' : 'Наши классы'}</h2>
				<p class="section-sub text-muted-foreground max-w-2xl mx-auto text-lg">
					{currentLanguage === 'kz' ? 'Сыныптар және сынып жетекшілері туралы ақпарат' : 'Информация о классах и классных руководителях'}
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
						<div class="class-tile text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card border border-border rounded-lg p-6">
							<div class="class-tile-badge w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
								<span class="text-2xl font-bold text-primary">
									{classItem.grade}{classItem.letter}
								</span>
							</div>
							
							<h3 class="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors mb-2">
								{classItem.grade} {currentLanguage === 'kz' ? 'сынып' : 'класс'} "{classItem.letter}"
							</h3>
							
								<div class="space-y-2 mb-4">
									<div class="flex items-center justify-center gap-2 text-muted-foreground">
										<Users class="w-4 h-4" />
										<span>{currentLanguage === 'kz' ? '25 оқушы' : '25 учеников'}</span>
									</div>
								</div>
							
							{#if classItem.Teacher}
								<p class="text-sm text-muted-foreground">
									{currentLanguage === 'kz' ? 'Сынып жетекшісі:' : 'Классный руководитель:'} <br>
									<span class="font-medium">{currentLanguage === 'kz' ? classItem.Teacher.nameKz : classItem.Teacher.nameRu}</span>
								</p>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<IllustratedEmptyState
					title={currentLanguage === 'kz' ? 'Сыныптар туралы ақпарат жүктелуде' : 'Информация о классах загружается'}
					description={currentLanguage === 'kz'
						? 'Сыныптар, жетекшілер және негізгі деректер жақында осы блокта көрінеді.'
						: 'Данные по классам, руководителям и составу скоро будут доступны в этом блоке.'}
					hint={currentLanguage === 'kz' ? 'Сыныптар жаңартылады' : 'Классы обновляются'}
					illustration="/illustrations/school-empty/classes.svg"
					alt={currentLanguage === 'kz' ? 'Сыныптар иллюстрациясы' : 'Иллюстрация классов'}
				/>
			{/if}
		</div>
	</section>

	<!-- Contact Section -->
	<section id="contact" class="section-shell contact-section py-20 text-primary-foreground">
		<div class="container mx-auto px-4">
			<div class="section-head text-center mb-16">
				<span class="section-kicker section-kicker-invert">{currentLanguage === 'kz' ? 'Байланыс арнасы' : 'Канал связи'}</span>
				<h2 class="section-title text-4xl font-bold mb-4">{currentLanguage === 'kz' ? 'Бізбен байланысыңыз' : 'Свяжитесь с нами'}</h2>
				<p class="section-sub text-primary-foreground/85 max-w-2xl mx-auto text-lg">
					{currentLanguage === 'kz' ? 'Біз әрқашан сұрақтарыңызға жауап беруге және қажетті ақпаратты ұсынуға дайынбыз' : 'Мы всегда готовы ответить на ваши вопросы и предоставить необходимую информацию'}
				</p>
			</div>

			<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
					{#if schoolData?.addressRu}
						<div class="contact-card text-center group">
							<div class="contact-icon w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform animate-glow">
								<MapPin class="w-6 h-6" />
							</div>
							<h3 class="text-xl font-semibold mb-2">{currentLanguage === 'kz' ? 'Мекенжай' : 'Адрес'}</h3>
							<p class="text-primary-foreground/85">{currentLanguage === 'kz' ? schoolData.addressKz : schoolData.addressRu}</p>
						</div>
					{/if}

					<div class="contact-card text-center group">
						<div class="contact-icon w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform animate-glow" style="animation-delay: 0.5s;">
							<Phone class="w-6 h-6" />
						</div>
						<h3 class="text-xl font-semibold mb-2">{currentLanguage === 'kz' ? 'Телефон' : 'Телефон'}</h3>
						<p class="text-primary-foreground/85">+7 (727) 123-45-67</p>
					</div>

					{#if schoolData?.email}
						<div class="contact-card text-center group">
							<div class="contact-icon w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform animate-glow" style="animation-delay: 1s;">
								<Mail class="w-6 h-6" />
							</div>
							<h3 class="text-xl font-semibold mb-2">{currentLanguage === 'kz' ? 'Электрондық пошта' : 'Email'}</h3>
							<p class="text-primary-foreground/85">{schoolData.email}</p>
					</div>
				{/if}

					<div class="contact-card text-center group">
						<div class="contact-icon w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform animate-glow" style="animation-delay: 1.5s;">
							<Clock3 class="w-6 h-6" />
						</div>
						<h3 class="text-xl font-semibold mb-2">{currentLanguage === 'kz' ? 'Жұмыс режимі' : 'Режим работы'}</h3>
						<p class="text-primary-foreground/85">Пн-Пт: 8:00 - 18:00</p>
					</div>
				</div>

				<div class="text-center">
					<a href="/" class="contact-cta inline-block hover:scale-105 transition-all duration-300 shadow-lg px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-3 mx-auto">
						<LogIn class="w-5 h-5" />
						{currentLanguage === 'kz' ? 'Жүйеге кіру' : 'Войти в систему'}
					</a>
				</div>
			</div>
		</section>

		<footer class="school-footer section-shell">
			<div class="container mx-auto px-4">
				<div class="footer-grid">
					<div class="footer-brand">
						<div class="footer-brand-mark">
							{#if schoolData?.schoolEmblem}
								<img src={schoolData.schoolEmblem} alt="School Emblem" class="w-8 h-8 object-contain" />
							{:else if schoolData?.logoUrl}
								<img src={schoolData.logoUrl} alt="School Logo" class="w-8 h-8 object-cover rounded-md" />
							{:else}
								<GraduationCap class="w-5 h-5 text-primary" />
							{/if}
						</div>
						<div>
							<h3 class="footer-school-name">
								{schoolData ? (currentLanguage === 'kz' ? schoolData.nameKz : schoolData.nameRu) : (currentLanguage === 'kz' ? 'Мектеп' : 'Школа')}
							</h3>
							<p class="footer-school-sub">
								{currentLanguage === 'kz'
									? 'Заманауи білім мен дамуға арналған цифрлық мектеп кеңістігі'
									: 'Цифровое школьное пространство для современного образования и развития'}
							</p>
						</div>
					</div>

					<div class="footer-col">
						<h4 class="footer-col-title">{currentLanguage === 'kz' ? 'Бөлімдер' : 'Навигация'}</h4>
						<div class="footer-links">
							<button type="button" class="footer-link-btn" onclick={() => scrollToSection('news')}>
								{currentLanguage === 'kz' ? 'Жаңалықтар' : 'Новости'}
							</button>
							<button type="button" class="footer-link-btn" onclick={() => scrollToSection('teachers')}>
								{currentLanguage === 'kz' ? 'Мұғалімдер' : 'Учителя'}
							</button>
							<button type="button" class="footer-link-btn" onclick={() => scrollToSection('schedule')}>
								{currentLanguage === 'kz' ? 'Кесте' : 'Расписание'}
							</button>
							<button type="button" class="footer-link-btn" onclick={() => scrollToSection('contact')}>
								{currentLanguage === 'kz' ? 'Байланыс' : 'Контакты'}
							</button>
						</div>
					</div>

					<div class="footer-col">
						<h4 class="footer-col-title">{currentLanguage === 'kz' ? 'Байланыс' : 'Контакты'}</h4>
							<div class="footer-contact-list">
								{#if schoolData?.addressRu}
									<div class="footer-contact-item">
										<MapPin class="w-4 h-4 mt-[0.05rem]" />
										<span>{currentLanguage === 'kz' ? schoolData.addressKz : schoolData.addressRu}</span>
									</div>
								{/if}
								<div class="footer-contact-item">
									<Phone class="w-4 h-4 mt-[0.05rem]" />
									<a href="tel:+77271234567" class="footer-inline-link">+7 (727) 123-45-67</a>
								</div>
								{#if schoolData?.email}
									<div class="footer-contact-item">
										<Mail class="w-4 h-4 mt-[0.05rem]" />
										<a href={`mailto:${schoolData.email}`} class="footer-inline-link">{schoolData.email}</a>
									</div>
								{/if}
						</div>
					</div>

						<div class="footer-col">
							<h4 class="footer-col-title">{currentLanguage === 'kz' ? 'Портал' : 'Портал'}</h4>
							<a href="/" class="footer-login-btn">
								<LogIn class="w-4 h-4" />
								{currentLanguage === 'kz' ? 'Жүйеге кіру' : 'Войти в систему'}
							</a>
						<p class="footer-note">
							{currentLanguage === 'kz'
								? 'Оқушылар, ата-аналар және мұғалімдер үшін бірыңғай қолжетімділік'
								: 'Единый доступ для учеников, родителей и педагогов'}
						</p>
					</div>
				</div>

				<div class="footer-bottom">
					<p>
						© {currentYear} {schoolData ? (currentLanguage === 'kz' ? schoolData.nameKz : schoolData.nameRu) : (currentLanguage === 'kz' ? 'Мектеп' : 'Школа')}.
						{currentLanguage === 'kz' ? ' Барлық құқықтар қорғалған.' : ' Все права защищены.'}
						</p>
						<div class="footer-badges">
							<span class="footer-badge">
								<ShieldCheck class="w-3.5 h-3.5" />
								{currentLanguage === 'kz' ? 'Қауіпсіз платформа' : 'Безопасная платформа'}
							</span>
							<span class="footer-badge">
								<BookOpen class="w-3.5 h-3.5" />
								{currentLanguage === 'kz' ? 'Білім беру экожүйесі' : 'Образовательная экосистема'}
							</span>
						</div>
					</div>
				</div>
		</footer>
	</div>

<style>
	/* Custom animations */
	@keyframes glow {
		0%, 100% {
			box-shadow: 0 0 20px hsl(var(--primary) / 0.28);
		}
		50% {
			box-shadow: 0 0 40px hsl(var(--primary) / 0.48);
		}
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
		background-attachment: fixed;
		filter: saturate(1.06) contrast(1.02);
		image-rendering: auto;
		-webkit-backface-visibility: hidden;
		backface-visibility: hidden;
		transform: translateZ(0);
		will-change: transform;
	}

	.hero-fallback {
		background-image: url('/illustrations/school-empty/hero-fallback.svg');
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
		filter: saturate(1.08);
	}

	.hero-overlay {
		background:
			linear-gradient(180deg, rgb(2 6 23 / 0.2) 0%, rgb(2 6 23 / 0.58) 100%);
	}

	.hero-title {
		font-family: var(--font-display);
		font-size: clamp(2.4rem, 8vw, 5.8rem);
		font-weight: 800;
		line-height: 1.02;
		letter-spacing: -0.03em;
		color: rgb(255 255 255 / 0.96);
		text-shadow:
			0 10px 30px rgb(2 6 23 / 0.5),
			0 2px 6px rgb(2 6 23 / 0.34);
		padding: 0 0.5rem;
	}

	/* Responsive container */
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.top-nav {
		background: hsl(var(--card) / 0.84);
		border-bottom: 1px solid hsl(var(--border) / 0.7);
		box-shadow: var(--shadow);
	}

	.menu-link {
		position: relative;
		color: hsl(var(--foreground) / 0.82);
		font-weight: 600;
		padding-bottom: 0.15rem;
		transition: color 180ms ease, transform 180ms ease;
	}

	.menu-link::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: -0.26rem;
		width: 100%;
		height: 2px;
		border-radius: 999px;
		background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)));
		transform: scaleX(0);
		transform-origin: center;
		transition: transform 180ms ease;
	}

	.menu-link:hover {
		color: hsl(var(--primary));
		transform: translateY(-1px);
	}

	.menu-link:hover::after {
		transform: scaleX(1);
	}

	.mobile-menu-btn {
		border: 1px solid hsl(var(--border));
		background: hsl(var(--card));
	}

	.mobile-menu-btn:hover {
		background: hsl(var(--secondary) / 0.55);
	}

	.mobile-menu {
		border-color: hsl(var(--border) / 0.72);
		background: hsl(var(--card) / 0.96);
	}

	.section-shell {
		position: relative;
		background: hsl(var(--background));
	}

	.section-shell-soft {
		background:
			radial-gradient(circle at 0% 0%, hsl(var(--accent) / 0.1), transparent 35%),
			radial-gradient(circle at 100% 100%, hsl(var(--primary) / 0.08), transparent 38%),
			hsl(var(--muted) / 0.45);
	}

	.section-head {
		max-width: 760px;
		margin-left: auto;
		margin-right: auto;
	}

	.section-kicker {
		display: inline-flex;
		align-items: center;
		padding: 0.35rem 0.82rem;
		border-radius: 999px;
		background: hsl(var(--primary) / 0.14);
		border: 1px solid hsl(var(--primary) / 0.24);
		color: hsl(var(--primary));
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		margin-bottom: 0.95rem;
	}

	.section-kicker-invert {
		background: rgb(255 255 255 / 0.12);
		border-color: rgb(255 255 255 / 0.28);
		color: rgb(255 255 255 / 0.95);
	}

	.section-title {
		font-family: var(--font-display);
		line-height: 1.08;
		letter-spacing: -0.02em;
	}

	.section-sub {
		line-height: 1.68;
	}

	.achievements-section {
		background:
			radial-gradient(circle at 0% 0%, hsl(var(--warning) / 0.14), transparent 38%),
			radial-gradient(circle at 100% 100%, hsl(var(--accent) / 0.13), transparent 40%),
			hsl(var(--muted) / 0.45);
	}

	.contact-section {
		background:
			radial-gradient(circle at 8% 10%, hsl(var(--accent) / 0.26), transparent 37%),
			radial-gradient(circle at 96% 94%, hsl(var(--primary) / 0.3), transparent 40%),
			linear-gradient(145deg, hsl(var(--primary) / 0.96), hsl(var(--accent) / 0.86));
	}

	.contact-icon {
		background: hsl(var(--primary-foreground) / 0.14);
		border: 1px solid hsl(var(--primary-foreground) / 0.33);
	}

	.class-tile {
		position: relative;
		overflow: hidden;
		border-radius: 1rem;
		background:
			radial-gradient(circle at 12% 16%, hsl(var(--primary) / 0.12), transparent 40%),
			radial-gradient(circle at 88% 84%, hsl(var(--accent) / 0.12), transparent 44%),
			linear-gradient(155deg, hsl(var(--card) / 0.98), hsl(var(--card) / 0.92));
		border: 1px solid hsl(var(--border) / 0.72);
		box-shadow: var(--shadow-md);
	}

	.class-tile::after {
		content: '';
		position: absolute;
		left: 1rem;
		right: 1rem;
		top: 0.7rem;
		height: 3px;
		border-radius: 999px;
		background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)));
		opacity: 0.7;
	}

	.class-tile-badge {
		border: 1px solid hsl(var(--primary) / 0.24);
		box-shadow: 0 12px 28px hsl(var(--primary) / 0.18);
	}

	.contact-card {
		padding: 1.4rem 1rem;
		border-radius: 1rem;
		border: 1px solid hsl(var(--primary-foreground) / 0.24);
		background: rgb(255 255 255 / 0.1);
		backdrop-filter: blur(10px);
		box-shadow: 0 18px 36px rgb(15 23 42 / 0.18);
		transition: transform 220ms ease, background-color 220ms ease, border-color 220ms ease;
	}

	.contact-card:hover {
		transform: translateY(-3px);
		background: rgb(255 255 255 / 0.16);
		border-color: hsl(var(--primary-foreground) / 0.38);
	}

	.contact-cta {
		background: hsl(var(--card));
		color: hsl(var(--foreground));
		border: 1px solid hsl(var(--border) / 0.75);
	}

	.contact-cta:hover {
		background: hsl(var(--muted));
	}

	.school-footer {
		padding: 4rem 0 1.7rem;
		border-top: 1px solid hsl(var(--border) / 0.78);
		background:
			radial-gradient(circle at 4% 8%, hsl(var(--accent) / 0.12), transparent 36%),
			radial-gradient(circle at 92% 94%, hsl(var(--primary) / 0.12), transparent 42%),
			linear-gradient(165deg, hsl(var(--card) / 0.98), hsl(var(--muted) / 0.58));
	}

	.footer-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.3fr) repeat(3, minmax(0, 1fr));
		gap: 2rem 1.4rem;
	}

	.footer-brand {
		display: flex;
		align-items: flex-start;
		gap: 0.9rem;
	}

	.footer-brand-mark {
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 0.9rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(140deg, hsl(var(--primary) / 0.24), hsl(var(--accent) / 0.2));
		border: 1px solid hsl(var(--primary) / 0.26);
		box-shadow: 0 10px 24px hsl(var(--primary) / 0.2);
	}

	.footer-school-name {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.18rem;
		font-weight: 700;
		letter-spacing: -0.015em;
		color: hsl(var(--foreground));
	}

	.footer-school-sub {
		margin: 0.6rem 0 0;
		max-width: 28rem;
		color: hsl(var(--muted-foreground));
		line-height: 1.62;
		font-size: 0.92rem;
	}

	.footer-col-title {
		margin: 0 0 0.78rem;
		font-size: 0.88rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: hsl(var(--foreground) / 0.78);
	}

	.footer-links {
		display: grid;
		gap: 0.46rem;
	}

	.footer-link-btn {
		padding: 0;
		border: 0;
		background: transparent;
		text-align: left;
		font-size: 0.93rem;
		font-weight: 500;
		color: hsl(var(--muted-foreground));
		cursor: pointer;
		transition: color 160ms ease, transform 160ms ease;
	}

	.footer-link-btn:hover {
		color: hsl(var(--primary));
		transform: translateX(2px);
	}

	.footer-contact-list {
		display: grid;
		gap: 0.58rem;
	}

	.footer-contact-item {
		display: grid;
		grid-template-columns: 1.2rem 1fr;
		align-items: start;
		gap: 0.52rem;
		color: hsl(var(--muted-foreground));
		font-size: 0.92rem;
		line-height: 1.45;
	}

	.footer-inline-link {
		color: inherit;
		text-decoration: none;
		transition: color 160ms ease;
	}

	.footer-inline-link:hover {
		color: hsl(var(--primary));
	}

	.footer-login-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		padding: 0.68rem 1rem;
		border-radius: 0.8rem;
		border: 1px solid hsl(var(--primary) / 0.34);
		background: linear-gradient(130deg, hsl(var(--primary)), hsl(var(--accent)));
		color: hsl(var(--primary-foreground));
		font-size: 0.91rem;
		font-weight: 700;
		text-decoration: none;
		box-shadow: 0 12px 26px hsl(var(--primary) / 0.28);
		transition: transform 180ms ease, box-shadow 220ms ease;
	}

	.footer-login-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 16px 34px hsl(var(--primary) / 0.32);
	}

	.footer-note {
		margin: 0.75rem 0 0;
		font-size: 0.87rem;
		line-height: 1.5;
		color: hsl(var(--muted-foreground));
	}

	.footer-bottom {
		margin-top: 2rem;
		padding-top: 1.05rem;
		border-top: 1px solid hsl(var(--border) / 0.76);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.footer-bottom p {
		margin: 0;
		font-size: 0.84rem;
		color: hsl(var(--muted-foreground));
	}

	.footer-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.46rem;
	}

	.footer-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.34rem;
		padding: 0.34rem 0.64rem;
		border-radius: 999px;
		border: 1px solid hsl(var(--border) / 0.84);
		background: hsl(var(--card) / 0.78);
		font-size: 0.74rem;
		font-weight: 600;
		color: hsl(var(--foreground) / 0.72);
	}

	:global(.dark) .top-nav {
		background: hsl(var(--card) / 0.72);
		border-bottom-color: hsl(var(--border) / 0.8);
	}

	:global(.dark) .menu-link {
		color: hsl(var(--foreground) / 0.9);
	}

	:global(.dark) .menu-link::after {
		background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--warning)));
	}

	:global(.dark) .mobile-menu-btn {
		background: hsl(var(--card));
		border-color: hsl(var(--border));
	}

	:global(.dark) .mobile-menu-btn:hover {
		background: hsl(var(--secondary) / 0.62);
	}

	:global(.dark) .mobile-menu {
		background: hsl(var(--card) / 0.93);
	}

	:global(.dark) .hero-fallback {
		filter: saturate(1.02) brightness(0.92);
	}

	:global(.dark) .hero-overlay {
		background: linear-gradient(180deg, rgb(2 6 23 / 0.18) 0%, rgb(2 6 23 / 0.66) 100%);
	}

	:global(.dark) .hero-title {
		color: rgb(248 250 252 / 0.98);
		text-shadow:
			0 14px 36px rgb(2 6 23 / 0.62),
			0 4px 10px rgb(2 6 23 / 0.42);
	}

	:global(.dark) .section-shell-soft {
		background:
			radial-gradient(circle at 0% 0%, hsl(var(--accent) / 0.12), transparent 35%),
			radial-gradient(circle at 100% 100%, hsl(var(--primary) / 0.12), transparent 38%),
			hsl(var(--background));
	}

	:global(.dark) .section-kicker {
		background: hsl(var(--primary) / 0.2);
		border-color: hsl(var(--primary) / 0.38);
	}

	:global(.dark) .class-tile {
		background:
			radial-gradient(circle at 12% 14%, hsl(var(--primary) / 0.16), transparent 39%),
			radial-gradient(circle at 88% 86%, hsl(var(--warning) / 0.15), transparent 45%),
			linear-gradient(155deg, hsl(var(--card) / 0.95), hsl(var(--card) / 0.86));
		border-color: hsl(var(--border) / 0.82);
	}

	:global(.dark) .class-tile-badge {
		border-color: hsl(var(--primary) / 0.36);
		box-shadow: 0 12px 30px hsl(var(--primary) / 0.24);
	}

	:global(.dark) .contact-card {
		background: rgb(15 23 42 / 0.34);
		border-color: rgb(148 163 184 / 0.28);
		box-shadow: 0 24px 44px rgb(2 6 23 / 0.42);
	}

	:global(.dark) .contact-card:hover {
		background: rgb(15 23 42 / 0.48);
		border-color: rgb(148 163 184 / 0.38);
	}

	:global(.dark) .achievements-section {
		background:
			radial-gradient(circle at 8% 4%, hsl(var(--warning) / 0.18), transparent 36%),
			radial-gradient(circle at 100% 95%, hsl(var(--accent) / 0.18), transparent 40%),
			hsl(var(--background));
	}

	:global(.dark) .contact-section {
		background:
			radial-gradient(circle at 8% 8%, hsl(var(--accent) / 0.24), transparent 37%),
			radial-gradient(circle at 92% 95%, hsl(var(--primary) / 0.24), transparent 40%),
			linear-gradient(150deg, hsl(var(--primary) / 0.78), hsl(var(--background) / 0.96));
	}

	:global(.dark) .contact-icon {
		background: rgb(15 23 42 / 0.54);
		border-color: rgb(148 163 184 / 0.4);
	}

	:global(.dark) .contact-cta {
		background: hsl(var(--card));
		color: hsl(var(--foreground));
		border-color: hsl(var(--border));
	}

	:global(.dark) .contact-cta:hover {
		background: hsl(var(--muted));
	}

	:global(.dark) .school-footer {
		border-top-color: hsl(var(--border) / 0.88);
		background:
			radial-gradient(circle at 4% 8%, hsl(var(--accent) / 0.16), transparent 36%),
			radial-gradient(circle at 92% 94%, hsl(var(--warning) / 0.14), transparent 42%),
			linear-gradient(165deg, hsl(var(--card) / 0.96), hsl(var(--background) / 0.96));
	}

	:global(.dark) .footer-school-name {
		color: hsl(var(--foreground));
	}

	:global(.dark) .footer-school-sub,
	:global(.dark) .footer-contact-item,
	:global(.dark) .footer-note,
	:global(.dark) .footer-bottom p {
		color: hsl(var(--muted-foreground));
	}

	:global(.dark) .footer-col-title {
		color: hsl(var(--foreground) / 0.84);
	}

	:global(.dark) .footer-link-btn {
		color: hsl(var(--muted-foreground));
	}

	:global(.dark) .footer-link-btn:hover,
	:global(.dark) .footer-inline-link:hover {
		color: hsl(var(--warning));
	}

	:global(.dark) .footer-brand-mark {
		background: linear-gradient(140deg, hsl(var(--primary) / 0.24), hsl(var(--accent) / 0.22));
		border-color: hsl(var(--primary) / 0.38);
	}

	:global(.dark) .footer-login-btn {
		border-color: hsl(var(--primary) / 0.44);
		box-shadow: 0 12px 26px hsl(var(--primary) / 0.24);
	}

	:global(.dark) .footer-bottom {
		border-top-color: hsl(var(--border) / 0.88);
	}

	:global(.dark) .footer-badge {
		background: hsl(var(--card) / 0.72);
		border-color: hsl(var(--border));
		color: hsl(var(--foreground) / 0.74);
	}



	@media (max-width: 1024px) {
		.hero-title {
			font-size: clamp(2.3rem, 10vw, 4.7rem);
		}

		.footer-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 768px) {
		.section-title {
			font-size: 2rem;
		}

		.hero-title {
			letter-spacing: -0.02em;
		}

		.footer-bottom {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	@media (max-width: 640px) {
		.footer-grid {
			grid-template-columns: 1fr;
		}

		.school-footer {
			padding-top: 3.2rem;
		}
	}

	/* Responsive background quality for different screen densities */
	@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
		.hero-background {
			background-size: cover;
			image-rendering: auto;
		}
	}

	@media (-webkit-min-device-pixel-ratio: 3), (min-resolution: 288dpi) {
		.hero-background {
			background-size: cover;
			image-rendering: auto;
		}
	}

	/* Disable background-attachment: fixed on mobile for better performance */
	@media (max-width: 768px) {
		.hero-background {
			background-attachment: scroll;
		}
	}
</style>
