<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import { authStore } from '$lib/stores/auth';
	import { adminStore } from '$lib/stores/admin';
	import { languageStore } from '$lib/stores/language';
	import type { CanteenMenu } from '$lib/types/api';
	import { format } from 'date-fns';
	import { ru, kk } from 'date-fns/locale';
	import DataCard from '$lib/components/DataCard.svelte';
	import DataModal from '$lib/components/DataModal.svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { uploadToDigitalOceanSpaces } from '$lib/utils/digitalOceanSpaces';

	let menus: CanteenMenu[] = [];
	let loading = false;
	let error = '';
	let showAddModal = false;
	let modalError = '';

	let newMenu = {
		date: '',
		dishesRu: {
			breakfast: '',
			lunch: '',
			dinner: ''
		},
		dishesKz: {
			breakfast: '',
			lunch: '',
			dinner: ''
		},
		imageUrl: undefined as string | undefined
	};

	// Состояние для редактирования
	let showEditModal = false;
	let editingMenu: CanteenMenu | null = null;
	let editForm = {
		date: '',
		dishesRu: {
			breakfast: '',
			lunch: '',
			dinner: ''
		},
		dishesKz: {
			breakfast: '',
			lunch: '',
			dinner: ''
		},
		imageUrl: undefined as string | undefined
	};

	// Состояние для загрузки изображений
	let addImageUploading = false;
	let editImageUploading = false;

	onMount(() => {
		loadMenus();
	});

	async function loadMenus() {
		if (!$authStore.schoolId) return;
		
		try {
			loading = true;
			error = '';
			const menusData = await apiClient.getCanteenMenu($authStore.schoolId);
			menus = menusData;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка загрузки меню';
		} finally {
			loading = false;
		}
	}

	async function addMenu() {
		if (!$authStore.schoolId) {
			modalError = 'ID школы не найден';
			return;
		}

		// Валидация
		if (!newMenu.date || 
			!newMenu.dishesRu.breakfast.trim() || !newMenu.dishesRu.lunch.trim() || !newMenu.dishesRu.dinner.trim() ||
			!newMenu.dishesKz.breakfast.trim() || !newMenu.dishesKz.lunch.trim() || !newMenu.dishesKz.dinner.trim()) {
			modalError = 'Все поля должны быть заполнены';
			return;
		}

		try {
			modalError = '';
			
			// Подготавливаем данные для отправки
			const createData = {
				date: new Date(newMenu.date + 'T00:00:00.000Z').toISOString(), // Конвертируем в ISO 8601
				dishesRu: {
					breakfast: newMenu.dishesRu.breakfast.trim(),
					lunch: newMenu.dishesRu.lunch.trim(),
					dinner: newMenu.dishesRu.dinner.trim()
				},
				dishesKz: {
					breakfast: newMenu.dishesKz.breakfast.trim(),
					lunch: newMenu.dishesKz.lunch.trim(),
					dinner: newMenu.dishesKz.dinner.trim()
				},
				schoolId: $authStore.schoolId
			};
			
			// Добавляем imageUrl только если он есть
			if (newMenu.imageUrl) {
				createData.imageUrl = newMenu.imageUrl;
			}
			
			// Проверяем, что все обязательные поля заполнены
			if (!createData.date || !createData.schoolId) {
				modalError = 'Дата и ID школы обязательны';
				return;
			}
			
			console.log('Отправляем данные для создания:', createData);
			console.log('Формат даты:', createData.date);
			
			await apiClient.createCanteenMenu(createData);
			
			// Сбрасываем форму
			newMenu = {
				date: '',
				dishesRu: { breakfast: '', lunch: '', dinner: '' },
				dishesKz: { breakfast: '', lunch: '', dinner: '' },
				imageUrl: undefined
			};
			
			// Сбрасываем состояние загрузки
			addImageUploading = false;
			
			// Закрываем модальное окно
			showAddModal = false;
			
			// Перезагружаем меню
			await loadMenus();
		} catch (err) {
			modalError = err instanceof Error ? err.message : 'Ошибка создания меню';
		}
	}

	function openModal() {
		showAddModal = true;
		modalError = '';
	}

	function closeModal() {
		showAddModal = false;
		modalError = '';
		addImageUploading = false;
		newMenu = {
			date: '',
			dishesRu: {
				breakfast: '',
				lunch: '',
				dinner: ''
			},
			dishesKz: {
				breakfast: '',
				lunch: '',
				dinner: ''
			},
			imageUrl: undefined
		};
	}

	function handleImageChange(event: CustomEvent) {
		const url = event.detail.value;
		if (url) {
			if (showEditModal && editingMenu) {
				editForm.imageUrl = url;
			} else {
				newMenu.imageUrl = url;
			}
		}
	}

	function handleAddImageChange(event: CustomEvent) {
		const url = event.detail.value;
		if (url) {
			newMenu.imageUrl = url;
		}
	}

	function handleEditImageChange(event: CustomEvent) {
		const url = event.detail.value;
		if (url) {
			editForm.imageUrl = url;
		}
	}

	function formatDate(date: Date | string) {
		return format(new Date(date), 'dd MMMM yyyy', {
			locale: ru // Always use ru for date formatting
		});
	}

	async function deleteMenu(id: number) {
		if (confirm('Вы уверены, что хотите удалить это меню?')) {
			try {
				await apiClient.deleteCanteenMenu(id);
				await loadMenus();
			} catch (err) {
				error = err instanceof Error ? err.message : 'Ошибка удаления меню';
			}
		}
	}

	function editMenu(menu: CanteenMenu) {
		editingMenu = menu;
		console.log('Редактируем меню:', menu);
		
		// Правильно форматируем дату для input[type="date"]
		let formattedDate = '';
		if (menu.date) {
			try {
				const date = new Date(menu.date);
				if (!isNaN(date.getTime())) {
					formattedDate = date.toISOString().split('T')[0];
				} else {
					console.warn('Некорректная дата:', menu.date);
				}
			} catch (error) {
				console.error('Ошибка форматирования даты:', error);
			}
		}
		
		editForm = {
			date: formattedDate,
			dishesRu: {
				breakfast: menu.dishesRu?.breakfast || '',
				lunch: menu.dishesRu?.lunch || '',
				dinner: menu.dishesRu?.dinner || ''
			},
			dishesKz: {
				breakfast: menu.dishesKz?.breakfast || '',
				lunch: menu.dishesKz?.lunch || '',
				dinner: menu.dishesKz?.dinner || ''
			},
			imageUrl: menu.imageUrl || undefined
		};
		
		console.log('Форма редактирования:', editForm);
		showEditModal = true;
		modalError = '';
	}

	function closeEditModal() {
		showEditModal = false;
		editingMenu = null;
		modalError = '';
		editImageUploading = false;
	}

	async function updateMenu() {
		if (!$authStore.schoolId || !editingMenu) {
			modalError = 'ID школы или меню не найден';
			return;
		}

		// Валидация
		if (!editForm.date || 
			!editForm.dishesRu.breakfast.trim() || !editForm.dishesRu.lunch.trim() || !editForm.dishesRu.dinner.trim() ||
			!editForm.dishesKz.breakfast.trim() || !editForm.dishesKz.lunch.trim() || !editForm.dishesKz.dinner.trim()) {
			modalError = 'Все поля должны быть заполнены';
			return;
		}

		try {
			modalError = '';
			
					// Подготавливаем данные для отправки (убираем лишние поля)
		const updateData = {
			date: new Date(editForm.date + 'T00:00:00.000Z').toISOString(), // Конвертируем в ISO 8601
			dishesRu: {
				breakfast: editForm.dishesRu.breakfast.trim(),
				lunch: editForm.dishesRu.lunch.trim(),
				dinner: editForm.dishesRu.dinner.trim()
			},
			dishesKz: {
				breakfast: editForm.dishesKz.breakfast.trim(),
				lunch: editForm.dishesKz.lunch.trim(),
				dinner: editForm.dishesKz.dinner.trim()
			},
			schoolId: $authStore.schoolId
		};
		
		// Добавляем imageUrl только если он есть
		if (editForm.imageUrl) {
			updateData.imageUrl = editForm.imageUrl;
		}
		
		// Проверяем, что все обязательные поля заполнены
		if (!updateData.date || !updateData.schoolId) {
			modalError = 'Дата и ID школы обязательны';
			return;
		}
		
		console.log('Отправляем данные для обновления:', updateData);
		console.log('dishesRu детально:', JSON.stringify(updateData.dishesRu, null, 2));
		console.log('dishesKz детально:', JSON.stringify(updateData.dishesKz, null, 2));
		console.log('Формат даты:', updateData.date);
			
			await apiClient.updateCanteenMenu(editingMenu.id, updateData);
			
			// Закрываем модальное окно после успешного обновления
			closeEditModal();
			
			// Сбрасываем состояние загрузки
			editImageUploading = false;
			
			// Перезагружаем меню
			await loadMenus();
		} catch (err) {
			console.error('Ошибка обновления меню:', err);
			if (err instanceof Error) {
				modalError = `Ошибка обновления меню: ${err.message}`;
			} else {
				modalError = 'Неизвестная ошибка обновления меню';
			}
		}
	}
