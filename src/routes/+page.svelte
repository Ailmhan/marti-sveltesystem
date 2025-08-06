<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import { authStore } from '$lib/stores/auth';
	import { schoolStore } from '$lib/stores/school';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import OptimizedImage from '$lib/components/OptimizedImage.svelte';
	import type { School } from '$lib/types/api';

	let loading = false;
	let error = '';
	$: school = $schoolStore;
	let stats = {
		news: 0,
		teachers: 0,
		classes: 0,
		students: 0
	};

	// Фото школы
	let schoolImageUrl = 'https://images.unsplash.com/photo-1523050854058-8df90110c9e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
	let showImageUpload = false;

	// Загружаем сохраненное фото школы при инициализации
	onMount(() => {
		const savedImage = localStorage.getItem('schoolImageUrl');
		if (savedImage) {
			schoolImageUrl = savedImage;
		}
		loadSchoolData();
	});

	async function loadSchoolData() {
		try {
			loading = true;
			error = '';

			// Получаем информацию о школе только если авторизованы
			if ($authStore.isAuthenticated) {
				const schoolData = await apiClient.getMe();
				console.log('School data loaded:', schoolData);
				schoolStore.set(schoolData);
				
				// Загружаем статистику
				await loadStats();
			} else {
				// Если не авторизованы, показываем сообщение о необходимости авторизации
				error = 'Необходима авторизация для просмотра данных школы';
			}
		} catch (err) {
			console.error('Error loading school data:', err);
			error = err instanceof Error ? err.message : 'Ошибка загрузки данных школы';
		} finally {
			loading = false;
		}
	}

	async function loadStats() {
		if (!school) return;

		try {
			const [news, teachers, classes] = await Promise.all([
				apiClient.getNews(school.id),
				apiClient.getTeachers(school.id),
				apiClient.getClasses(school.id)
			]);

			stats = {
				news: news.length,
				teachers: teachers.length,
				classes: classes.length,
				students: classes.length * 30 // Примерное количество учеников
			};
		} catch (err) {
			console.error('Error loading stats:', err);
			// В случае ошибки показываем нули
			stats = {
				news: 0,
				teachers: 0,
				classes: 0,
				students: 0
			};
		}
	}

	function handleImageChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const result = e.target?.result;
				if (typeof result === 'string') {
					schoolImageUrl = result;
					// Сохраняем фото в localStorage
					localStorage.setItem('schoolImageUrl', result);
				}
			};
			reader.readAsDataURL(file);
		}
	}

	const quickActions = [
		{ name: 'Новости', href: '/news', icon: '📰', color: 'bg-blue-500' },
		{ name: 'Учителя', href: '/teachers', icon: '👥', color: 'bg-green-500' },
		{ name: 'Доска почета', href: '/honor-board', icon: '🏆', color: 'bg-yellow-500' },
		{ name: 'Меню', href: '/canteen', icon: '🍽️', color: 'bg-orange-500' },
		{ name: 'Расписание', href: '/schedule', icon: '📅', color: 'bg-purple-500' },
		{ name: 'Классы', href: '/classes', icon: '🎓', color: 'bg-red-500' }
	];
</script>

<svelte:head>
	<title>Главная - Школьная система</title>
</svelte:head>

<div class="container mx-auto p-6">
	<!-- Заголовок и переключатель режимов -->
			<div class="mb-8">
			<div>
				<h1 class="text-3xl font-bold text-gray-900 mb-2">
					{school ? school.nameRu : 'Школьная система'}
				</h1>
				{#if school}
					<p class="text-gray-600">{school.addressRu}</p>
				{/if}
			</div>
		</div>

	{#if loading}
		<div class="flex justify-center items-center h-64">
			<div class="text-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
				<p class="text-gray-600">Загрузка данных школы...</p>
			</div>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
			<p class="text-red-800">{error}</p>
		</div>
	{:else}
		<!-- Информация о школе -->
		{#if school}
			<div class="mb-8">
				<!-- Фото школы -->
				<Card class="mb-6">
					<CardHeader>
						<CardTitle>Фото школы</CardTitle>
					</CardHeader>
					<CardContent>
													<div class="relative">
								<OptimizedImage
									src={schoolImageUrl}
									alt="Фото школы"
									width={400}
									height={256}
									loading="eager"
									className="w-full h-64 object-cover rounded-lg"
								/>
							<div class="mt-4 flex gap-2">
								<Button 
									variant="outline" 
									size="sm"
									on:click={() => showImageUpload = !showImageUpload}
								>
									{showImageUpload ? 'Отмена' : 'Изменить фото'}
								</Button>
								{#if showImageUpload}
									<input 
										type="file" 
										accept="image/*" 
										on:change={handleImageChange}
										class="hidden"
										id="school-image"
									/>
									<label for="school-image">
										<Button variant="outline" size="sm" class="cursor-pointer">
											Выбрать файл
										</Button>
									</label>
								{/if}
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Информация о школе -->
				<Card>
					<CardHeader>
						<CardTitle>Информация о школе</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div class="space-y-4">
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Название (Русский)</label>
									<p class="text-gray-900">{school.nameRu}</p>
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Название (Казахский)</label>
									<p class="text-gray-900">{school.nameKz}</p>
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
									<p class="text-gray-900">{school.email}</p>
								</div>
							</div>
							<div class="space-y-4">
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Адрес (Русский)</label>
									<p class="text-gray-900">{school.addressRu || 'Не указан'}</p>
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Адрес (Казахский)</label>
									<p class="text-gray-900">{school.addressKz || 'Не указан'}</p>
								</div>
								{#if school.descriptionRu}
									<div>
										<label class="block text-sm font-medium text-gray-700 mb-1">Описание</label>
										<p class="text-gray-900">{school.descriptionRu}</p>
									</div>
								{/if}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		{/if}

		<!-- Статистика -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			<Card>
				<CardContent class="p-6">
					<div class="flex items-center">
						<div class="p-2 bg-blue-100 rounded-lg">
							<span class="text-2xl">📰</span>
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-600">Новости</p>
							<p class="text-2xl font-bold text-gray-900">{stats.news}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent class="p-6">
					<div class="flex items-center">
						<div class="p-2 bg-green-100 rounded-lg">
							<span class="text-2xl">👥</span>
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-600">Учителя</p>
							<p class="text-2xl font-bold text-gray-900">{stats.teachers}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent class="p-6">
					<div class="flex items-center">
						<div class="p-2 bg-purple-100 rounded-lg">
							<span class="text-2xl">🎓</span>
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-600">Классы</p>
							<p class="text-2xl font-bold text-gray-900">{stats.classes}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent class="p-6">
					<div class="flex items-center">
						<div class="p-2 bg-orange-100 rounded-lg">
							<span class="text-2xl">👨‍🎓</span>
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-600">Ученики</p>
							<p class="text-2xl font-bold text-gray-900">{stats.students}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Быстрые действия -->
		<div class="mb-8">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Быстрые действия</h2>
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
				{#each quickActions as action}
					<a 
						href={action.href}
						class="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
					>
						<div class="w-12 h-12 rounded-lg flex items-center justify-center mb-2 {action.color}">
							<span class="text-white text-xl">{action.icon}</span>
						</div>
						<span class="text-sm font-medium text-gray-700 text-center">{action.name}</span>
					</a>
				{/each}
			</div>
		</div>
	{/if}
</div>
