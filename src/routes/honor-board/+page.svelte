<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import { schoolStore } from '$lib/stores/school';
	import type { HonorBoard } from '$lib/types/api';
	import DataModal from '$lib/components/DataModal.svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorContainer from '$lib/components/ErrorContainer.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import DataCard from '$lib/components/DataCard.svelte';

	let honorBoard: HonorBoard[] = [];
	let loading = true;
	let error = '';
	let language: 'ru' | 'kz' = 'ru';
	let showAddModal = false;
	let modalLoading = false;

	let newHonorBoard = {
		studentName: '',
		descriptionRu: '',
		descriptionKz: '',
		imageUrl: ''
	};

	onMount(async () => {
		await loadHonorBoard();
	});

	async function loadHonorBoard() {
		try {
			loading = true;
			const school = $schoolStore;
			if (school) {
				honorBoard = await apiClient.getHonorBoard(school.id, language);
			} else {
				error = 'Информация о школе не загружена';
				honorBoard = [];
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка загрузки доски почета';
			honorBoard = [];
		} finally {
			loading = false;
		}
	}

	async function toggleLanguage() {
		language = language === 'ru' ? 'kz' : 'ru';
		await loadHonorBoard();
	}

	async function addHonorBoard() {
		try {
			modalLoading = true;
			const school = $schoolStore;
			if (school) {
				await apiClient.createHonorBoard({
					...newHonorBoard,
					schoolId: school.id
				});
				await loadHonorBoard();
				closeModal();
			} else {
				throw new Error('Информация о школе не загружена');
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка создания записи';
		} finally {
			modalLoading = false;
		}
	}

	function openModal() {
		showAddModal = true;
	}

	function closeModal() {
		showAddModal = false;
		newHonorBoard = {
			studentName: '',
			descriptionRu: '',
			descriptionKz: '',
			imageUrl: ''
		};
		error = '';
	}

	function handleImageChange(event: CustomEvent) {
		newHonorBoard.imageUrl = event.detail.value;
	}
</script>

<svelte:head>
	<title>Доска почета - Школьная система</title>
</svelte:head>

<div class="page-container">
	<PageHeader
		title="Доска почета школы"
		showLanguageToggle={true}
		language={language}
		onLanguageToggle={toggleLanguage}
		actions={[
			{
				text: 'Добавить ученика',
				onClick: openModal,
				icon: '➕'
			}
		]}
	/>

	{#if loading}
		<LoadingSpinner size="lg" text="Загрузка доски почета..." />
	{:else if error}
		<ErrorContainer {error} />
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
					{language}
					showActions={false}
				/>
			{/each}
		</div>
	{/if}
</div>

<DataModal
	bind:open={showAddModal}
	title="Добавить ученика на доску почета"
	loading={modalLoading}
	on:submit={addHonorBoard}
	on:close={closeModal}
>
	<FormField
		label="Имя ученика"
		id="student-name"
		type="text"
		bind:value={newHonorBoard.studentName}
		placeholder="Введите имя ученика"
		required={true}
	/>

	<FormField
		label="Описание достижения (Русский)"
		id="description-ru"
		type="textarea"
		bind:value={newHonorBoard.descriptionRu}
		placeholder="Опишите достижение ученика на русском языке"
		required={true}
		rows={3}
	/>

	<FormField
		label="Описание достижения (Казахский)"
		id="description-kz"
		type="textarea"
		bind:value={newHonorBoard.descriptionKz}
		placeholder="Опишите достижение ученика на казахском языке"
		required={true}
		rows={3}
	/>

	<div class="form-group">
		<label for="student-image">Фото ученика</label>
		<ImageUpload
			id="student-image"
			bind:value={newHonorBoard.imageUrl}
			folder="honor-board"
			on:success={(event) => newHonorBoard.imageUrl = event.detail.value}
			on:error={(event) => error = event.detail.message}
		/>
	</div>
</DataModal>

<style>
	/* Специфичные стили для страницы доски почета */
	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
	}
</style> 