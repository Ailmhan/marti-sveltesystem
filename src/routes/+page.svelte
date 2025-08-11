<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { languageStore } from '$lib/stores/language';
    import { apiClient } from '$lib/api/client';
    import type { News, School } from '$lib/types/api';
    import NewsSlider from '$lib/components/NewsSlider.svelte';
    import EditModal from '$lib/components/EditModal.svelte';
    import ImageUpload from '$lib/components/ImageUpload.svelte';
    import { adminStore } from '$lib/stores/admin';

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

    // School edit state
    let showEditSchoolModal = false;
    let editSchoolModalError = '';
    let editSchoolModalLoading = false;

    let editSchoolData = {
        nameRu: '',
        nameKz: '',
        email: '',
        addressRu: '',
        addressKz: '',
        descriptionRu: '',
        descriptionKz: '',
        logoUrl: undefined as string | undefined
    };

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

    // School edit functions
    function openEditSchoolModal() {
        if ($authStore.schoolData) {
            editSchoolData = {
                nameRu: $authStore.schoolData.nameRu || '',
                nameKz: $authStore.schoolData.nameKz || '',
                email: $authStore.schoolData.email || '',
                addressRu: $authStore.schoolData.addressRu || '',
                addressKz: $authStore.schoolData.addressKz || '',
                descriptionRu: $authStore.schoolData.descriptionRu || '',
                descriptionKz: $authStore.schoolData.descriptionKz || '',
                logoUrl: $authStore.schoolData.logoUrl
            };
            showEditSchoolModal = true;
            editSchoolModalError = '';
        }
    }

    function closeEditSchoolModal() {
        showEditSchoolModal = false;
        editSchoolModalError = '';
        editSchoolModalLoading = false;
        editSchoolData = {
            nameRu: '',
            nameKz: '',
            email: '',
            addressRu: '',
            addressKz: '',
            descriptionRu: '',
            descriptionKz: '',
            logoUrl: undefined
        };
    }

    async function updateSchoolData() {
        if (!$authStore.schoolData?.id) {
            editSchoolModalError = 'Ошибка: ID школы не найден';
            return;
        }

        // Валидация
        if (!editSchoolData.nameRu.trim() || !editSchoolData.nameKz.trim() || !editSchoolData.email.trim()) {
            editSchoolModalError = 'Название школы и email обязательны для заполнения';
            return;
        }

        try {
            editSchoolModalError = '';
            editSchoolModalLoading = true;
            
            const updatedSchool = await apiClient.updateSchool($authStore.schoolData.id, editSchoolData);
            
            // Обновляем данные в authStore
            authStore.updateSchoolData(updatedSchool);
            
            // Закрываем модальное окно после успешного сохранения
            closeEditSchoolModal();
        } catch (err) {
            console.error('Error updating school data:', err);
            editSchoolModalError = err instanceof Error ? err.message : 'Ошибка обновления данных школы';
            editSchoolModalLoading = false;
        }
    }

    function handleEditImageChange(event: CustomEvent) {
        const url = event.detail.value;
        if (url) {
            editSchoolData.logoUrl = url;
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
				{#if $adminStore.isAdminMode}
					<button class="btn btn-edit" on:click={openEditSchoolModal}>
						<span class="btn-icon">✏️</span>
						Редактировать
					</button>
				{/if}
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

<!-- Модальное окно редактирования данных школы -->
<EditModal
	bind:open={showEditSchoolModal}
	title="Редактировать информацию о школе"
	loading={editSchoolModalLoading}
	on:close={closeEditSchoolModal}
	on:submit={updateSchoolData}
>
	<div class="space-y-4">
		{#if editSchoolModalError}
			<div class="alert alert-error">
				{editSchoolModalError}
			</div>
		{/if}

		<div>
			<label for="editNameRu" class="block text-sm font-medium mb-2 text-gray-700">
				Название школы (Русский) *
			</label>
			<input
				id="editNameRu"
				type="text"
				bind:value={editSchoolData.nameRu}
				required
				placeholder="Введите название школы на русском языке"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="editNameKz" class="block text-sm font-medium mb-2 text-gray-700">
				Название школы (Казахский) *
			</label>
			<input
				id="editNameKz"
				type="text"
				bind:value={editSchoolData.nameKz}
				required
				placeholder="Введите название школы на казахском языке"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="editEmail" class="block text-sm font-medium mb-2 text-gray-700">
				Email школы *
			</label>
			<input
				id="editEmail"
				type="email"
				bind:value={editSchoolData.email}
				required
				placeholder="school@example.com"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="editAddressRu" class="block text-sm font-medium mb-2 text-gray-700">
				Адрес (Русский)
			</label>
			<input
				id="editAddressRu"
				type="text"
				bind:value={editSchoolData.addressRu}
				placeholder="Введите адрес на русском языке"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="editAddressKz" class="block text-sm font-medium mb-2 text-gray-700">
				Адрес (Казахский)
			</label>
			<input
				id="editAddressKz"
				type="text"
				bind:value={editSchoolData.addressKz}
				placeholder="Введите адрес на казахском языке"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="editDescriptionRu" class="block text-sm font-medium mb-2 text-gray-700">
				Описание (Русский)
			</label>
			<textarea
				id="editDescriptionRu"
				bind:value={editSchoolData.descriptionRu}
				rows={3}
				placeholder="Введите описание школы на русском языке"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			></textarea>
		</div>

		<div>
			<label for="editDescriptionKz" class="block text-sm font-medium mb-2 text-gray-700">
				Описание (Казахский)
			</label>
			<textarea
				id="editDescriptionKz"
				bind:value={editSchoolData.descriptionKz}
				rows={3}
				placeholder="Введите описание школы на казахском языке"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			></textarea>
		</div>

		<div>
			<label for="edit-school-logo-upload" class="block text-sm font-medium mb-2 text-gray-700">
				Логотип школы
			</label>
			<ImageUpload
				id="edit-school-logo-upload"
				bind:value={editSchoolData.logoUrl}
				folder="school"
				on:change={handleEditImageChange}
				on:error={(event) => {
					editSchoolModalError = event.detail.message;
				}}
				on:success={(event) => {
					editSchoolModalError = '';
				}}
			/>
		</div>
	</div>
</EditModal>

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
        position: relative;
    }

    .btn-edit {
        position: absolute;
        top: 0;
        right: 0;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1.2rem;
        background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(262 83% 68%) 100%);
        color: hsl(var(--primary-foreground));
        border: none;
        border-radius: 0.6rem;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: var(--shadow-md);
        border: 1px solid hsl(var(--ring) / 0.3);
    }

    .btn-edit:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
    }

    .btn-icon {
        font-size: 1rem;
    }

    .alert {
        padding: 0.75rem 1rem;
        border-radius: 6px;
        margin-bottom: 1.5rem;
        font-weight: 500;
    }

    .alert-error {
        background-color: hsl(var(--destructive) / 0.1);
        color: hsl(var(--destructive));
        border: 1px solid hsl(var(--destructive) / 0.3);
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
        grid-template-columns: repeat(3, 1fr);
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

        .btn-edit {
            position: static;
            margin-top: 1rem;
            align-self: flex-start;
        }
	}
</style>
