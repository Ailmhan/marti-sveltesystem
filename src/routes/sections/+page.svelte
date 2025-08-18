<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import { authStore } from '$lib/stores/auth';
	import { adminStore } from '$lib/stores/admin';
	import { languageStore } from '$lib/stores/language';
	import type { Section } from '$lib/types/api';
	import DataModal from '$lib/components/DataModal.svelte';
	import DataCard from '$lib/components/DataCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';

	let sections: Section[] = [];
	let loading = false;
	let error = '';
	let showAddModal = false;
	let modalError = '';
	let modalLoading = false;

	let newSection = {
		nameRu: '',
		nameKz: '',
		scheduleRu: '',
		scheduleKz: '',
		teacher: '',
		imageUrl: undefined as string | undefined
	};

	// Состояние для редактирования
	let showEditModal = false;
	let editingSection: Section | null = null;
	let editForm = {
		nameRu: '',
		nameKz: '',
		scheduleRu: '',
		scheduleKz: '',
		teacher: '',
		imageUrl: undefined as string | undefined
	};

	// Состояние для загрузки изображений
	let imageUploading = false;

	onMount(() => {
		loadSections();
	});

	async function loadSections() {
		if (!$authStore.schoolId) return;
		
		try {
			loading = true;
			error = '';
			const sectionsData = await apiClient.getSections($authStore.schoolId);
			sections = sectionsData;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка загрузки секций';
		} finally {
			loading = false;
		}
	}

	async function addSection() {
		if (!$authStore.schoolId) {
			modalError = 'ID школы не найден';
			return;
		}

		// Валидация
		if (!newSection.nameRu.trim() || !newSection.nameKz.trim() || 
			!newSection.scheduleRu.trim() || !newSection.scheduleKz.trim() ||
			!newSection.teacher.trim()) {
			modalError = 'Все поля должны быть заполнены';
			return;
		}

		try {
			modalError = '';
			modalLoading = true;
			
			await apiClient.createSection({
				...newSection,
				schoolId: $authStore.schoolId
			});
			
			// Сбрасываем форму
			newSection = {
				nameRu: '',
				nameKz: '',
				scheduleRu: '',
				scheduleKz: '',
				teacher: '',
				imageUrl: undefined
			};
			
			// Закрываем модальное окно
			showAddModal = false;
			modalLoading = false;
			
			// Перезагружаем секции
			await loadSections();
		} catch (err) {
			modalError = err instanceof Error ? err.message : 'Ошибка создания секции';
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
		newSection = {
			nameRu: '',
			nameKz: '',
			scheduleRu: '',
			scheduleKz: '',
			teacher: '',
			imageUrl: undefined
		};
	}

	function handleImageChange(event: CustomEvent) {
		const url = event.detail.value;
		if (url) {
			if (showEditModal && editingSection) {
				editForm.imageUrl = url;
			} else {
				newSection.imageUrl = url;
			}
		}
	}

	async function deleteSection(id: number) {
		try {
			await apiClient.deleteSection(id);
			await loadSections();
		} catch (err) {
			console.error('Error deleting section:', err);
			error = err instanceof Error ? err.message : 'Ошибка удаления секции';
		}
	}

	function editSection(section: Section) {
		editingSection = section;
		editForm = {
			nameRu: section.nameRu || '',
			nameKz: section.nameKz || '',
			scheduleRu: section.scheduleRu || '',
			scheduleKz: section.scheduleKz || '',
			teacher: section.teacher || '',
			imageUrl: section.imageUrl || undefined
		};
		showEditModal = true;
		modalError = '';
	}

	function closeEditModal() {
		showEditModal = false;
		editingSection = null;
		modalError = '';
	}

	async function updateSection() {
		if (!$authStore.schoolId || !editingSection) {
			modalError = 'ID школы или секции не найден';
			return;
		}

		// Валидация
		if (!editForm.nameRu.trim() || !editForm.nameKz.trim() || 
			!editForm.scheduleRu.trim() || !editForm.scheduleKz.trim() ||
			!editForm.teacher.trim()) {
			modalError = 'Все поля должны быть заполнены';
			return;
		}

		try {
			modalError = '';
			modalLoading = true;
			
			await apiClient.updateSection(editingSection.id, {
				...editForm,
				schoolId: $authStore.schoolId
			});
			
			// Закрываем модальное окно после успешного обновления
			closeEditModal();
			modalLoading = false;
			
			// Перезагружаем секции
			await loadSections();
		} catch (err) {
			modalError = err instanceof Error ? err.message : 'Ошибка обновления секции';
			modalLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Секции - Школьная система</title>
</svelte:head>

<div class="sections-page">
	<div class="page-header">
		<h1>Кружки и секции</h1>
		{#if $adminStore.isAdminMode}
			<div class="page-actions">
				<button class="btn btn-primary add-btn" on:click={openModal}>
					<span class="btn-icon">➕</span>
					Добавить секцию
				</button>
			</div>
		{/if}
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
			<button class="btn btn-primary" on:click={loadSections}>Попробовать снова</button>
		</div>
	{:else if sections.length > 0}
		{#if !$adminStore.isAdminMode}
			<div class="admin-info-compact">
				<span class="admin-info-icon">🔐</span>
				<span class="admin-info-text">Войдите в режим администратора для управления данными</span>
			</div>
		{/if}
		
		<div class="grid-container grid-3">
			{#each sections as section}
				<DataCard
					data={section}
					type="section"
					language={$languageStore}
					showActions={$adminStore.isAdminMode}
					onEdit={() => editSection(section)}
					onDelete={$adminStore.isAdminMode ? () => deleteSection(section.id) : undefined}
				/>
			{/each}
		</div>
	{:else}
		<EmptyState
			title="Секций пока нет"
			description="Добавьте первую секцию в систему!"
			icon="🎨"
			buttonText="Добавить секцию"
			onAction={openModal}
		/>
	{/if}
</div>

<!-- Модальное окно добавления секции -->
<DataModal
	bind:open={showAddModal}
	title="Добавить секцию"
	loading={modalLoading}
	disableSubmit={imageUploading}
	on:close={closeModal}
	on:submit={addSection}
>
	<div class="space-y-4">
		{#if modalError}
			<div class="alert alert-error">
				{modalError}
			</div>
		{/if}

		<div>
			<label for="nameRu" class="block text-sm font-medium mb-2 text-gray-700">
				Название (русский) *
			</label>
			<input
				id="nameRu"
				type="text"
				bind:value={newSection.nameRu}
				required
				placeholder="Введите название секции на русском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="nameKz" class="block text-sm font-medium mb-2 text-gray-700">
				Название (казахский) *
			</label>
			<input
				id="nameKz"
				type="text"
				bind:value={newSection.nameKz}
				required
				placeholder="Введите название секции на казахском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="scheduleRu" class="block text-sm font-medium mb-2 text-gray-700">
				Расписание (русский) *
			</label>
			<input
				id="scheduleRu"
				type="text"
				bind:value={newSection.scheduleRu}
				required
				placeholder="Например: Понедельник, Среда 15:00-16:30"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="scheduleKz" class="block text-sm font-medium mb-2 text-gray-700">
				Расписание (казахский) *
			</label>
			<input
				id="scheduleKz"
				type="text"
				bind:value={newSection.scheduleKz}
				required
				placeholder="Например: Дүйсенбі, Сәрсенбі 15:00-16:30"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="teacher" class="block text-sm font-medium mb-2 text-gray-700">
				Руководитель *
			</label>
			<input
				id="teacher"
				type="text"
				bind:value={newSection.teacher}
				required
				placeholder="ФИО руководителя секции"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="section-image-upload" class="block text-sm font-medium mb-2 text-gray-700">
				Изображение
			</label>
			<ImageUpload
				id="section-image-upload"
				bind:value={newSection.imageUrl}
				bind:uploading={imageUploading}
				folder="sections"
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

<!-- Модальное окно редактирования секции -->
<DataModal
	bind:open={showEditModal}
	title="Редактировать секцию"
	loading={modalLoading}
	disableSubmit={imageUploading}
	on:close={closeEditModal}
	on:submit={updateSection}
>
	<div class="space-y-4">
		{#if modalError}
			<div class="alert alert-error">
				{modalError}
			</div>
		{/if}

		<div>
			<label for="edit-nameRu" class="block text-sm font-medium mb-2 text-gray-700">
				Название (русский) *
			</label>
			<input
				id="edit-nameRu"
				type="text"
				bind:value={editForm.nameRu}
				required
				placeholder="Введите название секции на русском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="edit-nameKz" class="block text-sm font-medium mb-2 text-gray-700">
				Название (казахский) *
			</label>
			<input
				id="edit-nameKz"
				type="text"
				bind:value={editForm.nameKz}
				required
				placeholder="Введите название секции на казахском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="edit-scheduleRu" class="block text-sm font-medium mb-2 text-gray-700">
				Расписание (русский) *
			</label>
			<input
				id="edit-scheduleRu"
				type="text"
				bind:value={editForm.scheduleRu}
				required
				placeholder="Например: Понедельник, Среда 15:00-16:30"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="edit-scheduleKz" class="block text-sm font-medium mb-2 text-gray-700">
				Расписание (казахский) *
			</label>
			<input
				id="edit-scheduleKz"
				type="text"
				bind:value={editForm.scheduleKz}
				required
				placeholder="Например: Дүйсенбі, Сәрсенбі 15:00-16:30"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="edit-teacher" class="block text-sm font-medium mb-2 text-gray-700">
				Руководитель *
			</label>
			<input
				id="edit-teacher"
				type="text"
				bind:value={editForm.teacher}
				required
				placeholder="ФИО руководителя секции"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="edit-section-image-upload" class="block text-sm font-medium mb-2 text-gray-700">
				Изображение
			</label>
			<ImageUpload
				id="edit-section-image-upload"
				bind:value={editForm.imageUrl}
				bind:uploading={imageUploading}
				folder="sections"
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
		flex-wrap: wrap;
		row-gap: 1rem;
		margin-bottom: 2.5rem;
        border-bottom: 1px solid hsl(var(--border));
		padding-bottom: 1.25rem;
	}

    .page-header h1 {
		margin: 0;
		font-size: 2rem;
		font-weight: 700;
        color: hsl(var(--foreground));
	}

	/* Gradient heading in dark theme */
	:global(.dark) .page-header h1 {
		background: linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--primary)) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		color: transparent;
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
        background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(262 83% 68%) 100%);
        color: hsl(var(--primary-foreground));
        box-shadow: var(--shadow-md);
        border: 1px solid hsl(var(--ring) / 0.3);
    }

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
	}

    .add-btn {
        background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(262 83% 68%) 100%);
        color: hsl(var(--primary-foreground));
        box-shadow: var(--shadow-md);
        border: 1px solid hsl(var(--ring) / 0.3);
    }

	.add-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
	}

	.btn-icon {
		font-size: 1.2rem;
		margin-right: 0.5rem;
	}

    .loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 40vh;
		gap: 1rem;
        color: hsl(var(--muted-foreground));
		text-align: center;
	}

    .spinner {
        border: 4px solid hsl(var(--muted));
        border-top: 4px solid hsl(var(--primary));
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
        color: hsl(var(--destructive));
        background: hsl(var(--destructive) / 0.1);
        border: 1px solid hsl(var(--destructive) / 0.3);
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
		gap: 1.5rem;
	}

	.grid-3 {
		grid-template-columns: repeat(3, 340px);
		justify-content: start;
	}
	
	@media (max-width: 1200px) {
		.grid-3 {
			grid-template-columns: repeat(2, 340px);
		}
	}
	
	@media (max-width: 768px) {
		.grid-3 {
			grid-template-columns: 1fr;
			max-width: 400px;
			margin: 0 auto;
		}
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

    /* form controls themed inside DataModal component */

	/* Compact admin info styles */
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