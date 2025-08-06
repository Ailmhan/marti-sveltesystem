<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import { schoolStore } from '$lib/stores/school';
	import type { News } from '$lib/types/api';
	import DataModal from '$lib/components/DataModal.svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import DataCard from '$lib/components/DataCard.svelte';

	let news: News[] = [];
	let loading = true;
	let error = '';
	let language: 'ru' | 'kz' = 'ru';
	let showAddModal = false;
	let modalLoading = false;

	let newNews = {
		titleRu: '',
		titleKz: '',
		contentRu: '',
		contentKz: '',
		imageUrl: ''
	};

	onMount(async () => {
		await loadNews();
	});

	async function loadNews() {
		try {
			loading = true;
			const school = $schoolStore;
			if (school) {
				news = await apiClient.getNews(school.id, language);
			} else {
				error = 'Информация о школе не загружена';
				news = [];
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка загрузки новостей';
			news = [];
		} finally {
			loading = false;
		}
	}

	async function toggleLanguage() {
		language = language === 'ru' ? 'kz' : 'ru';
	}

	async function addNews() {
		try {
			modalLoading = true;
			const school = $schoolStore;
			if (school) {
				await apiClient.createNews({
					...newNews,
					schoolId: school.id
				});
				await loadNews();
				closeModal();
			} else {
				throw new Error('Информация о школе не загружена');
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка создания новости';
		} finally {
			modalLoading = false;
		}
	}

	function openModal() {
		showAddModal = true;
	}

	function closeModal() {
		showAddModal = false;
		newNews = {
			titleRu: '',
			titleKz: '',
			contentRu: '',
			contentKz: '',
			imageUrl: ''
		};
		error = '';
	}

	function handleImageChange(event: CustomEvent) {
		newNews.imageUrl = event.detail.value;
	}

	function formatDate(date: string | Date) {
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		return dateObj.toLocaleDateString('ru-RU', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Новости - Школьная система</title>
</svelte:head>

<div class="news-page">
	<div class="page-header">
		<h1>Новости школы</h1>
		<div class="page-actions">
			<button class="btn btn-secondary" on:click={toggleLanguage}>
				{language === 'ru' ? 'KZ' : 'RU'}
			</button>
			<button class="btn btn-primary add-btn" on:click={openModal}>
				<span class="btn-icon">➕</span>
				Добавить новость
			</button>
		</div>
	</div>

	{#if loading}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Загрузка новостей...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<h2>Ошибка</h2>
			<p>{error}</p>
		</div>
	{:else if news.length > 0}
		<div class="grid-container grid-3">
			{#each news as item}
				<DataCard
					data={item}
					type="news"
					{language}
					showActions={true}
					onEdit={() => console.log('Edit news:', item.id)}
					onDelete={() => console.log('Delete news:', item.id)}
				/>
			{/each}
		</div>
	{:else}
		<EmptyState
			title="Новостей пока нет"
			description="Добавьте первую новость в систему!"
			icon="📰"
			buttonText="Добавить новость"
			onAction={openModal}
		/>
	{/if}
</div>

<!-- Модальное окно добавления новости -->
<DataModal
	bind:open={showAddModal}
	title="Добавить новость"
	loading={modalLoading}
	on:close={closeModal}
	on:submit={addNews}
>
	<div class="space-y-4">
		<div>
			<label for="titleRu" class="block text-sm font-medium mb-2 text-gray-700">
				Заголовок (Русский)
			</label>
			<input
				id="titleRu"
				type="text"
				bind:value={newNews.titleRu}
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
				placeholder="Введите заголовок новости"
			/>
		</div>

		<div>
			<label for="titleKz" class="block text-sm font-medium mb-2 text-gray-700">
				Заголовок (Казахский)
			</label>
			<input
				id="titleKz"
				type="text"
				bind:value={newNews.titleKz}
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
				placeholder="Жаңалық тақырыбын енгізіңіз"
			/>
		</div>

		<div>
			<label for="contentRu" class="block text-sm font-medium mb-2 text-gray-700">
				Содержание (Русский)
			</label>
					<textarea
			id="contentRu"
			bind:value={newNews.contentRu}
			rows={4}
			class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
			placeholder="Введите содержание новости"
		></textarea>
		</div>

		<div>
			<label for="contentKz" class="block text-sm font-medium mb-2 text-gray-700">
				Содержание (Казахский)
			</label>
					<textarea
			id="contentKz"
			bind:value={newNews.contentKz}
			rows={4}
			class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
			placeholder="Жаңалық мазмұнын енгізіңіз"
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
					error = event.detail.message;
				}}
				on:success={(event) => {
					error = '';
				}}
			/>
		</div>
	</div>
</DataModal>

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
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #eee;
	}

	.page-header h1 {
		margin: 0;
		color: var(--text-primary);
		font-size: 2rem;
	}

	.page-actions {
		display: flex;
		gap: 0.75rem;
	}

	.add-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		border-radius: 8px;
		color: white;
		font-weight: 600;
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
	}

	.add-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
	}

	.btn-icon {
		font-size: 1.1rem;
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		gap: 1rem;
	}

	.error-container {
		text-align: center;
		padding: 2rem;
	}



	.news-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.news-card {
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
		background: white;
		transition: box-shadow 0.2s;
	}

	.news-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.news-image {
		height: 200px;
		overflow: hidden;
	}

	.news-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.news-image-placeholder {
		height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f3f4f6;
		font-size: 3rem;
	}

	.news-content {
		padding: 1rem;
	}

	.news-title {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.news-description {
		color: var(--text-secondary);
		font-size: 0.875rem;
		line-height: 1.5;
		margin-bottom: 1rem;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.news-date {
		color: var(--text-secondary);
		font-size: 0.75rem;
		margin-bottom: 1rem;
	}

	.news-actions {
		padding: 1rem;
		border-top: 1px solid #e5e7eb;
		display: flex;
		gap: 0.75rem;
	}

	.btn-edit {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #3b82f6;
		border: none;
		border-radius: 6px;
		color: white;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.btn-edit:hover {
		background: #2563eb;
		transform: translateY(-1px);
	}

	.btn-delete {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #ef4444;
		border: none;
		border-radius: 6px;
		color: white;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.btn-delete:hover {
		background: #dc2626;
		transform: translateY(-1px);
	}

	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.page-actions {
			justify-content: center;
		}

		.news-grid {
			grid-template-columns: 1fr;
		}
	}
</style> 