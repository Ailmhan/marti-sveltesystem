<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import { authStore } from '$lib/stores/auth';
	import { adminStore } from '$lib/stores/admin';
	import { languageStore } from '$lib/stores/language';
	import type { Teacher } from '$lib/types/api';
	import DataModal from '$lib/components/DataModal.svelte';
	import DataCard from '$lib/components/DataCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import ImageDisplaySettings from '$lib/components/ImageDisplaySettings.svelte';
	import { uploadBlobToDigitalOceanSpaces } from '$lib/utils/digitalOceanSpaces';

	let teachers: Teacher[] = [];
	let loading = false;
	let error = '';
	// Состояние для модальных окон
	let showAddModal = false;
	let showEditModal = false;
	let modalLoading = false;
	let modalError = '';
	let isUploadingCroppedImage = false;
	let newTeacher = {
		nameRu: '',
		nameKz: '',
		subjectRu: '',
		subjectKz: '',
		birthday: '',
		email: '',
		phone: '',
		imageUrl: ''
	};

	// Состояние для редактирования
	let editingTeacher: Teacher | null = null;
	let editForm = {
		nameRu: '',
		nameKz: '',
		subjectRu: '',
		subjectKz: '',
		birthday: '',
		email: '',
		phone: '',
		imageUrl: '' as string | undefined
	};

	// Состояние для валидации изображений
	let addImageUrlValid = false;
	let editImageUrlValid = false;



	// Проверяем, можно ли сохранить в модале добавления
	$: canAddTeacher = (() => {
		const isImageValid = !newTeacher.imageUrl || (newTeacher.imageUrl.startsWith('https://martiphoto.sgp1.cdn.digitaloceanspaces.com/') || newTeacher.imageUrl.startsWith('https://sgp1.cdn.digitaloceanspaces.com/martiphoto/'));
		return isImageValid;
	})();

	// Проверяем, можно ли сохранить в модале редактирования
	$: canEditTeacher = (() => {
		const isImageValid = !editForm.imageUrl || (editForm.imageUrl.startsWith('https://martiphoto.sgp1.cdn.digitaloceanspaces.com/') || editForm.imageUrl.startsWith('https://sgp1.cdn.digitaloceanspaces.com/martiphoto/'));
		return isImageValid;
	})();

	onMount(() => {
		loadTeachers();
	});

	async function loadTeachers() {
		if (!$authStore.schoolId) return;
		
		try {
			console.log('🔄 Загружаем список учителей...');
			loading = true;
			error = '';
			const teachersData = await apiClient.getTeachers($authStore.schoolId);
			teachers = teachersData;
			console.log('✅ Список учителей загружен:', teachersData.length, 'учителей');
			
			// Проверяем, есть ли обновленный учитель
			const editingTeacherId = editingTeacher?.id;
			if (editingTeacherId) {
				const updatedTeacher = teachers.find((t) => t.id === editingTeacherId);
				console.log('🔍 Обновленный учитель в списке:', updatedTeacher);
				if (updatedTeacher) {
					console.log('🖼️ URL изображения обновленного учителя:', updatedTeacher.imageUrl);
				}
			}
		} catch (err) {
			console.error('❌ Ошибка загрузки учителей:', err);
			error = err instanceof Error ? err.message : 'Ошибка загрузки учителей';
		} finally {
			loading = false;
		}
	}

	async function addTeacher() {
		if (!newTeacher.nameRu || !newTeacher.subjectRu) {
			modalError = 'Пожалуйста, заполните обязательные поля';
			return;
		}

		modalLoading = true;
		modalError = '';

		try {
			await apiClient.createTeacher({
				...newTeacher,
				schoolId: 10
			});
			
			await loadTeachers();
			closeAddModal();
		} catch (err) {
			modalError = err instanceof Error ? err.message : 'Ошибка создания учителя';
		} finally {
			modalLoading = false;
		}
	}

	async function updateTeacher() {
		if (!editingTeacher || !editForm.nameRu || !editForm.subjectRu) {
			modalError = 'Пожалуйста, заполните обязательные поля';
			return;
		}

		modalLoading = true;
		modalError = '';

		try {
			console.log('🔄 Отправляем PATCH запрос для обновления учителя...');
			console.log('📊 Данные для обновления:', {
				id: editingTeacher.id,
				nameRu: editForm.nameRu,
				subjectRu: editForm.subjectRu,
				imageUrl: editForm.imageUrl,
				imageUrlType: typeof editForm.imageUrl,
				isImageUrlValid: editForm.imageUrl?.startsWith('https://martiphoto.sgp1.cdn.digitaloceanspaces.com/')
			});

			const result = await apiClient.updateTeacher(editingTeacher.id, {
				...editForm
			});
			
			console.log('✅ Учитель успешно обновлен:', result);
			console.log('🔄 Перезагружаем список учителей...');
			
			await loadTeachers();
			closeEditModal();
		} catch (err) {
			console.error('❌ Ошибка обновления учителя:', err);
			modalError = err instanceof Error ? err.message : 'Ошибка обновления учителя';
		} finally {
			modalLoading = false;
		}
	}

	function openAddModal() {
		showAddModal = true;
		modalError = '';
		newTeacher = {
			nameRu: '',
			nameKz: '',
			subjectRu: '',
			subjectKz: '',
			birthday: '',
			email: '',
			phone: '',
			imageUrl: ''
		};
	}

	function closeAddModal() {
		showAddModal = false;
		modalError = '';
	}

	function editTeacher(teacher: Teacher) {
		console.log('🎯 === ОТКРЫТИЕ МОДАЛКИ РЕДАКТИРОВАНИЯ ===');
		console.log('👤 Учитель для редактирования:', teacher);
		
		editingTeacher = teacher;
		editForm = {
			nameRu: teacher.nameRu || '',
			nameKz: teacher.nameKz || '',
			subjectRu: teacher.subjectRu || '',
			subjectKz: teacher.subjectKz || '',
			birthday: teacher.birthday ? new Date(teacher.birthday).toISOString().split('T')[0] : '',
			email: teacher.email || '',
			phone: teacher.phone || '',
			imageUrl: teacher.imageUrl || undefined
		};
		
		console.log('📝 Форма редактирования инициализирована:', editForm);
		console.log('🖼️ URL изображения:', {
			original: teacher.imageUrl,
			form: editForm.imageUrl,
			type: typeof editForm.imageUrl
		});
		
		showEditModal = true;
		modalError = '';
		console.log('🎯 === МОДАЛКА ОТКРЫТА ===');
	}

	function closeEditModal() {
		showEditModal = false;
		editingTeacher = null;
		modalError = '';
	}

	async function deleteTeacher(id: number) {
		try {
			await apiClient.deleteTeacher(id);
			await loadTeachers();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка удаления учителя';
		}
	}

	function handleImageChange(event: CustomEvent) {
		// ImageUpload уже обрабатывает загрузку, просто получаем URL
		const url = event.detail.value;
		if (url) {
			newTeacher.imageUrl = url;
		}
	}
