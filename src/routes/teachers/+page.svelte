<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import { authStore } from '$lib/stores/auth';
	import type { Teacher } from '$lib/types/api';
	import DataModal from '$lib/components/DataModal.svelte';
	import EditModal from '$lib/components/EditModal.svelte';
	import DataCard from '$lib/components/DataCard.svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { toastStore } from '$lib/stores/toast';

	let teachers: Teacher[] = [];
	let loading = false;
	let error = '';
	let showAddModal = false;
	let modalError = '';
	let modalLoading = false;

	// Edit state
	let showEditModal = false;
	let editModalError = '';
	let editModalLoading = false;
	let currentEditItem: Teacher | null = null;

	let newTeacher = {
		nameRu: '',
		nameKz: '',
		subjectRu: '',
		subjectKz: '',
		email: '',
		phone: '',
		birthday: '',
		imageUrl: undefined as string | undefined
	};

	let editTeacher = {
		nameRu: '',
		nameKz: '',
		subjectRu: '',
		subjectKz: '',
		email: '',
		phone: '',
		birthday: '',
		imageUrl: undefined as string | undefined
	};

	onMount(() => {
		loadTeachers();
	});

	async function loadTeachers() {
		if (!$authStore.schoolId) return;
		
		try {
			loading = true;
			error = '';
			const teachersData = await apiClient.getTeachers($authStore.schoolId);
			teachers = teachersData;
		} catch (err) {
			console.error('Error loading teachers:', err);
			error = err instanceof Error ? err.message : 'Ошибка загрузки учителей';
		} finally {
			loading = false;
		}
	}

	async function addTeacher() {
		if (!$authStore.schoolId) {
			modalError = 'ID школы не найден';
			return;
		}

		// Валидация
		if (!newTeacher.nameRu.trim() || !newTeacher.nameKz.trim() || 
			!newTeacher.subjectRu.trim() || !newTeacher.subjectKz.trim() ||
			!newTeacher.email.trim() || !newTeacher.phone.trim() || !newTeacher.birthday) {
			modalError = 'Все поля должны быть заполнены';
			return;
		}

		try {
			modalError = '';
			modalLoading = true;
			
			await apiClient.createTeacher({
				...newTeacher,
				schoolId: $authStore.schoolId
			});
			
			// Сбрасываем форму
			newTeacher = {
				nameRu: '',
				nameKz: '',
				subjectRu: '',
				subjectKz: '',
				email: '',
				phone: '',
				birthday: '',
				imageUrl: undefined
			};
			
			// Закрываем модальное окно после успешного сохранения
			showAddModal = false;
			modalLoading = false;
			
			// Перезагружаем учителей
			await loadTeachers();
		} catch (err) {
			console.error('Error creating teacher:', err);
			modalError = err instanceof Error ? err.message : 'Ошибка создания учителя';
			modalLoading = false;
		}
	}

	function openAddModal() {
		showAddModal = true;
		modalError = '';
	}

	function closeAddModal() {
		showAddModal = false;
		modalError = '';
		modalLoading = false;
		newTeacher = {
			nameRu: '',
			nameKz: '',
			subjectRu: '',
			subjectKz: '',
			email: '',
			phone: '',
			birthday: '',
			imageUrl: undefined
		};
	}

	// Edit functions
	function openEditModal(item: Teacher) {
		currentEditItem = item;
		editTeacher = {
			nameRu: item.nameRu,
			nameKz: item.nameKz,
			subjectRu: item.subjectRu,
			subjectKz: item.subjectKz,
			email: item.email,
			phone: item.phone,
			birthday: item.birthday,
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
		editTeacher = {
			nameRu: '',
			nameKz: '',
			subjectRu: '',
			subjectKz: '',
			email: '',
			phone: '',
			birthday: '',
			imageUrl: undefined
		};
	}

	async function updateTeacher() {
		if (!currentEditItem) {
			editModalError = 'Ошибка: элемент для редактирования не найден';
			return;
		}

		// Валидация
		if (!editTeacher.nameRu.trim() || !editTeacher.nameKz.trim() || 
			!editTeacher.subjectRu.trim() || !editTeacher.subjectKz.trim() ||
			!editTeacher.email.trim() || !editTeacher.phone.trim() || !editTeacher.birthday) {
			editModalError = 'Все поля должны быть заполнены';
			return;
		}

		try {
			editModalError = '';
			editModalLoading = true;
			
			await apiClient.updateTeacher(currentEditItem.id, editTeacher);
			
			// Закрываем модальное окно после успешного сохранения
			closeEditModal();
			
			// Перезагружаем данные
			await loadTeachers();
		} catch (err) {
			console.error('Error updating teacher:', err);
			editModalError = err instanceof Error ? err.message : 'Ошибка обновления учителя';
			editModalLoading = false;
		}
	}

	function handleEditImageChange(event: CustomEvent) {
		const url = event.detail.value;
		if (url) {
			editTeacher.imageUrl = url;
		}
	}

	async function deleteTeacher(id: number) {
		if (!confirm('Вы уверены, что хотите удалить этого учителя?')) {
			return;
		}

		try {
			await apiClient.deleteTeacher(id);
			await loadTeachers();
			toastStore.success('Учитель успешно удален');
		} catch (err) {
			console.error('Error deleting teacher:', err);
			error = err instanceof Error ? err.message : 'Ошибка удаления учителя';
			toastStore.error('Не удалось удалить учителя');
		}
	}

	function handleImageChange(event: CustomEvent) {
		// ImageUpload уже обрабатывает загрузку, просто получаем URL
		const url = event.detail.value;
		if (url) {
			newTeacher.imageUrl = url;
			console.log('Image URL set:', url);
		}
	}
</script>

<svelte:head>
	<title>Учителя - Школьная система</title>
</svelte:head>

<div class="teachers-page">
	<div class="page-header">
		<h1>Учителя школы</h1>
		<div class="page-actions">
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
			<button class="btn btn-primary" on:click={loadTeachers}>Попробовать снова</button>
		</div>
	{:else if teachers.length > 0}
		<div class="grid-container grid-4">
			{#each teachers as teacher}
                <a href={`/teachers/${teacher.id}`} style="text-decoration:none;">
                    <DataCard
                        data={teacher}
                        type="teacher"
                        showActions={true}
                        onEdit={() => openEditModal(teacher)}
                        onDelete={() => deleteTeacher(teacher.id)}
                    />
                </a>
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
	loading={modalLoading}
	on:close={closeAddModal}
	on:submit={addTeacher}
>
	<div class="space-y-4">
		{#if modalError}
			<div class="alert alert-error">{modalError}</div>
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
				bind:value={newTeacher.imageUrl}
				folder="teachers"
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

<!-- Модальное окно редактирования учителя -->
<EditModal
	bind:open={showEditModal}
	title="Редактировать учителя"
	loading={editModalLoading}
	on:close={closeEditModal}
	on:submit={updateTeacher}
>
	<div class="space-y-4">
		{#if editModalError}
			<div class="alert alert-error">{editModalError}</div>
		{/if}

		<div>
			<label for="editNameRu" class="block text-sm font-medium mb-2 text-gray-700">
				Имя (русский) *
			</label>
			<input 
				type="text" 
				id="editNameRu" 
				bind:value={editTeacher.nameRu} 
				required 
				placeholder="Введите имя на русском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="editNameKz" class="block text-sm font-medium mb-2 text-gray-700">
				Имя (казахский) *
			</label>
			<input 
				type="text" 
				id="editNameKz" 
				bind:value={editTeacher.nameKz} 
				required 
				placeholder="Введите имя на казахском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="editSubjectRu" class="block text-sm font-medium mb-2 text-gray-700">
				Предмет (русский) *
			</label>
			<input 
				type="text" 
				id="editSubjectRu" 
				bind:value={editTeacher.subjectRu} 
				required 
				placeholder="Введите предмет на русском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="editSubjectKz" class="block text-sm font-medium mb-2 text-gray-700">
				Предмет (казахский) *
			</label>
			<input 
				type="text" 
				id="editSubjectKz" 
				bind:value={editTeacher.subjectKz} 
				required 
				placeholder="Введите предмет на казахском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="editEmail" class="block text-sm font-medium mb-2 text-gray-700">
				Email *
			</label>
			<input 
				type="email" 
				id="editEmail" 
				bind:value={editTeacher.email} 
				required 
				placeholder="teacher@school.com"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="editPhone" class="block text-sm font-medium mb-2 text-gray-700">
				Телефон *
			</label>
			<input 
				type="tel" 
				id="editPhone" 
				bind:value={editTeacher.phone} 
				required 
				placeholder="+7 (XXX) XXX-XX-XX"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="editBirthday" class="block text-sm font-medium mb-2 text-gray-700">
				Дата рождения *
			</label>
			<input 
				type="date" 
				id="editBirthday" 
				bind:value={editTeacher.birthday} 
				required 
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="edit-teacher-image-upload" class="block text-sm font-medium mb-2 text-gray-700">
				Изображение
			</label>
			<ImageUpload
				id="edit-teacher-image-upload"
				bind:value={editTeacher.imageUrl}
				folder="teachers"
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
	margin-right: 0.4rem;
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
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 1.5rem;
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