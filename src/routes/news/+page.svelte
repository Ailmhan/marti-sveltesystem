<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import type { News } from '$lib/types/api';
	import DataModal from '$lib/components/DataModal.svelte';
	import EditModal from '$lib/components/EditModal.svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import DataCard from '$lib/components/DataCard.svelte';
	import DataPage from '$lib/components/DataPage.svelte';
	import Schedule from '$lib/components/Schedule.svelte';
	import { toastStore } from '$lib/stores/toast';
	import { adminStore } from '$lib/stores/admin';
	import { authStore } from '$lib/stores/auth';
	import { languageStore } from '$lib/stores/language';
	import { t } from '$lib/i18n/translations';
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

	// Edit state
	let showEditModal = false;
	let editModalError = '';
	let editModalLoading = false;
	let currentEditItem: News | null = null;

	let newNews = {
		titleRu: '',
		titleKz: '',
		contentRu: '',
		contentKz: '',
		imageUrl: undefined as string | undefined
	};

	let editNews = {
		titleRu: '',
		titleKz: '',
		contentRu: '',
		contentKz: '',
		imageUrl: undefined as string | undefined
	};

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
			console.error('Error loading news:', err);
			error = err instanceof Error ? err.message : 'Ошибка загрузки новостей';
		} finally {
			loading = false;
		}
	}

	async function addNews() {
		// Валидация
		if (!newNews.titleRu.trim() || !newNews.titleKz.trim() || !newNews.contentRu.trim() || !newNews.contentKz.trim()) {
			modalError = 'Все поля должны быть заполнены';
			return;
		}

		if (!$authStore.schoolId) {
			modalError = 'ID школы не найден';
			return;
		}

		try {
			modalError = '';
			modalLoading = true;
			
			await apiClient.createNews({
				...newNews,
				schoolId: $authStore.schoolId
			});
			
			// Сбрасываем форму
			newNews = {
				titleRu: '',
				titleKz: '',
				contentRu: '',
				contentKz: '',
				imageUrl: undefined
			};
			
			// Закрываем модальное окно после успешного сохранения
			showAddModal = false;
			modalLoading = false;
			
			// Перезагружаем новости
			await loadNews();
		} catch (err) {
			console.error('Error creating news:', err);
			modalError = err instanceof Error ? err.message : 'Ошибка создания новости';
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
	}

	function handleImageChange(event: CustomEvent) {
		// ImageUpload уже обрабатывает загрузку, просто получаем URL
		const url = event.detail.value;
		if (url) {
			newNews.imageUrl = url;
			console.log('Image URL set:', url);
		}
	}

	// Edit functions
	function openEditModal(item: News) {
		currentEditItem = item;
		editNews = {
			titleRu: item.titleRu,
			titleKz: item.titleKz,
			contentRu: item.contentRu,
			contentKz: item.contentKz,
			imageUrl: item.imageUrl
		};
		showEditModal = true;
		editModalError = '';
	}

	function closeEditModal() {
		showEditModal = false;
		editModalError = '';
		editModalLoading = false;
		currentEditItem = null;
		editNews = {
			titleRu: '',
			titleKz: '',
			contentRu: '',
			contentKz: '',
			imageUrl: undefined
		};
	}

	async function updateNews() {
		if (!currentEditItem) {
			editModalError = 'Ошибка: элемент для редактирования не найден';
			return;
		}

		// Валидация
		if (!editNews.titleRu.trim() || !editNews.titleKz.trim() || 
			!editNews.contentRu.trim() || !editNews.contentKz.trim()) {
			editModalError = 'Все поля должны быть заполнены';
			return;
		}

		try {
			editModalError = '';
			editModalLoading = true;
			
			await apiClient.updateNews(currentEditItem.id, editNews);
			
			// Закрываем модальное окно после успешного сохранения
			closeEditModal();
			
			// Перезагружаем данные
			await loadNews();
		} catch (err) {
			console.error('Error updating news:', err);
			editModalError = err instanceof Error ? err.message : 'Ошибка обновления новости';
			editModalLoading = false;
		}
	}

	function handleEditImageChange(event: CustomEvent) {
		const url = event.detail.value;
		if (url) {
			editNews.imageUrl = url;
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
		if (!confirm('Вы уверены, что хотите удалить эту новость?')) {
			return;
		}

		try {
			await apiClient.deleteNews(id);
			await loadNews();
			toastStore.success('Новость успешно удалена');
		} catch (err) {
			console.error('Error deleting news:', err);
			error = err instanceof Error ? err.message : 'Ошибка удаления новости';
			toastStore.error('Не удалось удалить новость');
		}
	}
</script>

<svelte:head>
	<title>Новости - Школьная система</title>
</svelte:head>

		<DataPage
			title={t('pageHeaders.news', $languageStore)}
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
				{t('buttons.addNews', $languageStore)}
			</button>
		{/if}
	</svelte:fragment>

	<svelte:fragment slot="default">
		{#if filteredNews.length > 0}
			{#if currentView === 'grid'}
                <div class="grid-container grid-3">
                    {#each filteredNews as item}
                        <a href={`/news/${item.id}`} style="text-decoration:none;">
                            <DataCard
                                data={item}
                                type="news"
                                showActions={$adminStore.isAdminMode}
                                onEdit={() => openEditModal(item)}
                                onDelete={() => deleteNews(item.id)}
                            />
                        </a>
                    {/each}
                </div>
			{:else if currentView === 'list'}
                <div class="list-container">
                    {#each filteredNews as item}
                        <div class="list-item">
                            <a href={`/news/${item.id}`} style="text-decoration:none; display:block;">
                                <DataCard
                                    data={item}
                                    type="news"
                                    showActions={$adminStore.isAdminMode}
                                    onEdit={() => openEditModal(item)}
                                    onDelete={() => deleteNews(item.id)}
                                />
                            </a>
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
				title={t('emptyStates.newsNotFound.title', $languageStore)}
				description={t('emptyStates.newsNotFound.description', $languageStore)}
				icon="🔍"
				buttonText={t('emptyStates.newsNotFound.buttonText', $languageStore)}
				onAction={() => {
					sortBy = '';
				}}
			/>
		{:else}
			<EmptyState
				title={t('emptyStates.news.title', $languageStore)}
				description={t('emptyStates.news.description', $languageStore)}
				icon="📰"
				buttonText={$adminStore.isAdminMode ? t('emptyStates.news.buttonText', $languageStore) : null}
				onAction={$adminStore.isAdminMode ? openModal : null}
			/>
		{/if}
	</svelte:fragment>
</DataPage>

<!-- Модальное окно добавления новости -->
<DataModal
	bind:open={showAddModal}
	title={t('modalTitles.addNews', $languageStore)}
	loading={modalLoading}
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
			<label for="image-upload" class="block text-sm font-medium mb-2 text-gray-700">
				Изображение
			</label>
			<ImageUpload
				id="image-upload"
				bind:value={newNews.imageUrl}
				folder="news"
				on:change={handleImageChange}
				on:error={(event) => {
					modalError = event.detail.message;
				}}
				on:success={(event) => {
					modalError = '';
				}}
			/>
		</div>
	</div>
</DataModal>

<!-- Модальное окно редактирования новости -->
<EditModal
	bind:open={showEditModal}
	title="Редактировать новость"
	loading={editModalLoading}
	on:close={closeEditModal}
	on:submit={updateNews}
>
	<div class="space-y-4">
		{#if editModalError}
			<div class="alert alert-error">
				{editModalError}
			</div>
		{/if}

		<div>
			<label for="editTitleRu" class="block text-sm font-medium mb-2 text-gray-700">
				Заголовок (Русский) *
			</label>
			<input
				id="editTitleRu"
				type="text"
				bind:value={editNews.titleRu}
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
				placeholder="Введите заголовок новости"
				required
			/>
		</div>

		<div>
			<label for="editTitleKz" class="block text-sm font-medium mb-2 text-gray-700">
				Заголовок (Казахский) *
			</label>
			<input
				id="editTitleKz"
				type="text"
				bind:value={editNews.titleKz}
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
				placeholder="Жаңалық тақырыбын енгізіңіз"
				required
			/>
		</div>

		<div>
			<label for="editContentRu" class="block text-sm font-medium mb-2 text-gray-700">
				Содержание (Русский) *
			</label>
			<textarea
				id="editContentRu"
				bind:value={editNews.contentRu}
				rows={4}
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
				placeholder="Введите содержание новости"
				required
			></textarea>
		</div>

		<div>
			<label for="editContentKz" class="block text-sm font-medium mb-2 text-gray-700">
				Содержание (Казахский) *
			</label>
			<textarea
				id="editContentKz"
				bind:value={editNews.contentKz}
				rows={4}
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
				placeholder="Жаңалық мазмұнын енгізіңіз"
				required
			></textarea>
		</div>

		<div>
			<label for="edit-news-image-upload" class="block text-sm font-medium mb-2 text-gray-700">
				Изображение
			</label>
			<ImageUpload
				id="edit-news-image-upload"
				bind:value={editNews.imageUrl}
				folder="news"
				on:change={handleEditImageChange}
				on:error={(event) => {
					editModalError = event.detail.message;
				}}
				on:success={(event) => {
					editModalError = '';
				}}
			/>
		</div>
	</div>
</EditModal>

<style>
.news-page {
	max-width: 1200px;
	margin: 0 auto;
	padding: 2rem;
	padding-top: calc(70px + 2rem);
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	row-gap: 1rem;
	margin-bottom: 2.5rem;
	border-bottom: 1px solid #e5e7eb;
	padding-bottom: 1.25rem;
}

.page-header h1 {
	margin: 0;
	font-size: 2rem;
	font-weight: 700;
	color: #1f2937;
}

.page-actions {
	display: flex;
	gap: 0.75rem;
	flex-wrap: wrap;
}

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

.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 40vh;
	gap: 1rem;
	color: #6b7280;
	text-align: center;
}

.spinner {
	border: 4px solid #e5e7eb;
	border-top: 4px solid #6366f1;
	border-radius: 50%;
	width: 2.5rem;
	height: 2.5rem;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

.error-container {
	text-align: center;
	padding: 2rem;
	color: #b91c1c;
	background: #fef2f2;
	border: 1px solid #fecaca;
	border-radius: 0.75rem;
}

.error-container h2 {
	margin: 0 0 1rem 0;
	color: #b91c1c;
}

.error-container p {
	margin: 0 0 1.5rem 0;
}

.grid-container {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
	gap: 1.5rem;
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

@media (max-width: 768px) {
	.page-header {
		flex-direction: column;
		align-items: flex-start;
	}

	.page-actions {
		width: 100%;
		justify-content: space-between;
	}
}
</style>