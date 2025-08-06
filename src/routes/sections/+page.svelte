<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import type { Section } from '$lib/types/api';
	import Modal from '$lib/components/Modal.svelte';
	import DataCard from '$lib/components/DataCard.svelte';

	let sections: Section[] = [];
	let loading = true;
	let error = '';
	let language: 'ru' | 'kz' = 'ru';
	let showAddModal = false;
	let addLoading = false;
	let addError = '';

	let newSection = {
		nameRu: '',
		nameKz: '',
		scheduleRu: '',
		scheduleKz: '',
		teacher: '',
		imageUrl: ''
	};

	onMount(async () => {
		try {
			const school = await apiClient.getMe();
			sections = await apiClient.getSections(school.id, language);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка загрузки секций';
		} finally {
			loading = false;
		}
	});

	async function toggleLanguage() {
		language = language === 'ru' ? 'kz' : 'ru';
		loading = true;
		error = '';

		try {
			const school = await apiClient.getMe();
			sections = await apiClient.getSections(school.id, language);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка загрузки секций';
		} finally {
			loading = false;
		}
	}

	async function addSection() {
		addLoading = true;
		addError = '';

		try {
			const school = await apiClient.getMe();
			await apiClient.createSection({
				...newSection,
				schoolId: school.id
			});
			
			// Обновляем список секций
			sections = await apiClient.getSections(school.id, language);
			
			// Закрываем модальное окно и очищаем форму
			showAddModal = false;
			newSection = {
				nameRu: '',
				nameKz: '',
				scheduleRu: '',
				scheduleKz: '',
				teacher: '',
				imageUrl: ''
			};
		} catch (err) {
			addError = err instanceof Error ? err.message : 'Ошибка создания секции';
		} finally {
			addLoading = false;
		}
	}

	function openAddModal() {
		showAddModal = true;
		addError = '';
	}

	function closeAddModal() {
		showAddModal = false;
		addError = '';
	}
</script>

<svelte:head>
	<title>Секции - Школьная система</title>
</svelte:head>

<div class="sections-page">
	<div class="page-header">
		<h1>Секции и кружки</h1>
		<div class="page-actions">
			<button class="btn btn-secondary" on:click={toggleLanguage}>
				{language === 'ru' ? 'KZ' : 'RU'}
			</button>
			<button class="btn btn-primary" on:click={openAddModal}>Добавить секцию</button>
		</div>
	</div>

	{#if loading}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Загрузка секций...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<h2>Ошибка</h2>
			<p>{error}</p>
		</div>
	{:else if sections.length > 0}
		<div class="grid-container grid-3">
			{#each sections as section}
				<DataCard
					data={section}
					type="section"
					{language}
					showActions={true}
					onEdit={() => console.log('Edit section:', section.id)}
					onDelete={() => console.log('Delete section:', section.id)}
				/>
			{/each}
		</div>
	{:else}
		<div class="empty-state">
			<h2>Секций пока нет</h2>
			<p>Добавьте первую секцию в систему!</p>
			<button class="btn btn-primary" on:click={openAddModal}>Добавить секцию</button>
		</div>
	{/if}
</div>

<!-- Модальное окно добавления секции -->
<Modal isOpen={showAddModal} title="Добавить секцию" on:close={closeAddModal}>
	<form on:submit|preventDefault={addSection}>
		{#if addError}
			<div class="alert alert-error">{addError}</div>
		{/if}

		<div class="form-group">
			<label for="nameRu">Название (русский) *</label>
			<input 
				type="text" 
				id="nameRu" 
				bind:value={newSection.nameRu} 
				required 
				placeholder="Введите название секции на русском"
			/>
		</div>

		<div class="form-group">
			<label for="nameKz">Название (казахский) *</label>
			<input 
				type="text" 
				id="nameKz" 
				bind:value={newSection.nameKz} 
				required 
				placeholder="Введите название секции на казахском"
			/>
		</div>

		<div class="form-group">
			<label for="scheduleRu">Расписание (русский) *</label>
			<input 
				type="text" 
				id="scheduleRu" 
				bind:value={newSection.scheduleRu} 
				required 
				placeholder="Например: Понедельник, Среда 15:00-16:30"
			/>
		</div>

		<div class="form-group">
			<label for="scheduleKz">Расписание (казахский) *</label>
			<input 
				type="text" 
				id="scheduleKz" 
				bind:value={newSection.scheduleKz} 
				required 
				placeholder="Например: Дүйсенбі, Сәрсенбі 15:00-16:30"
			/>
		</div>

		<div class="form-group">
			<label for="teacher">Руководитель *</label>
			<input 
				type="text" 
				id="teacher" 
				bind:value={newSection.teacher} 
				required 
				placeholder="ФИО руководителя секции"
			/>
		</div>

		<div class="form-group">
			<label for="imageUrl">URL изображения</label>
			<input 
				type="url" 
				id="imageUrl" 
				bind:value={newSection.imageUrl} 
				placeholder="https://example.com/section.jpg"
			/>
		</div>

		<div class="form-actions">
			<button type="button" class="btn btn-secondary" on:click={closeAddModal}>
				Отмена
			</button>
			<button type="submit" class="btn btn-primary" disabled={addLoading}>
				{addLoading ? 'Добавление...' : 'Добавить секцию'}
			</button>
		</div>
	</form>
</Modal>

<style>
	.sections-page {
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
		color: #333;
		font-size: 2rem;
	}

	.page-actions {
		display: flex;
		gap: 0.5rem;
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

	.section-card {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.section-image {
		width: 100%;
		height: 200px;
		overflow: hidden;
		border-radius: 8px 8px 0 0;
		margin: -1.5rem -1.5rem 1rem -1.5rem;
	}

	.section-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.section-content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.section-name {
		margin: 0 0 1rem 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #333;
	}

	.section-details {
		flex: 1;
	}

	.detail-item {
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}

	.detail-item strong {
		color: #333;
	}

	.section-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #eee;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
	}

	.empty-state h2 {
		margin: 0 0 1rem 0;
		color: #333;
	}

	.empty-state p {
		margin: 0 0 2rem 0;
		color: #666;
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

		.section-actions {
			flex-direction: column;
		}
	}

	/* Стили для модального окна */
	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #555;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e1e5e9;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #007bff;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 2rem;
	}

	.alert {
		padding: 0.75rem 1rem;
		border-radius: 6px;
		margin-bottom: 1.5rem;
		font-weight: 500;
	}

	.alert-error {
		background-color: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
	}
</style> 