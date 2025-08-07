<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import { authStore } from '$lib/stores/auth';
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
			console.error('Error loading menus:', err);
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
			await apiClient.createCanteenMenu({
				...newMenu,
				schoolId: $authStore.schoolId
			});
			
			// Сбрасываем форму
			newMenu = {
				date: '',
				dishesRu: { breakfast: '', lunch: '', dinner: '' },
				dishesKz: { breakfast: '', lunch: '', dinner: '' },
				imageUrl: undefined
			};
			
			// Закрываем модальное окно
			showAddModal = false;
			
			// Перезагружаем меню
			await loadMenus();
		} catch (err) {
			console.error('Error creating menu:', err);
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
		newMenu.imageUrl = event.detail.value;
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
</script>

<svelte:head>
	<title>Столовая - Школьная система</title>
</svelte:head>

<div class="canteen-page">
	<div class="page-header">
		<h1>Меню столовой</h1>
		<div class="page-actions">
			<button class="btn btn-primary add-btn" on:click={openModal}>
				<span class="btn-icon">➕</span>
				Добавить меню
			</button>
		</div>
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
		<div class="grid-container grid-3">
			{#each menus as menu}
				<DataCard
					data={menu}
					type="canteen"
					showActions={true}
					onEdit={() => console.log('Edit menu:', menu.id)}
					onDelete={() => deleteMenu(menu.id)}
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
				folder="canteen"
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
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
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
		grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
		gap: 1.5rem;
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

		.grid-container {
			grid-template-columns: 1fr;
		}
	}
</style> 