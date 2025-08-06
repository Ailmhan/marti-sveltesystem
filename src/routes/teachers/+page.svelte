<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import { schoolStore } from '$lib/stores/school';
	import type { Teacher } from '$lib/types/api';
	import DataModal from '$lib/components/DataModal.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import DataCard from '$lib/components/DataCard.svelte';

	let teachers: Teacher[] = [];
	let loading = true;
	let error = '';
	let language: 'ru' | 'kz' = 'ru';
	let showAddModal = false;
	let addLoading = false;
	let addError = '';

	let newTeacher = {
		nameRu: '',
		nameKz: '',
		subjectRu: '',
		subjectKz: '',
		email: '',
		phone: '',
		birthday: '',
		image: ''
	};

	onMount(async () => {
		try {
			const school = $schoolStore;
			if (school) {
				teachers = await apiClient.getTeachers(school.id);
			} else {
				error = 'Информация о школе не загружена';
				teachers = [];
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка загрузки учителей';
			teachers = [];
		} finally {
			loading = false;
		}
	});

	async function toggleLanguage() {
		language = language === 'ru' ? 'kz' : 'ru';
	}

	async function addTeacher() {
		addLoading = true;
		addError = '';

		try {
			const school = $schoolStore;
			if (school) {
				await apiClient.createTeacher({
					...newTeacher,
					schoolId: school.id,
					birthday: newTeacher.birthday
				});
				
				// Обновляем список учителей
				teachers = await apiClient.getTeachers(school.id);
				
				// Закрываем модальное окно и очищаем форму
				showAddModal = false;
				newTeacher = {
					nameRu: '',
					nameKz: '',
					subjectRu: '',
					subjectKz: '',
					email: '',
					phone: '',
					birthday: '',
					image: ''
				};
			} else {
				throw new Error('Информация о школе не загружена');
			}
		} catch (err) {
			addError = err instanceof Error ? err.message : 'Ошибка создания учителя';
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
	<title>Учителя - Школьная система</title>
</svelte:head>

<div class="teachers-page">
	<div class="page-header">
		<h1>Учителя школы</h1>
		<div class="page-actions">
			<button class="btn btn-secondary" on:click={toggleLanguage}>
				{language === 'ru' ? 'KZ' : 'RU'}
			</button>
			<button class="btn btn-primary add-btn" on:click={openAddModal}>
				<span class="btn-icon">➕</span>
				Добавить учителя
			</button>
		</div>
	</div>

	{#if loading}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Загрузка учителей...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<h2>Ошибка</h2>
			<p>{error}</p>
		</div>
	{:else if teachers.length > 0}
		<div class="grid-container grid-4">
			{#each teachers as teacher}
				<DataCard
					data={teacher}
					type="teacher"
					{language}
					showActions={true}
					onEdit={() => console.log('Edit teacher:', teacher.id)}
					onDelete={() => console.log('Delete teacher:', teacher.id)}
				/>
			{/each}
		</div>
	{:else}
		<EmptyState
			title="Учителей пока нет"
			description="Добавьте первого учителя в систему!"
			icon="👥"
			buttonText="Добавить учителя"
			onAction={openAddModal}
		/>
	{/if}
</div>

<!-- Модальное окно добавления учителя -->
<DataModal
	bind:open={showAddModal}
	title="Добавить учителя"
	loading={addLoading}
	on:close={closeAddModal}
	on:submit={addTeacher}
>
	<div class="space-y-4">
		{#if addError}
			<div class="alert alert-error">{addError}</div>
		{/if}

		<div>
			<label for="nameRu" class="block text-sm font-medium mb-2 text-gray-700">
				Имя (русский) *
			</label>
			<input 
				type="text" 
				id="nameRu" 
				bind:value={newTeacher.nameRu} 
				required 
				placeholder="Введите имя на русском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="nameKz" class="block text-sm font-medium mb-2 text-gray-700">
				Имя (казахский) *
			</label>
			<input 
				type="text" 
				id="nameKz" 
				bind:value={newTeacher.nameKz} 
				required 
				placeholder="Введите имя на казахском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="subjectRu" class="block text-sm font-medium mb-2 text-gray-700">
				Предмет (русский) *
			</label>
			<input 
				type="text" 
				id="subjectRu" 
				bind:value={newTeacher.subjectRu} 
				required 
				placeholder="Введите предмет на русском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="subjectKz" class="block text-sm font-medium mb-2 text-gray-700">
				Предмет (казахский) *
			</label>
			<input 
				type="text" 
				id="subjectKz" 
				bind:value={newTeacher.subjectKz} 
				required 
				placeholder="Введите предмет на казахском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="email" class="block text-sm font-medium mb-2 text-gray-700">
				Email *
			</label>
			<input 
				type="email" 
				id="email" 
				bind:value={newTeacher.email} 
				required 
				placeholder="teacher@school.com"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="phone" class="block text-sm font-medium mb-2 text-gray-700">
				Телефон *
			</label>
			<input 
				type="tel" 
				id="phone" 
				bind:value={newTeacher.phone} 
				required 
				placeholder="+7 (XXX) XXX-XX-XX"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="birthday" class="block text-sm font-medium mb-2 text-gray-700">
				Дата рождения *
			</label>
			<input 
				type="date" 
				id="birthday" 
				bind:value={newTeacher.birthday} 
				required 
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="teacher-image-upload" class="block text-sm font-medium mb-2 text-gray-700">
				Изображение
			</label>
			<ImageUpload
				id="teacher-image-upload"
				bind:value={newTeacher.image}
				folder="teachers"
				on:error={(event) => {
					addError = event.detail.message;
				}}
				on:success={(event) => {
					addError = '';
				}}
			/>
		</div>
	</div>
</DataModal>

<style>
	.teachers-page {
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

	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.page-actions {
			justify-content: center;
		}
	}

	.alert {
		padding: 0.75rem 1rem;
		border-radius: 6px;
		margin-bottom: 1.5rem;
		font-weight: 500;
	}

	.alert-error {
		background-color: var(--error-light);
		color: var(--error-dark);
		border: 1px solid var(--error);
	}
</style> 