<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import { authStore } from '$lib/stores/auth';
	import type { HonorBoard } from '$lib/types/api';
	import DataModal from '$lib/components/DataModal.svelte';
	import DataCard from '$lib/components/DataCard.svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let honorBoard: HonorBoard[] = [];
	let loading = false;
	let error = '';
	let showAddModal = false;
	let modalError = '';
	let modalLoading = false;

	let newHonorBoard = {
		studentName: '',
		descriptionRu: '',
		descriptionKz: '',
		imageUrl: undefined as string | undefined
	};

	onMount(() => {
		loadHonorBoard();
	});

	async function loadHonorBoard() {
		if (!$authStore.schoolId) return;
		
		try {
			loading = true;
			error = '';
			const honorBoardData = await apiClient.getHonorBoard($authStore.schoolId);
			honorBoard = honorBoardData;
		} catch (err) {
			console.error('Error loading honor board:', err);
			error = err instanceof Error ? err.message : 'Ошибка загрузки доски почета';
		} finally {
			loading = false;
		}
	}

	async function addHonorBoard() {
		if (!$authStore.schoolId) {
			modalError = 'ID школы не найден';
			return;
		}

		// Валидация
		if (!newHonorBoard.studentName.trim() || !newHonorBoard.descriptionRu.trim() || !newHonorBoard.descriptionKz.trim()) {
			modalError = 'Все поля должны быть заполнены';
			return;
		}

		try {
			modalError = '';
			modalLoading = true;
			
			await apiClient.createHonorBoard({
				...newHonorBoard,
				schoolId: $authStore.schoolId
			});
			
			// Сбрасываем форму
			newHonorBoard = {
				studentName: '',
				descriptionRu: '',
				descriptionKz: '',
				imageUrl: undefined
			};
			
			// Закрываем модальное окно после успешного сохранения
			showAddModal = false;
			modalLoading = false;
			
			// Перезагружаем данные
			await loadHonorBoard();
		} catch (err) {
			console.error('Error creating honor board entry:', err);
			modalError = err instanceof Error ? err.message : 'Ошибка создания записи';
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
		newHonorBoard = {
			studentName: '',
			descriptionRu: '',
			descriptionKz: '',
			imageUrl: undefined
		};
	}

	function handleImageChange(event: CustomEvent) {
		// ImageUpload уже обрабатывает загрузку, просто получаем URL
		const url = event.detail.value;
		if (url) {
			newHonorBoard.imageUrl = url;
			console.log('Image URL set:', url);
		}
	}

	async function deleteHonorBoard(id: number) {
		try {
			await apiClient.deleteHonorBoard(id);
			await loadHonorBoard();
		} catch (err) {
			console.error('Error deleting honor board entry:', err);
			error = err instanceof Error ? err.message : 'Ошибка удаления записи';
		}
	}
</script>

<svelte:head>
	<title>Доска почета - Школьная система</title>
</svelte:head>

<div class="honor-board-page">
	<div class="page-header">
		<h1>Доска почета школы</h1>
		<div class="page-actions">
			<button class="btn btn-primary add-btn" on:click={openModal}>
				<span class="btn-icon">➕</span>
				Добавить ученика
			</button>
		</div>
	</div>

	{#if loading}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Загрузка доски почета...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<h2>Ошибка</h2>
			<p>{error}</p>
			<button class="btn btn-primary" on:click={loadHonorBoard}>Попробовать снова</button>
		</div>
	{:else if honorBoard.length === 0}
		<EmptyState
			title="Доска почета пуста"
			description="Пока нет записей о достижениях учеников"
			icon="🏆"
			buttonText="Добавить первого ученика"
			onAction={openModal}
		/>
	{:else}
		<div class="grid-container grid-3">
			{#each honorBoard as item}
				<DataCard
					data={item}
					type="honor-board"
					showActions={true}
					onEdit={() => console.log('Edit honor board:', item.id)}
					onDelete={() => deleteHonorBoard(item.id)}
				/>
			{/each}
		</div>
	{/if}
</div>

<!-- Модальное окно добавления записи -->
<DataModal
	bind:open={showAddModal}
	title="Добавить ученика на доску почета"
	loading={modalLoading}
	on:close={closeModal}
	on:submit={addHonorBoard}
>
	<div class="space-y-4">
		{#if modalError}
			<div class="alert alert-error">
				{modalError}
			</div>
		{/if}

		<div>
			<label for="studentName" class="block text-sm font-medium mb-2 text-gray-700">
				Имя ученика *
			</label>
			<input
				id="studentName"
				type="text"
				bind:value={newHonorBoard.studentName}
				required
				placeholder="Введите имя ученика"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div>
			<label for="descriptionRu" class="block text-sm font-medium mb-2 text-gray-700">
				Описание достижения (Русский) *
			</label>
			<textarea
				id="descriptionRu"
				bind:value={newHonorBoard.descriptionRu}
				required
				rows={3}
				placeholder="Опишите достижение ученика на русском языке"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			></textarea>
		</div>

		<div>
			<label for="descriptionKz" class="block text-sm font-medium mb-2 text-gray-700">
				Описание достижения (Казахский) *
			</label>
			<textarea
				id="descriptionKz"
				bind:value={newHonorBoard.descriptionKz}
				required
				rows={3}
				placeholder="Опишите достижение ученика на казахском языке"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			></textarea>
		</div>

		<div>
			<label class="block text-sm font-medium mb-2 text-gray-700">
				Фото ученика
			</label>
			<ImageUpload
				bind:value={newHonorBoard.imageUrl}
				folder="honor-board"
				on:change={handleImageChange}
			/>
		</div>
	</div>
</DataModal>

<style>
	.honor-board-page {
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
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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