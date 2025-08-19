<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { adminStore } from '$lib/stores/admin';
	import { languageStore } from '$lib/stores/language';
	import { apiClient } from '$lib/api/client';
	import IdleRedirect from '$lib/components/IdleRedirect.svelte';
	import AdminLoginModal from '$lib/components/AdminLoginModal.svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
    import type { News } from '$lib/types/api';
    import NewsSlider from '$lib/components/NewsSlider.svelte';

	onMount(() => {
		// Простая проверка: если не авторизован - перенаправляем на логин
		if (!$authStore.isAuthenticated) {
			goto('/login');
		}
	});

    let latestNews: News[] = [];
    let latestLoading = false;
    let latestError = '';
    let lastLoadedSchoolId: number | null = null;

    // Переменные для настроек школы
    let showSchoolSettings = false;
    let showCardImageSettings = false;
    	let schoolSettingsLoading = false;
	let schoolSettingsError = '';
	let schoolSettingsSuccess = '';
	// Настройки Hero overlay
	let previewOverlayEnabled = true;
	let previewOverlayIntensity = 0.7;
	
	// Настройки изображений карточек
	let cardImageSettings = {
		news: {
			height: 280,
			width: 100
		},
		teacher: {
			height: 240,
			width: 100
		},
		'honor-board': {
			height: 280,
			width: 100
		},
		section: {
			height: 280,
			width: 100
		},
		canteen: {
			height: 240,
			width: 100
		}
	};
	
	// Функция для обновления localStorage
	function updateLocalStorage() {
		if (typeof window !== 'undefined') {
			localStorage.setItem('heroOverlayEnabled', previewOverlayEnabled.toString());
			localStorage.setItem('heroOverlayIntensity', previewOverlayIntensity.toString());
			
			// Сохраняем настройки изображений карточек
			Object.entries(cardImageSettings).forEach(([type, settings]) => {
				localStorage.setItem(`cardImageHeight_${type}`, settings.height.toString());
				localStorage.setItem(`cardImageWidth_${type}`, settings.width.toString());
			});
		}
	}

	// Функция для сброса настроек изображений по умолчанию
	function resetCardImageSettings(cardType: string) {
		const defaultSettings = {
			news: { height: 280, width: 100 },
			teacher: { height: 240, width: 100 },
			'honor-board': { height: 280, width: 100 },
			section: { height: 280, width: 100 },
			canteen: { height: 240, width: 100 }
		};

		if (cardType === 'all') {
			// Сброс всех настроек
			Object.entries(defaultSettings).forEach(([type, settings]) => {
				cardImageSettings[type as keyof typeof cardImageSettings] = { ...settings };
				if (typeof window !== 'undefined') {
					localStorage.setItem(`cardImageHeight_${type}`, settings.height.toString());
					localStorage.setItem(`cardImageWidth_${type}`, settings.width.toString());
				}
			});
		} else {
			// Сброс конкретного типа
			const settings = defaultSettings[cardType as keyof typeof defaultSettings];
			if (settings) {
				cardImageSettings[cardType as keyof typeof cardImageSettings] = { ...settings };
				if (typeof window !== 'undefined') {
					localStorage.setItem(`cardImageHeight_${cardType}`, settings.height.toString());
					localStorage.setItem(`cardImageWidth_${cardType}`, settings.width.toString());
				}
			}
		}
	}
	
	// Инициализация из localStorage при загрузке
	onMount(() => {
		if (typeof window !== 'undefined') {
			previewOverlayEnabled = localStorage.getItem('heroOverlayEnabled') !== 'false';
			previewOverlayIntensity = parseFloat(localStorage.getItem('heroOverlayIntensity') || '0.7');
			
			// Загружаем настройки изображений карточек
			Object.entries(cardImageSettings).forEach(([type, settings]) => {
				settings.height = parseInt(localStorage.getItem(`cardImageHeight_${type}`) || settings.height.toString());
				settings.width = parseInt(localStorage.getItem(`cardImageWidth_${type}`) || settings.width.toString());
			});
		}
	});

    async function loadLatest() {
        if (!$authStore.schoolId) return;
        latestLoading = true;
        latestError = '';
        try {
            const all = await apiClient.getNews($authStore.schoolId);
            latestNews = all
                .slice()
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 6);
            lastLoadedSchoolId = $authStore.schoolId;
        } catch (e) {
            latestError = e instanceof Error ? e.message : 'Не удалось загрузить новости';
        } finally {
            latestLoading = false;
        }
    }

    onMount(() => {
        if ($authStore.schoolId) loadLatest();
    });

    $: if ($authStore.schoolId && $authStore.schoolId !== lastLoadedSchoolId && !latestLoading) {
        loadLatest();
    }



	// Состояние для загрузки изображений
	let logoUploading = false;
	let emblemUploading = false;
	let logoUrl = '';
	let schoolEmblem = '';

	// Отслеживаем изменение состояния модального окна
	$: if (showSchoolSettings) {
		initializeImageValues();
	}

	// Валидация URL изображений
	let logoUrlValid = false;
	let emblemUrlValid = false;

	// Проверяем, можно ли сохранить настройки
	$: canSaveSettings = !logoUploading && !emblemUploading && 
		// Если есть URL логотипа, он должен быть валидным
		(logoUrl === '' || logoUrlValid) && 
		// Если есть URL эмблемы, он должен быть валидным
		(schoolEmblem === '' || emblemUrlValid);

	// Детальная информация о том, что блокирует сохранение
	$: saveBlockReason = (() => {
		// Приоритет 1: Загрузка
		if (logoUploading) return 'logo_uploading';
		if (emblemUploading) return 'emblem_uploading';
		
		// Приоритет 2: Валидация
		if (logoUrl && !logoUrlValid) return 'logo_invalid';
		if (schoolEmblem && !emblemUrlValid) return 'emblem_invalid';
		
		// Все готово
		return 'ready';
	})();

	// Детальная информация о состоянии каждого изображения
	$: logoStatus = logoUploading ? 'uploading' : (logoUrl ? (logoUrlValid ? 'valid' : 'invalid') : 'empty');
	$: emblemStatus = emblemUploading ? 'uploading' : (schoolEmblem ? (emblemUrlValid ? 'valid' : 'invalid') : 'empty');

	// Функция для получения понятного сообщения о состоянии
	function getStatusMessage() {
		// Сначала проверяем загрузку
		if (logoUploading) return 'Загрузка логотипа...';
		if (emblemUploading) return 'Загрузка эмблемы...';
		
		// Затем проверяем валидацию
		if (logoUrl && !logoUrlValid) return 'Проверка логотипа...';
		if (schoolEmblem && !emblemUrlValid) return 'Проверка эмблемы...';
		
		// Если все готово
		return 'Подготовка к сохранению...';
	}

	// Функция для получения детального статуса каждого изображения
	function getImageStatus() {
		const status = {
			logo: {
				uploading: logoUploading,
				validating: logoUrl && !logoUrlValid,
				ready: logoUrl && logoUrlValid,
				empty: !logoUrl
			},
			emblem: {
				uploading: emblemUploading,
				validating: schoolEmblem && !emblemUrlValid,
				ready: schoolEmblem && emblemUrlValid,
				empty: !schoolEmblem
			}
		};
		
		console.log('Image status:', status);
		return status;
	}

	// Отладочная информация для понимания состояния валидации
	$: {
		const imageStatus = getImageStatus();
		console.log('=== VALIDATION STATE ===');
		console.log('Logo:', {
			url: logoUrl || 'empty',
			status: logoStatus,
			valid: logoUrlValid,
			...imageStatus.logo
		});
		console.log('Emblem:', {
			url: schoolEmblem || 'empty',
			status: emblemStatus,
			valid: emblemUrlValid,
			...imageStatus.emblem
		});
		console.log('Save button:', {
			canSaveSettings,
			saveBlockReason,
			statusMessage: getStatusMessage()
		});
		console.log('=======================');
	}

	// Функция валидации URL изображения
	async function validateImageUrl(url: string): Promise<boolean> {
		if (!url) return false;
		
		// Проверяем, что это валидный URL
		try {
			new URL(url);
		} catch {
			console.log('Invalid URL format:', url);
			return false;
		}
		
		// Проверяем, что это URL от Digital Ocean Spaces
		if (!url.includes('digitaloceanspaces.com') && !url.includes('martiphoto')) {
			console.log('URL not from Digital Ocean Spaces:', url);
			return false;
		}
		
		try {
			const img = new Image();
			return new Promise((resolve) => {
				img.onload = () => {
					console.log('Image loaded successfully:', url);
					resolve(true);
				};
				img.onerror = () => {
					console.log('Image failed to load:', url);
					resolve(false);
				};
				img.src = url;
				// Таймаут на случай, если изображение не загружается
				setTimeout(() => {
					console.log('Image validation timeout:', url);
					resolve(false);
				}, 5000);
			});
		} catch (error) {
			console.log('Image validation error:', error);
			return false;
		}
	}

	// Обработчики изменения изображений
	function handleLogoChange(event: CustomEvent) {
		const newLogoUrl = event.detail.value;
		console.log('=== LOGO CHANGE ===');
		console.log('Previous logo URL:', logoUrl);
		console.log('New logo URL:', newLogoUrl);
		
		logoUrl = newLogoUrl;
		
		if (logoUrl) {
			console.log('Starting logo validation...');
			logoUrlValid = false;
			validateImageUrl(logoUrl).then(valid => {
				logoUrlValid = valid;
				console.log('Logo validation completed:', valid);
				console.log('Current logo status:', { logoUrl, logoUrlValid, logoUploading });
			});
		} else {
			console.log('Logo URL cleared, setting as valid');
			logoUrlValid = true; // Пустое значение считается валидным
		}
	}

	function handleEmblemChange(event: CustomEvent) {
		const newEmblemUrl = event.detail.value;
		console.log('=== EMBLEM CHANGE ===');
		console.log('Previous emblem URL:', schoolEmblem);
		console.log('New emblem URL:', newEmblemUrl);
		
		schoolEmblem = newEmblemUrl;
		
		if (schoolEmblem) {
			console.log('Starting emblem validation...');
			emblemUrlValid = false;
			validateImageUrl(schoolEmblem).then(valid => {
				emblemUrlValid = valid;
				console.log('Emblem validation completed:', valid);
				console.log('Current emblem status:', { schoolEmblem, emblemUrlValid, emblemUploading });
			});
		} else {
			console.log('Emblem URL cleared, setting as valid');
			emblemUrlValid = true; // Пустое значение считается валидным
		}
	}

	// Обработчики состояния загрузки
	function handleLogoUploading(event: CustomEvent) {
		const uploading = event.detail.uploading;
		console.log('=== LOGO UPLOADING ===');
		console.log('Logo uploading state changed to:', uploading);
		console.log('Previous state:', logoUploading);
		
		logoUploading = uploading;
		
		if (uploading) {
			console.log('Logo upload started, disabling save button');
		} else {
			console.log('Logo upload completed, re-evaluating save button state');
		}
	}

	function handleEmblemUploading(event: CustomEvent) {
		const uploading = event.detail.uploading;
		console.log('=== EMBLEM UPLOADING ===');
		console.log('Emblem uploading state changed to:', uploading);
		console.log('Previous state:', emblemUploading);
		
		emblemUploading = uploading;
		
		if (uploading) {
			console.log('Emblem upload started, disabling save button');
		} else {
			console.log('Emblem upload completed, re-evaluating save button state');
		}
	}

	// Обработчики ошибок загрузки
	function handleLogoError(event: CustomEvent) {
		logoUrl = '';
		logoUrlValid = true; // Пустое значение считается валидным
		schoolSettingsError = event.detail.message;
		console.log('Logo error:', event.detail.message);
	}

	function handleEmblemError(event: CustomEvent) {
		schoolEmblem = '';
		emblemUrlValid = true; // Пустое значение считается валидным
		schoolSettingsError = event.detail.message;
		console.log('Emblem error:', event.detail.message);
	}

	// Инициализация значений при открытии настроек
	function initializeImageValues() {
		logoUrl = $authStore.schoolData?.logoUrl || '';
		schoolEmblem = $authStore.schoolData?.schoolEmblem || '';
		
		// Валидируем существующие URL
		if (logoUrl) {
			validateImageUrl(logoUrl).then(valid => {
				logoUrlValid = valid;
			});
		} else {
			logoUrlValid = true; // Пустое значение считается валидным
		}
		
		if (schoolEmblem) {
			validateImageUrl(schoolEmblem).then(valid => {
				emblemUrlValid = valid;
			});
		} else {
			emblemUrlValid = true; // Пустое значение считается валидным
		}
		
		console.log('Initialized with:', { logoUrl, logoUrlValid, schoolEmblem, emblemUrlValid });
	}

	// Функция для обновления данных школы
	async function updateSchoolData(formData: FormData) {
		if (!$authStore.schoolId) return;
		
		schoolSettingsLoading = true;
		schoolSettingsError = '';
		schoolSettingsSuccess = '';
		
		try {
			const updateData = {
				nameRu: formData.get('nameRu') as string,
				nameKz: formData.get('nameKz') as string,
				email: formData.get('email') as string,
				addressRu: formData.get('addressRu') as string,
				addressKz: formData.get('addressKz') as string,
				logoUrl: logoUrl || undefined,
				schoolEmblem: schoolEmblem || undefined
			};

			await apiClient.updateSchool($authStore.schoolId, updateData);
			
			// Обновляем данные в authStore
			await authStore.loadSchoolData();
			
			schoolSettingsSuccess = 'Данные школы успешно обновлены!';
			setTimeout(() => {
				showSchoolSettings = false;
				schoolSettingsSuccess = '';
			}, 2000);
			
		} catch (error) {
			schoolSettingsError = error instanceof Error ? error.message : 'Ошибка обновления данных школы';
		} finally {
			schoolSettingsLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Главная - Школьная система</title>
</svelte:head>

<div class="dashboard">
    <div class="container">
        <!-- Hero Section -->
        <div class="hero-section">
            <div class="hero-frame">
                {#if $authStore.schoolData?.logoUrl}
                    <div class="hero-background" style="background-image: url('{$authStore.schoolData.logoUrl}')"></div>
                {:else}
                    <div class="hero-background" style="background-image: url('https://images.unsplash.com/photo-1523050854058-8df90110c9e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"></div>
                {/if}
                <div class="hero-overlay"></div>

                <div class="hero-content">
                    <div class="hero-text-overlay">
                        <div class="welcome-badge">
                            <span class="badge-icon">👋</span>
                            <span class="badge-text">Добро пожаловать</span>
                        </div>
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
                                    || 'Управляйте всеми аспектами школьной жизни'}
                            {:else}
                                Управляйте всеми аспектами школьной жизни
                            {/if}
                        </p>

                        <div class="hero-actions">
                            <a href="/school" class="cta-button primary">
                                <span>🏫</span>
                                Страница школы
                            </a>
                            <a href="/news" class="cta-button ghost">
                                <span>📰</span>
                                Все новости
                            </a>
    	
</div>
                </div>
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

			<div class="module-card">
				<div class="module-icon">⚙️</div>
				<div class="module-content">
					<h3 class="module-title">Настройки школы</h3>
					<p class="module-description">Обновить информацию о школе</p>
					<button class="module-link" on:click={() => showSchoolSettings = true}>
						Открыть настройки
					</button>
				</div>
			</div>

			<div class="module-card">
				<div class="module-icon">🖼️</div>
				<div class="module-content">
					<h3 class="module-title">Настройки изображений</h3>
					<p class="module-description">Настроить размеры изображений в карточках</p>
					<button class="module-link" on:click={() => showCardImageSettings = true}>
						Настроить изображения
					</button>
				</div>
			</div>
		</div>
	</div>


    <div class="news-section">
        <div class="section-header">
            <div class="section-icon">📰</div>
            <h2 class="section-title">Новости школы</h2>
            <p class="section-subtitle">Последние события и объявления</p>
        </div>

        {#if latestLoading}
            <div class="news-skeleton">
                <div class="skeleton-card"></div>
                <div class="skeleton-card"></div>
                <div class="skeleton-card"></div>
            </div>
        {:else if latestNews.length}
            <NewsSlider news={latestNews} autoPlayMs={6000} />
        {:else if latestError}
            <div class="news-error">{latestError}</div>
        {:else}
            <div class="news-empty">Новостей пока нет</div>
        {/if}
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
							<strong>Email</strong>
							<span>{$authStore.schoolData.email}</span>
						</div>
					</div>
					<div class="info-item">
						<div class="info-icon">🏫</div>
						<div class="info-content">
							<strong>Название</strong>
							<span>{$languageStore === 'ru' ? $authStore.schoolData.nameRu : $authStore.schoolData.nameKz}</span>
						</div>
					</div>
					{#if ($languageStore === 'ru' && $authStore.schoolData.addressRu) || ($languageStore === 'kz' && $authStore.schoolData.addressKz)}
						<div class="info-item">
							<div class="info-icon">📍</div>
							<div class="info-content">
								<strong>Адрес</strong>
								<span>{$languageStore === 'ru' ? $authStore.schoolData.addressRu : $authStore.schoolData.addressKz}</span>
							</div>
						</div>
					{/if}
					{#if ($languageStore === 'ru' && $authStore.schoolData.descriptionRu) || ($languageStore === 'kz' && $authStore.schoolData.descriptionKz)}
						<div class="info-item description-item">
							<div class="info-icon">📝</div>
							<div class="info-content">
								<strong>Описание</strong>
								<span>{$languageStore === 'ru' ? $authStore.schoolData.descriptionRu : $authStore.schoolData.descriptionKz}</span>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Модальное окно настроек школы -->
	{#if showSchoolSettings}
		<div 
			class="modal-overlay" 
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			on:click={() => showSchoolSettings = false}
			on:keydown={(e) => e.key === 'Escape' && (showSchoolSettings = false)}
			tabindex="-1"
		>
			<div class="modal-content" role="document" on:click|stopPropagation>
				<div class="modal-header">
					<h3 id="modal-title">Настройки школы</h3>
					<button class="modal-close" on:click={() => showSchoolSettings = false}>×</button>
				</div>
				
				<form on:submit|preventDefault={(e) => updateSchoolData(new FormData(e.currentTarget))}>
					<div class="form-grid" on:click|stopPropagation>
						<div class="form-group" on:click|stopPropagation>
							<label for="nameRu">Название школы (Русский)</label>
							<input 
								type="text" 
								id="nameRu" 
								name="nameRu" 
								value={$authStore.schoolData?.nameRu || ''} 
								required
							/>
						</div>
						
						<div class="form-group" on:click|stopPropagation>
							<label for="nameKz">Название школы (Казахский)</label>
							<input 
								type="text" 
								id="nameKz" 
								name="nameKz" 
								value={$authStore.schoolData?.nameKz || ''} 
								required
							/>
						</div>
						
						<div class="form-group" on:click|stopPropagation>
							<label for="email">Email школы</label>
							<input 
								type="email" 
								id="email" 
								name="email" 
								value={$authStore.schoolData?.email || ''} 
								required
							/>
						</div>
						
						<div class="form-group" on:click|stopPropagation>
							<label for="addressRu">Адрес (Русский)</label>
							<input 
								type="text" 
								id="addressRu" 
								name="addressRu" 
								value={$authStore.schoolData?.addressRu || ''} 
								required
							/>
						</div>
						
						<div class="form-group" on:click|stopPropagation>
							<label for="addressKz">Адрес (Казахский)</label>
							<input 
								type="text" 
								id="addressKz" 
								name="addressKz" 
								value={$authStore.schoolData?.addressKz || ''} 
								required
							/>
						</div>
						
						<div class="form-group" on:click|stopPropagation>
							<label for="logoUpload">Логотип школы</label>
							<ImageUpload
								bind:value={logoUrl}
								folder="school-logos"
								disabled={schoolSettingsLoading}
								on:change={handleLogoChange}
								on:uploading={handleLogoUploading}
								on:error={handleLogoError}
							/>
							{#if logoUrl && !logoUrlValid}
								<div class="validation-message error">
									⚠️ Проверка логотипа...
								</div>
							{/if}
							{#if logoUrl && logoUrlValid}
								<div class="validation-message success">
									✅ Логотип загружен и проверен
								</div>
							{/if}
						</div>
						
						<div class="form-group" on:click|stopPropagation>
							<label for="emblemUpload">Эмблема школы</label>
							<ImageUpload
								bind:value={schoolEmblem}
								folder="school-emblem"
								disabled={schoolSettingsLoading}
								on:change={handleEmblemChange}
								on:uploading={handleEmblemUploading}
								on:error={handleEmblemError}
							/>
							{#if schoolEmblem && !emblemUrlValid}
								<div class="validation-message error">
									⚠️ Проверка эмблемы...
								</div>
							{/if}
							{#if schoolEmblem && emblemUrlValid}
								<div class="validation-message success">
									✅ Эмблема загружена и проверена
								</div>
							{/if}
						</div>
						
						<div class="form-group" on:click|stopPropagation>
							<label for="heroOverlayEnabled">Затемнение фонового фото</label>
							<select 
								id="heroOverlayEnabled" 
								name="heroOverlayEnabled"
								bind:value={previewOverlayEnabled}
								on:change={(e) => {
									if (e.currentTarget.value === 'false') {
										previewOverlayIntensity = 0;
									} else {
										previewOverlayIntensity = parseFloat(localStorage.getItem('heroOverlayIntensity') || '0.7');
									}
									updateLocalStorage();
								}}
							>
								<option value="true">Включено</option>
								<option value="false">Выключено</option>
							</select>
							<small class="form-help">Настройки затемнения сохраняются локально в браузере</small>
						</div>
						
						<div class="form-group" on:click|stopPropagation>
							<label for="heroOverlayIntensity">Интенсивность затемнения</label>
							<input 
								type="range" 
								id="heroOverlayIntensity" 
								name="heroOverlayIntensity" 
								min="0.1" 
								max="0.9" 
								step="0.1"
								bind:value={previewOverlayIntensity}
								on:input={(e) => {
									previewOverlayIntensity = parseFloat(e.currentTarget.value);
									updateLocalStorage();
								}}
							/>
							<div class="range-value">
								<span>Слабое</span>
								<span>Сильное</span>
							</div>
							<div class="overlay-preview">
								<div class="preview-label">Предварительный просмотр:</div>
								<div class="preview-box">
									{#if previewOverlayEnabled}
										<div 
											class="preview-overlay" 
											style="opacity: {previewOverlayIntensity};"
										></div>
									{/if}
									<div class="preview-text">Текст</div>
								</div>
								<div class="preview-actions">
									<button 
										type="button" 
										class="btn-secondary btn-sm" 
										on:click={() => {
											updateLocalStorage();
											// Перезагружаем страницу для применения настроек
											window.location.reload();
										}}
									>
										Применить настройки
									</button>
								</div>
							</div>
						</div>
					</div>
					
					{#if schoolSettingsError}
						<div class="error-message" on:click|stopPropagation>{schoolSettingsError}</div>
					{/if}
					
					{#if schoolSettingsSuccess}
						<div class="success-message" on:click|stopPropagation>{schoolSettingsSuccess}</div>
					{/if}
					
					<div class="form-actions" on:click|stopPropagation>
						<button type="button" class="btn-secondary" on:click={() => showSchoolSettings = false}>
							Отмена
						</button>
						<button type="submit" class="btn-primary" disabled={!canSaveSettings || schoolSettingsLoading}>
							{#if schoolSettingsLoading}
								Сохранение...
							{:else if !canSaveSettings}
								{getStatusMessage()}
							{:else}
								Сохранить
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Модальное окно настроек изображений карточек -->
	{#if showCardImageSettings}
		<div 
			class="modal-overlay" 
			role="dialog"
			aria-modal="true"
			aria-labelledby="card-settings-title"
			on:click={() => showCardImageSettings = false}
			on:keydown={(e) => e.key === 'Escape' && (showCardImageSettings = false)}
			tabindex="-1"
		>
			<div class="modal-content" role="document">
				<div class="modal-header">
					<h3 id="card-settings-title">Настройки изображений карточек</h3>
					<button class="modal-close" on:click={() => showCardImageSettings = false}>×</button>
				</div>
				
				<div class="card-image-settings">
					<div class="settings-section">
						<h4>Новости</h4>
						<div class="size-controls">
							<div class="size-control">
								<label for="news-height">Высота (px):</label>
								<input 
									id="news-height"
									type="number" 
									min="100" 
									max="500" 
									bind:value={cardImageSettings.news.height}
									on:change={updateLocalStorage}
								/>
							</div>
							<div class="size-control">
								<label for="news-width">Ширина (%):</label>
								<input 
									id="news-width"
									type="number" 
									min="50" 
									max="100" 
									bind:value={cardImageSettings.news.width}
									on:change={updateLocalStorage}
								/>
							</div>
						</div>
						<button 
							type="button" 
							class="btn-reset" 
							on:click={() => resetCardImageSettings('news')}
						>
							🔄 Сбросить по умолчанию
						</button>
					</div>

					<div class="settings-section">
						<h4>Учителя</h4>
						<div class="size-controls">
							<div class="size-control">
								<label for="teacher-height">Высота (px):</label>
								<input 
									id="teacher-height"
									type="number" 
									min="100" 
									max="500" 
									bind:value={cardImageSettings.teacher.height}
									on:change={updateLocalStorage}
								/>
							</div>
							<div class="size-control">
								<label for="teacher-width">Ширина (%):</label>
								<input 
									id="teacher-width"
									type="number" 
									min="50" 
									max="100" 
									bind:value={cardImageSettings.teacher.width}
									on:change={updateLocalStorage}
								/>
							</div>
						</div>
						<button 
							type="button" 
							class="btn-reset" 
							on:click={() => resetCardImageSettings('teacher')}
						>
							🔄 Сбросить по умолчанию
						</button>
					</div>

					<div class="settings-section">
						<h4>Доска почета</h4>
						<div class="size-controls">
							<div class="size-control">
								<label for="honor-board-height">Высота (px):</label>
								<input 
									id="honor-board-height"
									type="number" 
									min="100" 
									max="500" 
									bind:value={cardImageSettings['honor-board'].height}
									on:change={updateLocalStorage}
								/>
							</div>
							<div class="size-control">
								<label for="honor-board-width">Ширина (%):</label>
								<input 
									id="honor-board-width"
									type="number" 
									min="50" 
									max="100" 
									bind:value={cardImageSettings['honor-board'].width}
									on:change={updateLocalStorage}
								/>
							</div>
						</div>
						<button 
							type="button" 
							class="btn-reset" 
							on:click={() => resetCardImageSettings('honor-board')}
						>
							🔄 Сбросить по умолчанию
						</button>
					</div>

					<div class="settings-section">
						<h4>Секции</h4>
						<div class="size-controls">
							<div class="size-control">
								<label for="section-height">Высота (px):</label>
								<input 
									id="section-height"
									type="number" 
									min="100" 
									max="500" 
									bind:value={cardImageSettings.section.height}
									on:change={updateLocalStorage}
								/>
							</div>
							<div class="size-control">
								<label for="section-width">Ширина (%):</label>
								<input 
									id="section-width"
									type="number" 
									min="50" 
									max="100" 
									bind:value={cardImageSettings.section.width}
									on:change={updateLocalStorage}
								/>
							</div>
						</div>
						<button 
							type="button" 
							class="btn-reset" 
							on:click={() => resetCardImageSettings('section')}
						>
							🔄 Сбросить по умолчанию
						</button>
					</div>

					<div class="settings-section">
						<h4>Столовая</h4>
						<div class="size-controls">
							<div class="size-control">
								<label for="canteen-height">Высота (px):</label>
								<input 
									id="canteen-height"
									type="number" 
									min="100" 
									max="500" 
									bind:value={cardImageSettings.canteen.height}
									on:change={updateLocalStorage}
								/>
							</div>
							<div class="size-control">
								<label for="canteen-width">Ширина (%):</label>
								<input 
									id="canteen-width"
									type="number" 
									min="50" 
									max="100" 
									bind:value={cardImageSettings.canteen.width}
									on:change={updateLocalStorage}
								/>
							</div>
						</div>
						<button 
							type="button" 
							class="btn-reset" 
							on:click={() => resetCardImageSettings('canteen')}
						>
							🔄 Сбросить по умолчанию
						</button>
					</div>

					<div class="preview-section">
						<h4>Предварительный просмотр</h4>
						<div class="preview-cards">
							<div class="preview-card">
								<div class="preview-image" style="height: {cardImageSettings.news.height}px; width: {cardImageSettings.news.width}%;">
									<div class="preview-placeholder">📰</div>
								</div>
								<div class="preview-content">
									<div class="preview-title">Новость</div>
									<div class="preview-text">Пример карточки</div>
								</div>
							</div>
							<div class="preview-card">
								<div class="preview-image" style="height: {cardImageSettings.teacher.height}px; width: {cardImageSettings.teacher.width}%;">
									<div class="preview-placeholder">👨‍🏫</div>
								</div>
								<div class="preview-content">
									<div class="preview-title">Учитель</div>
									<div class="preview-text">Пример карточки</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="form-actions">
					<button 
						type="button" 
						class="btn-reset-all" 
						on:click={() => resetCardImageSettings('all')}
					>
						🔄 Сбросить все настройки
					</button>
					<button type="button" class="btn-secondary" on:click={() => showCardImageSettings = false}>
						Закрыть
					</button>
				</div>
			</div>
		</div>
	{/if}
	</div>
</div>

<style>
    .dashboard {
        min-height: 100vh;
        background: hsl(var(--background));
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
        padding: 3rem 0 4rem 0;
        margin-bottom: 4rem;
        width: 100%;
    }

    .hero-frame {
        position: relative;
        border-radius: 20px;
        overflow: hidden;
        height: 440px;
        box-shadow: var(--shadow-xl);
        border: 1px solid hsl(var(--border));
        background: transparent;
    }

	.hero-background {
        position: absolute;
        inset: 0;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
	}

	.hero-overlay {
		position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.5) 100%);
	}

	.hero-content {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        padding: 2rem;
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
        font-size: 3.25rem;
        font-weight: 800;
        color: white;
        margin: 0 0 1rem 0;
        line-height: 1.1;
        text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    }

    .hero-subtitle {
        font-size: 1.125rem;
        color: rgba(255, 255, 255, 0.95);
        margin: 0 0 1.25rem 0;
        line-height: 1.6;
        max-width: 700px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
    }

    .hero-actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        margin-top: 0.25rem;
    }

    .cta-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.1rem;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.95rem;
        text-decoration: none;
        transition: all 0.25s ease;
        box-shadow: var(--shadow-md);
        border: 1px solid transparent;
        backdrop-filter: blur(8px);
    }

    .cta-button.primary {
        background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(262 83% 68%) 100%);
        color: hsl(var(--primary-foreground));
    }

    .cta-button.ghost {
        background: rgba(255,255,255,0.12);
        color: white;
        border-color: rgba(255,255,255,0.2);
    }

    .cta-button:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
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
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
        margin: 2rem 0 1.25rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid hsl(var(--border));
    }

    .section-icon {
        display: none;
    }

    .section-title {
        position: relative;
        margin: 0;
        padding-left: 0.75rem;
        font-size: 1.75rem;
        line-height: 1.2;
        font-weight: 800;
        color: hsl(var(--foreground));
    }

    .section-title::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.2rem;
        bottom: 0.2rem;
        width: 4px;
        border-radius: 9999px;
        background: linear-gradient(180deg, hsl(var(--primary)), hsl(262 83% 68%));
    }

    :global(.dark) .section-title {
        background: linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--primary)) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        color: transparent;
    }

    .section-subtitle {
        font-size: 0.975rem;
        color: hsl(var(--muted-foreground));
        margin: 0;
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
    .modules-section { padding-bottom: 2rem; }
    .news-section { padding: 1rem 0 3rem 0; }

    .modules-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1rem;
        max-width: 1210px;
        margin: 0 auto;
    }

    /* News skeleton */
    .news-skeleton {
        display: grid;
        		grid-template-columns: repeat(3, 320px);
		justify-content: start;
        gap: 1rem;
    }
    .skeleton-card {
        height: 220px;
        border-radius: 16px;
        background: linear-gradient(90deg, hsl(var(--muted) / 0.5), hsl(var(--muted)), hsl(var(--muted) / 0.5));
        background-size: 200% 100%;
        animation: shimmer 1.2s infinite;
        border: 1px solid hsl(var(--border));
    }

    @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }

    .news-error { color: hsl(var(--destructive)); }
    .news-empty { color: hsl(var(--muted-foreground)); }

    .module-card {
        position: relative;
        background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted) / 0.25) 100%);
        border-radius: 16px;
        padding: 1.25rem;
        box-shadow: var(--shadow-md);
        border: 1px solid hsl(var(--border));
        transition: transform 0.25s ease, box-shadow 0.25s ease;
        display: flex;
        align-items: flex-start;
        gap: 0.9rem;
        overflow: hidden;
    }

    .module-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 3px;
        background: linear-gradient(90deg, hsl(var(--primary)), hsl(262 83% 68%));
        opacity: 0;
        transition: opacity 0.25s ease;
    }

    .module-card:hover::before { opacity: 1; }

    .module-card:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-lg);
        border-color: hsl(var(--primary) / 0.3);
    }

    .module-icon {
        font-size: 1.25rem;
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, hsl(var(--primary) / 0.12) 0%, hsl(262 83% 68% / 0.12) 100%);
        border: 1px solid hsl(var(--border));
    }

	.module-content {
		flex: 1;
	}

    .module-title {
        font-size: 1.05rem;
        font-weight: 700;
        color: hsl(var(--foreground));
        margin: 0 0 0.35rem 0;
    }

    .module-description {
        color: hsl(var(--muted-foreground));
        margin: 0 0 0.75rem 0;
        line-height: 1.45;
        font-size: 0.95rem;
    }

    .module-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        color: hsl(var(--primary));
        text-decoration: none;
        font-weight: 600;
        transition: all 0.2s ease;
    }

    .module-link:hover { color: hsl(262 83% 68%); }

	/* Validation Messages */
	.validation-message {
		margin-top: 0.5rem;
		padding: 0.5rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.validation-message.error {
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.2);
		color: #dc2626;
	}

	.validation-message.success {
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.2);
		color: #16a34a;
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

        .modules-section { padding-bottom: 2rem; }

        .modules-grid { grid-template-columns: 1fr; }

        .module-card { padding: 1.25rem; }
	}

	/* Модальное окно настроек школы */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-content {
		background: hsl(var(--background));
		border-radius: 12px;
		padding: 1.5rem;
		max-width: 600px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		border: 1px solid hsl(var(--border));
		box-shadow: var(--shadow-xl);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid hsl(var(--border));
	}

	.modal-header h3 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: hsl(var(--foreground));
	}

	.modal-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: hsl(var(--muted-foreground));
		padding: 0.25rem;
		border-radius: 4px;
		transition: all 0.2s ease;
	}

	.modal-close:hover {
		background: hsl(var(--muted) / 0.1);
		color: hsl(var(--foreground));
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
	}

	.form-group label {
		font-size: 0.875rem;
		font-weight: 500;
		color: hsl(var(--foreground));
		margin-bottom: 0.5rem;
	}

	.form-group input {
		padding: 0.5rem;
		border: 1px solid hsl(var(--border));
		border-radius: 6px;
		font-size: 0.875rem;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		transition: border-color 0.2s ease;
	}

	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: hsl(var(--primary));
	}
	
	.form-help {
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
		margin-top: 0.25rem;
		display: block;
	}
	
	.form-group select {
		padding: 0.5rem;
		border: 1px solid hsl(var(--border));
		border-radius: 6px;
		font-size: 0.875rem;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		transition: border-color 0.2s ease;
		cursor: pointer;
	}
	
	.range-value {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
		margin-top: 0.25rem;
	}
	
	.form-group input[type="range"] {
		width: 100%;
		height: 6px;
		border-radius: 3px;
		background: hsl(var(--muted));
		outline: none;
		cursor: pointer;
		-webkit-appearance: none;
	}
	
	.form-group input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: hsl(var(--primary));
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}
	
	.form-group input[type="range"]::-moz-range-thumb {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: hsl(var(--primary));
		cursor: pointer;
		border: none;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}
	
	.overlay-preview {
		margin-top: 1rem;
		padding: 1rem;
		background: hsl(var(--muted) / 0.1);
		border-radius: 8px;
		border: 1px solid hsl(var(--border));
	}
	
	.preview-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: hsl(var(--foreground));
		margin-bottom: 0.75rem;
	}
	
	.preview-box {
		position: relative;
		height: 60px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 8px;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.preview-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to bottom, 
			rgba(15, 23, 42, 1) 0%, 
			rgba(15, 23, 42, 0.8) 50%,
			rgba(2, 6, 23, 1) 100%);
		pointer-events: none;
	}
	
	.preview-text {
		position: relative;
		z-index: 2;
		color: white;
		font-weight: 600;
		font-size: 0.875rem;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}
	
	.preview-actions {
		margin-top: 1rem;
		text-align: center;
	}
	
	.btn-sm {
		padding: 0.375rem 0.75rem;
		font-size: 0.8rem;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		padding-top: 1rem;
		border-top: 1px solid hsl(var(--border));
	}

	.btn-primary, .btn-secondary {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
	}

	.btn-primary {
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
	}

	.btn-primary:hover:not(:disabled) {
		background: hsl(var(--primary) / 0.9);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: hsl(var(--muted));
		color: hsl(var(--muted-foreground));
	}

	.btn-secondary:hover {
		background: hsl(var(--muted) / 0.8);
	}

	.error-message {
		background: hsl(var(--destructive) / 0.1);
		color: hsl(var(--destructive));
		padding: 0.75rem;
		border-radius: 6px;
		margin-bottom: 1rem;
		border: 1px solid hsl(var(--destructive) / 0.2);
	}

	.success-message {
		background: hsl(var(--success) / 0.1);
		color: hsl(var(--success));
		padding: 0.75rem;
		border-radius: 6px;
		margin-bottom: 1rem;
		border: 1px solid hsl(var(--success) / 0.2);
	}

	/* Стили для настроек изображений карточек */
	.card-image-settings {
		max-height: 70vh;
		overflow-y: auto;
		padding-right: 0.5rem;
	}

	.settings-section {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: hsl(var(--muted) / 0.05);
		border-radius: 8px;
		border: 1px solid hsl(var(--border));
	}

	.settings-section h4 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: hsl(var(--foreground));
	}

	.size-controls {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.size-control {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.size-control label {
		font-size: 0.875rem;
		font-weight: 500;
		color: hsl(var(--muted-foreground));
	}

	.size-control input {
		padding: 0.5rem;
		border: 1px solid hsl(var(--border));
		border-radius: 6px;
		font-size: 0.875rem;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
	}

	.size-control input:focus {
		outline: none;
		border-color: hsl(var(--ring));
		box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
	}

	.preview-section {
		margin-top: 2rem;
		padding: 1.5rem;
		background: hsl(var(--muted) / 0.05);
		border-radius: 8px;
		border: 1px solid hsl(var(--border));
	}

	.preview-section h4 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: hsl(var(--foreground));
	}

	.preview-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.preview-card {
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 8px;
		overflow: hidden;
		box-shadow: var(--shadow-sm);
	}

	.preview-image {
		background: hsl(var(--muted) / 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 1px solid hsl(var(--border));
	}

	.preview-placeholder {
		font-size: 2rem;
		opacity: 0.6;
	}

	.preview-content {
		padding: 1rem;
	}

	.preview-title {
		font-weight: 600;
		color: hsl(var(--foreground));
		margin-bottom: 0.5rem;
	}

	.preview-text {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
	}

	/* Стили для кнопок сброса */
	.btn-reset {
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		background: hsl(var(--muted));
		color: hsl(var(--muted-foreground));
		border: 1px solid hsl(var(--border));
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
	}

	.btn-reset:hover {
		background: hsl(var(--muted) / 0.8);
		border-color: hsl(var(--ring));
	}

	.btn-reset-all {
		padding: 0.75rem 1.5rem;
		background: hsl(var(--destructive) / 0.1);
		color: hsl(var(--destructive));
		border: 1px solid hsl(var(--destructive) / 0.2);
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-reset-all:hover {
		background: hsl(var(--destructive) / 0.2);
		border-color: hsl(var(--destructive) / 0.4);
	}

	@media (max-width: 1200px) {
		.news-skeleton {
			grid-template-columns: repeat(2, 320px);
		}
	}
	
	@media (max-width: 768px) {
		.form-grid {
			grid-template-columns: 1fr;
		}
		
		.modal-content {
			padding: 1rem;
		}
		
		.news-skeleton {
			grid-template-columns: 1fr;
			max-width: 400px;
			margin: 0 auto;
		}
	}
</style>