</script>

<svelte:head>
	<title>Столовая - Школьная система</title>
</svelte:head>

<div class="canteen-page">
	<div class="page-header">
		<h1>Меню столовой</h1>
		{#if $adminStore.isAdminMode}
			<div class="page-actions">
				<button class="btn btn-primary add-btn" on:click={openModal}>
					<span class="btn-icon">➕</span>
					Добавить меню
				</button>
			</div>
		{/if}
	</div>

	{#if loading}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Загрузка меню...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<h2>Ошибка</h2>
			<p>{error}</p>
			<button class="btn btn-primary" on:click={loadMenus}>Попробовать снова</button>
		</div>
	{:else if menus.length > 0}
		{#if !$adminStore.isAdminMode}
			<div class="admin-info-compact">
				<span class="admin-info-icon">🔐</span>
				<span class="admin-info-text">Войдите в режим администратора для управления данными</span>
			</div>
		{/if}
		
		<div class="grid-container grid-3">
			{#each menus as menu}
				<DataCard
					data={menu}
					type="canteen"
					language={$languageStore}
					showActions={$adminStore.isAdminMode}
					onEdit={() => editMenu(menu)}
					onDelete={$adminStore.isAdminMode ? () => deleteMenu(menu.id) : undefined}
				/>
			{/each}
		</div>
	{:else}
		<EmptyState
			title="Меню пока нет"
			description="Добавьте первое меню в систему!"
			icon="🍽️"
			buttonText="Добавить меню"
			onAction={openModal}
		/>
	{/if}
</div>

<!-- Модальное окно добавления меню -->
	<DataModal
		bind:open={showAddModal}
		title="Добавить меню"
		loading={false}
		disableSubmit={addImageUploading}
		on:close={closeModal}
		on:submit={addMenu}
	>
	<div class="space-y-4">
		{#if modalError}
			<div class="alert alert-error">
				{modalError}
			</div>
		{/if}

		<div>
			<label for="date" class="block text-sm font-medium mb-2 text-gray-700">
				Дата *
			</label>
			<input
				id="date"
				type="date"
				bind:value={newMenu.date}
				required
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<h4 class="font-medium text-gray-700 mb-2">Завтрак</h4>
				<input
					type="text"
					bind:value={newMenu.dishesRu.breakfast}
					placeholder="Завтрак (русский)"
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors mb-2"
				/>
				<input
					type="text"
					bind:value={newMenu.dishesKz.breakfast}
					placeholder="Завтрак (казахский)"
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
				/>
			</div>

			<div>
				<h4 class="font-medium text-gray-700 mb-2">Обед</h4>
				<input
					type="text"
					bind:value={newMenu.dishesRu.lunch}
					placeholder="Обед (русский)"
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors mb-2"
				/>
				<input
					type="text"
					bind:value={newMenu.dishesKz.lunch}
					placeholder="Обед (казахский)"
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
				/>
			</div>
		</div>

		<div>
			<h4 class="font-medium text-gray-700 mb-2">Ужин</h4>
			<input
				type="text"
				bind:value={newMenu.dishesRu.dinner}
				placeholder="Ужин (русский)"
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors mb-2"
			/>
			<input
				type="text"
				bind:value={newMenu.dishesKz.dinner}
				placeholder="Ужин (казахский)"
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="menu-image-upload" class="block text-sm font-medium mb-2 text-gray-700">
				Изображение меню
			</label>
			<ImageUpload
				id="menu-image-upload"
				bind:value={newMenu.imageUrl}
				bind:uploading={addImageUploading}
				folder="canteen"
				on:change={handleAddImageChange}
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

<!-- Модальное окно редактирования меню -->
	<DataModal
		bind:open={showEditModal}
		title="Редактировать меню"
		loading={false}
		disableSubmit={editImageUploading}
		on:close={closeEditModal}
		on:submit={updateMenu}
	>
	<div class="space-y-4">
		{#if modalError}
			<div class="alert alert-error">
				{modalError}
			</div>
		{/if}

		<div>
			<label for="edit-date" class="block text-sm font-medium mb-2 text-gray-700">
				Дата *
			</label>
			<input
				id="edit-date"
				type="date"
				bind:value={editForm.date}
				required
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<h4 class="font-medium text-gray-700 mb-2">Завтрак</h4>
				<input
					type="text"
					bind:value={editForm.dishesRu.breakfast}
					placeholder="Завтрак (русский)"
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors mb-2"
				/>
				<input
					type="text"
					bind:value={editForm.dishesKz.breakfast}
					placeholder="Завтрак (казахский)"
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
				/>
			</div>

			<div>
				<h4 class="font-medium text-gray-700 mb-2">Обед</h4>
				<input
					type="text"
					bind:value={editForm.dishesRu.lunch}
					placeholder="Обед (русский)"
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors mb-2"
				/>
				<input
					type="text"
					bind:value={editForm.dishesKz.lunch}
					placeholder="Обед (казахский)"
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
				/>
			</div>
		</div>

		<div>
			<h4 class="font-medium text-gray-700 mb-2">Ужин</h4>
			<input
				type="text"
				bind:value={editForm.dishesRu.dinner}
				placeholder="Ужин (русский)"
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors mb-2"
			/>
			<input
				type="text"
				bind:value={editForm.dishesKz.dinner}
				placeholder="Ужин (казахский)"
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="edit-menu-image-upload" class="block text-sm font-medium mb-2 text-gray-700">
				Изображение меню
			</label>
			<ImageUpload
				id="edit-menu-image-upload"
				bind:value={editForm.imageUrl}
				bind:uploading={editImageUploading}
				folder="canteen"
				on:change={handleEditImageChange}
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
	.canteen-page {
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
		color: hsl(var(--destructive));
	}

	.error-container p {
		margin: 0 0 1.5rem 0;
	}

	.grid-container {
		display: grid;
		grid-template-columns: repeat(3, 400px);
		justify-content: start;
		gap: 1.5rem;
	}
	
	@media (max-width: 1400px) {
		.grid-container {
			grid-template-columns: repeat(2, 400px);
		}
	}
	
	@media (max-width: 900px) {
		.grid-container {
			grid-template-columns: 1fr;
			max-width: 500px;
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

	/* Dark theme support for form inputs */
	:global(.dark) input[type="text"],
	:global(.dark) input[type="date"] {
		background-color: hsl(var(--background));
		border-color: hsl(var(--border));
		color: hsl(var(--foreground));
	}

	:global(.dark) input[type="text"]:focus,
	:global(.dark) input[type="date"]:focus {
		border-color: hsl(var(--ring));
		box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
	}

	:global(.dark) label,
	:global(.dark) h4 {
		color: hsl(var(--foreground));
	}

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

		.grid-container {
			grid-template-columns: 1fr;
		}
	}
</style> 