</script>

<svelte:head>
	<title>Учителя - Школьная система</title>
</svelte:head>

<div class="teachers-page">
	<div class="page-header">
		<h1>Учителя школы</h1>
		{#if $adminStore.isAdminMode}
			<div class="page-actions">
				<button class="btn btn-primary add-btn" on:click={openAddModal}>
					<span class="btn-icon">➕</span>
					Добавить учителя
				</button>
			</div>
		{/if}
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
                <DataCard
                    data={teacher}
                    type="teacher"
                    language={$languageStore}
                    showActions={$adminStore.isAdminMode}
                    onEdit={() => editTeacher(teacher)}
                    					onDelete={$adminStore.isAdminMode ? () => deleteTeacher(teacher.id) : undefined}
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
	{#if !$adminStore.isAdminMode}
		<div class="admin-info-compact">
			<span class="admin-info-icon">🔐</span>
			<span class="admin-info-text">Войдите в режим администратора для управления данными</span>
		</div>
	{/if}
</div>

<!-- Модальное окно добавления учителя -->
<DataModal
	bind:open={showAddModal}
	title="Добавить учителя"
	loading={modalLoading}
	disableSubmit={!canAddTeacher}
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
			<label for="imageUrl" class="block text-sm font-medium mb-2 text-gray-700">
				Фото
			</label>
			<ImageUpload 
				bind:value={newTeacher.imageUrl} 
				folder="teachers" 
				on:change={(event) => newTeacher.imageUrl = event.detail.value}
				on:success={(event) => {
					newTeacher.imageUrl = event.detail.url;
					console.log('Teacher photo uploaded successfully:', event.detail.url);
				}}
			/>
		</div>

		<!-- Настройки отображения изображения -->
		{#if newTeacher.imageUrl}
			<div>
				{#if isUploadingCroppedImage}
					<div class="alert alert-info">
						⏳ Загружаем обрезанное изображение...
					</div>
				{/if}
				<ImageDisplaySettings 
					imageUrl={newTeacher.imageUrl}
					outputSize={400}
					format="image/jpeg"
					quality={0.9}
					title="Настройка фото учителя (340x240px)"
					on:confirm={async (event) => {
						try {
							isUploadingCroppedImage = true;
							// Получаем обрезанное изображение
							const { blob, dataUrl } = event.detail;
							console.log('🔄 Загружаем обрезанное изображение на сервер...');
							
							const result = await uploadBlobToDigitalOceanSpaces(blob, 'cropped-image.jpg', 'teachers');
							if (!result.success || !result.url) {
								throw new Error('Failed to upload cropped image');
							}
							console.log('✅ Обрезанное изображение загружено:', result.url);
							
							// Обновляем URL на реальный CDN URL
							newTeacher.imageUrl = result.url;
							console.log('🔄 URL обновлен на CDN:', result.url);
							
						} catch (error) {
							console.error('❌ Ошибка загрузки обрезанного изображения:', error);
							modalError = 'Не удалось загрузить обрезанное изображение';
						} finally {
							isUploadingCroppedImage = false;
						}
					}}
					on:cancel={() => {
						console.log('Обрезка фото отменена');
					}}
					on:error={(event) => {
						modalError = `Ошибка обрезки фото: ${event.detail.message}`;
					}}
				/>
			</div>
		{/if}
	</div>
</DataModal>

<!-- Модальное окно редактирования учителя -->
<DataModal
	bind:open={showEditModal}
	title="Редактировать учителя"
	loading={modalLoading}
	disableSubmit={!canEditTeacher}
	on:close={closeEditModal}
	on:submit={updateTeacher}
>
	<div class="space-y-4">
		{#if modalError}
			<div class="alert alert-error">{modalError}</div>
		{/if}

		<div>
			<label for="edit-nameRu" class="block text-sm font-medium mb-2 text-gray-700">
				Имя (русский) *
			</label>
			<input 
				type="text" 
				id="edit-nameRu" 
				bind:value={editForm.nameRu} 
				required 
				placeholder="Введите имя на русском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="edit-nameKz" class="block text-sm font-medium mb-2 text-gray-700">
				Имя (казахский)
			</label>
			<input 
				type="text" 
				id="edit-nameKz" 
				bind:value={editForm.nameKz} 
				placeholder="Введите имя на казахском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="edit-subjectRu" class="block text-sm font-medium mb-2 text-gray-700">
				Предмет (русский) *
			</label>
			<input 
				type="text" 
				id="edit-subjectRu" 
				bind:value={editForm.subjectRu} 
				required 
				placeholder="Введите предмет на русском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="edit-subjectKz" class="block text-sm font-medium mb-2 text-gray-700">
				Предмет (казахский)
			</label>
			<input 
				type="text" 
				id="edit-subjectKz" 
				bind:value={editForm.subjectKz} 
				placeholder="Введите предмет на казахском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="edit-birthday" class="block text-sm font-medium mb-2 text-gray-700">
				День рождения
			</label>
			<input 
				type="date" 
				id="edit-birthday" 
				bind:value={editForm.birthday} 
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="edit-email" class="block text-sm font-medium mb-2 text-gray-700">
				Email
			</label>
			<input 
				type="email" 
				id="edit-email" 
				bind:value={editForm.email} 
				placeholder="Введите email"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="edit-phone" class="block text-sm font-medium mb-2 text-gray-700">
				Телефон
			</label>
			<input 
				type="tel" 
				id="edit-phone" 
				bind:value={editForm.phone} 
				placeholder="Введите телефон"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="edit-imageUrl" class="block text-sm font-medium mb-2 text-gray-700">
				Фото
			</label>
			<ImageUpload 
				bind:value={editForm.imageUrl} 
				folder="teachers" 
				on:change={(event) => editForm.imageUrl = event.detail.value}
				on:success={(event) => {
					editForm.imageUrl = event.detail.url;
					console.log('Teacher photo updated successfully:', event.detail.url);
				}}
			/>
		</div>

		<!-- Настройки отображения изображения -->
		{#if editForm.imageUrl}
			<div>
				{#if isUploadingCroppedImage}
					<div class="alert alert-info">
						⏳ Загружаем обрезанное изображение...
					</div>
				{/if}
				
				<!-- Отладочная информация -->
				<div class="alert alert-info">
					<strong>Отладка:</strong> 
					editForm.imageUrl = {editForm.imageUrl?.substring(0, 50)}...
					<br>
					<button 
						type="button" 
						class="btn btn-secondary mt-2"
						on:click={() => {
							console.log('🔍 Текущее состояние editForm:', editForm);
							console.log('🖼️ editForm.imageUrl:', editForm.imageUrl);
						}}
					>
						🔍 Проверить состояние
					</button>
				</div>
				
				<ImageDisplaySettings 
					imageUrl={editForm.imageUrl}
					outputSize={400}
					format="image/jpeg"
					quality={0.9}
					title="Настройка фото учителя (340x240px)"
					on:confirm={async (event) => {
						try {
							isUploadingCroppedImage = true;
							console.log('🎯 === НАЧАЛО ОБРАБОТКИ ОБРЕЗАННОГО ИЗОБРАЖЕНИЯ ===');
							
							// Получаем обрезанное изображение
							const { blob, dataUrl } = event.detail;
							console.log('📊 Детали события:', { blob, dataUrl });
							console.log('🔄 Загружаем обрезанное изображение на сервер...');
							
							const result = await uploadBlobToDigitalOceanSpaces(blob, 'cropped-image.jpg', 'teachers');
							if (!result.success || !result.url) {
								throw new Error('Failed to upload cropped image');
							}
							console.log('✅ Обрезанное изображение загружено:', result);
							
							// Обновляем URL на реальный CDN URL
							const oldUrl = editForm.imageUrl;
							editForm.imageUrl = result.url;
							
							console.log('🔄 URL обновлен:', {
								old: oldUrl,
								new: editForm.imageUrl,
								type: typeof editForm.imageUrl,
								isValid: editForm.imageUrl?.startsWith('https://martiphoto.sgp1.cdn.digitaloceanspaces.com/')
							});
							
							console.log('🎯 === ОБРАБОТКА ЗАВЕРШЕНА ===');
							
							// Показываем уведомление об успехе
							modalError = '';
							alert('✅ Обрезанное изображение успешно загружено! Теперь нажмите "Сохранить".');
							
						} catch (error) {
							console.error('❌ Ошибка загрузки обрезанного изображения:', error);
							modalError = 'Не удалось загрузить обрезанное изображение';
						} finally {
							isUploadingCroppedImage = false;
						}
					}}
					on:cancel={() => {
						console.log('Обрезка фото отменена');
					}}
					on:error={(event) => {
						modalError = `Ошибка обрезки фото: ${event.detail.message}`;
					}}
				/>
			</div>
		{/if}
	</div>
</DataModal>

<style>
.alert {
	padding: 0.75rem 1rem;
	border-radius: 0.5rem;
	margin-bottom: 1rem;
	font-size: 0.875rem;
}

.alert-info {
	background-color: #dbeafe;
	border: 1px solid #93c5fd;
	color: #1e40af;
}

.alert-error {
	background-color: #fee2e2;
	border: 1px solid #fca5a5;
	color: #dc2626;
}

.btn-secondary {
	background-color: #6b7280;
	color: white;
	border: none;
	padding: 0.5rem 1rem;
	border-radius: 0.375rem;
	font-size: 0.875rem;
	cursor: pointer;
	transition: background-color 0.2s;
}

.btn-secondary:hover {
	background-color: #4b5563;
}

.mt-2 {
	margin-top: 0.5rem;
}

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
	grid-template-columns: repeat(3, 340px);
	justify-content: start;
	gap: 1.5rem;
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

	/* Admin info styles */
	.admin-info {
		margin: 2rem 0;
		padding: 2rem;
		background: hsl(var(--muted) / 0.1);
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		text-align: center;
	}

	.admin-info-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.admin-info-icon {
		font-size: 3rem;
		opacity: 0.7;
	}

	.admin-info-text h3 {
		margin: 0 0 0.5rem 0;
		color: hsl(var(--foreground));
		font-size: 1.25rem;
		font-weight: 600;
	}

	.admin-info-text p {
		margin: 0 0 1rem 0;
		color: hsl(var(--muted-foreground));
		max-width: 500px;
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

	/* Темная тема */
	:global(.dark) .teachers-page {
		background: hsl(var(--background));
		color: hsl(var(--foreground));
	}

	:global(.dark) .page-header h1 {
		color: hsl(var(--foreground));
	}

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

	:global(.dark) .empty-state {
		background: hsl(var(--card));
		border-color: hsl(var(--border));
		color: hsl(var(--foreground));
	}

	:global(.dark) .error-message {
		background: hsl(var(--destructive) / 0.1);
		border-color: hsl(var(--destructive));
		color: hsl(var(--destructive-foreground));
	}
</style>
