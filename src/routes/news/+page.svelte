<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import { authStore } from '$lib/stores/auth';
	import { adminStore } from '$lib/stores/admin';
	import type { News } from '$lib/types/api';
	import DataModal from '$lib/components/DataModal.svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import DataCard from '$lib/components/DataCard.svelte';
	import DataPage from '$lib/components/DataPage.svelte';
	import Schedule from '$lib/components/Schedule.svelte';
	import { languageStore } from '$lib/stores/language';
	import { useImageValidation } from '$lib/hooks/useImageValidation';
	import { 
		searchItems, 
		sortItems, 
		getNewsSortOptions 
	} from '$lib/utils/filters';
	import type { ScheduleEvent } from '$lib/types/ui';

	let news: News[] = [];
	let filteredNews: News[] = [];
	let loading = false;
	let error = '';
	let showAddModal = false;
	let modalError = '';
	let modalLoading = false;
	let currentView: 'grid' | 'list' | 'calendar' = 'grid';
	let sortBy = '';

	// Состояние для редактирования
	let showEditModal = false;
	let editingNews: News | null = null;
	let editForm = {
		titleRu: '',
		titleKz: '',
		contentRu: '',
		contentKz: '',
		imageUrl: '' as string | undefined
	};

	// Валидация изображения для редактирования
	let editImageValidation: ReturnType<typeof useImageValidation> | null = null;

	// Состояние для загрузки изображений
	let imageUploading = false;

	let newNews = {
		titleRu: '',
		titleKz: '',
		contentRu: '',
		contentKz: '',
		imageUrl: '' as string | undefined
	};

	// Валидация изображения для добавления
	const addImageValidation = useImageValidation('', newNews.imageUrl || '');

	onMount(() => {
		loadNews();
	});

	// Реактивная сортировка (поиск теперь в хедере)
	$: filteredNews = news.length > 0 ? news : [];

	$: filteredNews = sortBy ? 
		sortItems(filteredNews, sortBy, getNewsSortOptions()) :
		filteredNews;

	// Генерация событий для расписания
	$: scheduleEvents = filteredNews.map(item => ({
		id: item.id,
		title: item.titleRu || item.titleKz,
		date: new Date(item.createdAt),
		description: item.contentRu || item.contentKz,
		type: 'news' as const,
		color: '#6366f1'
	}));

	async function loadNews() {
		if (!$authStore.schoolId) return;
		
		try {
			loading = true;
			error = '';
			const newsData = await apiClient.getNews($authStore.schoolId);
			news = newsData;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка загрузки новостей';
		} finally {
			loading = false;
		}
	}

	async function addNews() {
		if (!newNews.titleRu || !newNews.contentRu) {
			modalError = 'Пожалуйста, заполните обязательные поля';
			return;
		}

		modalLoading = true;
		modalError = '';

		try {
			await apiClient.createNews({
				...newNews,
				schoolId: 10
			});
			
			await loadNews();
			closeModal();
		} catch (err) {
			modalError = err instanceof Error ? err.message : 'Ошибка создания новости';
		} finally {
			modalLoading = false;
		}
	}

	async function updateNews() {
		if (!editingNews || !editForm.titleRu || !editForm.contentRu) {
			modalError = 'Пожалуйста, заполните обязательные поля';
			return;
		}

		modalLoading = true;
		modalError = '';

		try {
			await apiClient.updateNews(editingNews.id, {
				...editForm,
				schoolId: 10
			});
			
			await loadNews();
			closeEditModal();
		} catch (err) {
			modalError = err instanceof Error ? err.message : 'Ошибка обновления новости';
		} finally {
			modalLoading = false;
		}
	}

	function openModal() {
		showAddModal = true;
		modalError = '';
	}

	function closeModal() {
		showAddModal = false;
		modalError = '';
		modalLoading = false;
		newNews = {
			titleRu: '',
			titleKz: '',
			contentRu: '',
			contentKz: '',
			imageUrl: undefined
		};
		
		// Сбрасываем валидацию
		addImageValidation.resetValidation();
	}

	function editNews(news: News) {
		editingNews = news;
		editForm = {
			titleRu: news.titleRu || '',
			titleKz: news.titleKz || '',
			contentRu: news.contentRu || '',
			contentKz: news.contentKz || '',
			imageUrl: news.imageUrl || ''
		};
		
		// Инициализируем валидацию для редактирования
		editImageValidation = useImageValidation(news.imageUrl || '', editForm.imageUrl || '');
		
		showEditModal = true;
		modalError = '';
	}

	function closeEditModal() {
		showEditModal = false;
		editingNews = null;
		modalError = '';
		
		// Сбрасываем валидацию
		if (editImageValidation) {
			editImageValidation.resetValidation();
			editImageValidation = null;
		}
	}

	async function handleImageChange(event: CustomEvent) {
		const url = event.detail.value;
		if (url) {
			newNews.imageUrl = url;
			// Валидируем новое изображение
			await addImageValidation.validateCurrentImage();
		}
	}

	async function handleEditImageChange(event: CustomEvent) {
		const url = event.detail.value;
		if (url && editImageValidation) {
			editForm.imageUrl = url;
			// Валидируем новое изображение
			await editImageValidation.validateCurrentImage();
		}
	}

	function formatDate(date: string | Date) {
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		return dateObj.toLocaleDateString('ru-RU', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	async function deleteNews(id: number) {
		if (confirm('Вы уверены, что хотите удалить эту новость?')) {
			try {
				await apiClient.deleteNews(id);
				await loadNews();
			} catch (err) {
				error = err instanceof Error ? err.message : 'Ошибка удаления новости';
			}
		}
	}
</script>

<svelte:head>
	<title>{$languageStore === 'kz' ? 'Жаңалықтар - Мектеп жүйесі' : 'Новости - Школьная система'}</title>
</svelte:head>

		<DataPage
	title={$languageStore === 'kz' ? 'Мектеп жаңалықтары' : 'Новости школы'}
			{loading}
			{error}
			showSearch={false}
			showFilters={false}
			showViewToggle={true}
			showSort={true}
			filters={[]}
			sortOptions={getNewsSortOptions()}
			on:sort={(event) => sortBy = event.detail}
			on:viewChange={(event) => currentView = event.detail}
			on:retry={loadNews}
			let:pageState
		>
	<svelte:fragment slot="actions">
		{#if $adminStore.isAdminMode}
		<button class="btn btn-primary add-btn btn-modern" on:click={openModal}>
			<span class="btn-icon">➕</span>
			Добавить новость
		</button>
		{/if}
	</svelte:fragment>

	<svelte:fragment slot="default">
		{#if !$adminStore.isAdminMode}
			<div class="admin-info-compact">
				<span class="admin-info-icon">🔐</span>
				<span class="admin-info-text">Войдите в режим администратора для управления данными</span>
			</div>
		{/if}
		
		{#if filteredNews.length > 0}
			{#if currentView === 'grid'}
                <div class="grid-container grid-3">
                    {#each filteredNews as item}
                            <DataCard
                                data={item}
                                type="news"
                            language={$languageStore}
                            showActions={$adminStore.isAdminMode}
                            onEdit={() => editNews(item)}
                            onDelete={$adminStore.isAdminMode ? () => deleteNews(item.id) : undefined}
                        />
                    {/each}
                </div>
			{:else if currentView === 'list'}
                <div class="list-container">
                    {#each filteredNews as item}
                        <div class="list-item">
                                <DataCard
                                    data={item}
                                    type="news"
                                language={$languageStore}
                                showActions={$adminStore.isAdminMode}
                                onEdit={() => editNews(item)}
                                onDelete={$adminStore.isAdminMode ? () => deleteNews(item.id) : undefined}
                            />
                        </div>
                    {/each}
                </div>
						{:else if currentView === 'calendar'}
				<Schedule
					schedule={[]}
					on:itemClick={(event) => {
						console.log('Schedule item clicked:', event.detail);
					}}
					on:dateSelect={(event) => {
						console.log('Date selected:', event.detail);
					}}
					on:viewChange={(event) => {
						console.log('View changed:', event.detail);
					}}
				/>
			{/if}
		{:else if news.length > 0}
			<EmptyState
				title="Новости не найдены"
				description="Попробуйте изменить параметры сортировки"
				icon="🔍"
				buttonText="Очистить сортировку"
				onAction={() => {
					sortBy = '';
				}}
			/>
		{:else}
			<EmptyState
				title="Новостей пока нет"
				description="Добавьте первую новость в систему!"
				icon="📰"
				buttonText="Добавить новость"
				onAction={openModal}
			/>
		{/if}
	</svelte:fragment>
</DataPage>

<!-- Модальное окно добавления новости -->
<DataModal
	bind:open={showAddModal}
	title="Добавить новость"
	loading={modalLoading}
	disableSubmit={imageUploading || ($addImageValidation?.shouldDisableSubmit || false)}
	on:close={closeModal}
	on:submit={addNews}
>
	<div class="space-y-4">
		{#if modalError}
			<div class="alert alert-error">
				{modalError}
			</div>
		{/if}

		<div>
			<label for="titleRu" class="block text-sm font-medium mb-2 text-gray-700">
				Заголовок (Русский) *
			</label>
			<input
				id="titleRu"
				type="text"
				bind:value={newNews.titleRu}
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
				placeholder="Введите заголовок новости"
				required
			/>
		</div>

		<div>
			<label for="titleKz" class="block text-sm font-medium mb-2 text-gray-700">
				Заголовок (Казахский) *
			</label>
			<input
				id="titleKz"
				type="text"
				bind:value={newNews.titleKz}
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
				placeholder="Жаңалық тақырыбын енгізіңіз"
				required
			/>
		</div>

		<div>
			<label for="contentRu" class="block text-sm font-medium mb-2 text-gray-700">
				Содержание (Русский) *
			</label>
			<textarea
				id="contentRu"
				bind:value={newNews.contentRu}
				rows={4}
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
				placeholder="Введите содержание новости"
				required
			></textarea>
		</div>

		<div>
			<label for="contentKz" class="block text-sm font-medium mb-2 text-gray-700">
				Содержание (Казахский) *
			</label>
			<textarea
				id="contentKz"
				bind:value={newNews.contentKz}
				rows={4}
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
				placeholder="Жаңалық мазмұнын енгізіңіз"
				required
			></textarea>
		</div>

		<div>
			<label for="imageUrl" class="block text-sm font-medium mb-2 text-gray-700">
				Изображение
			</label>
			<ImageUpload
				bind:value={newNews.imageUrl}
				bind:uploading={imageUploading}
				folder="news"
				on:change={handleImageChange}
			/>
			{#if $addImageValidation.validationError}
				<div class="text-red-500 text-sm mt-1">
					{$addImageValidation.validationError}
				</div>
			{/if}
		</div>
	</div>
</DataModal>

<!-- Модальное окно редактирования новости -->
<DataModal
	bind:open={showEditModal}
	title="Редактировать новость"
	loading={modalLoading}
	disableSubmit={imageUploading || (editImageValidation ? $editImageValidation.shouldDisableSubmit : false)}
	on:close={closeEditModal}
	on:submit={updateNews}
>
	<div class="space-y-4">
		{#if modalError}
			<div class="alert alert-error">
				{modalError}
			</div>
		{/if}

		<div>
			<label for="edit-titleRu" class="block text-sm font-medium mb-2 text-gray-700">
				Заголовок (русский) *
			</label>
			<input 
				type="text" 
				id="edit-titleRu" 
				bind:value={editForm.titleRu} 
				required 
				placeholder="Введите заголовок на русском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="edit-titleKz" class="block text-sm font-medium mb-2 text-gray-700">
				Заголовок (казахский)
			</label>
			<input 
				type="text" 
				id="edit-titleKz" 
				bind:value={editForm.titleKz} 
				placeholder="Введите заголовок на казахском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="edit-contentRu" class="block text-sm font-medium mb-2 text-gray-700">
				Содержание (русский) *
			</label>
			<textarea 
				id="edit-contentRu" 
				bind:value={editForm.contentRu} 
				required 
				rows="4"
				placeholder="Введите содержание на русском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
			></textarea>
		</div>

		<div>
			<label for="edit-contentKz" class="block text-sm font-medium mb-2 text-gray-700">
				Содержание (казахский)
			</label>
			<textarea 
				id="edit-contentKz" 
				bind:value={editForm.contentKz} 
				rows="4"
				placeholder="Введите содержание на казахском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
			></textarea>
		</div>

		<div>
			<label for="edit-imageUrl" class="block text-sm font-medium mb-2 text-gray-700">
				Изображение
			</label>
			<ImageUpload 
				bind:value={editForm.imageUrl} 
				bind:uploading={imageUploading}
				folder="news" 
				on:change={handleEditImageChange} 
			/>
			{#if editImageValidation && $editImageValidation.validationError}
				<div class="text-red-500 text-sm mt-1">
					{$editImageValidation.validationError}
				</div>
			{/if}
		</div>
	</div>
</DataModal>

<style>
.btn {
	border: none;
	border-radius: 0.6rem;
	font-weight: 600;
	font-size: 0.9rem;
	cursor: pointer;
	transition: all 0.2s ease;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.6rem 1.2rem;
}

.btn-primary {
	background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
	color: white;
	box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.add-btn {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 1rem 2rem;
	font-weight: 700;
	border-radius: var(--radius);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: var(--shadow-lg);
	background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(262 83% 68%) 100%);
	border: none;
	color: white;
	font-size: 1rem;
	position: relative;
	overflow: hidden;
}

.add-btn::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
	transition: left 0.6s;
}

.add-btn:hover::before {
	left: 100%;
}

.add-btn:hover {
	transform: translateY(-3px);
	box-shadow: var(--shadow-xl);
	background: linear-gradient(135deg, hsl(262 83% 68%) 0%, hsl(var(--primary)) 100%);
}

.btn-icon {
	font-size: 1.2rem;
	filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.grid-container {
	display: grid;
	grid-template-columns: repeat(3, 340px);
	justify-content: start;
	gap: 24px;
}

@media (max-width: 1200px) {
	.grid-container {
		grid-template-columns: repeat(2, 340px);
	}
}

@media (max-width: 768px) {
	.grid-container {
		grid-template-columns: 1fr;
		max-width: 400px;
		margin: 0 auto;
	}
}

.grid-3 {
	grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.list-container {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.list-item {
	width: 100%;
}

.list-item :global(.card) {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 1rem;
}

.list-item :global(.card-image) {
	width: 120px;
	height: 80px;
	flex-shrink: 0;
	margin-right: 1rem;
}

.list-item :global(.card-content) {
	flex: 1;
}

.list-item :global(.card-title) {
	font-size: 1.1rem;
	margin-bottom: 0.5rem;
}

.list-item :global(.card-description) {
	font-size: 0.9rem;
	line-height: 1.4;
}

.alert {
	padding: 0.75rem 1rem;
	border-radius: 6px;
	margin-bottom: 1.5rem;
	font-weight: 500;
}

.alert-error {
	background-color: #fee2e2;
	color: #b91c1c;
	border: 1px solid #ef4444;
}

.admin-info-compact {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 1rem 1.5rem;
	background: hsl(var(--muted) / 0.1);
	border: 1px solid hsl(var(--border));
	border-radius: var(--radius);
	margin-bottom: 1.5rem;
	font-size: 0.9rem;
}

.admin-info-icon {
	font-size: 1.25rem;
	opacity: 0.8;
	color: hsl(var(--primary));
}

.admin-info-text {
	color: hsl(var(--muted-foreground));
	margin: 0;
}

	/* Темная тема */
	:global(.dark) .add-btn {
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
	}

	:global(.dark) .add-btn:hover {
		background: hsl(var(--primary) / 0.9);
	}

	:global(.dark) .grid-container {
		background: hsl(var(--background));
}
</style>