<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import { authStore } from '$lib/stores/auth';
	import { adminStore } from '$lib/stores/admin';
	import { languageStore } from '$lib/stores/language';
	import type { Class, Teacher } from '$lib/types/api';
	import ClassCard from '$lib/components/ClassCard.svelte';
	import DataModal from '$lib/components/DataModal.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let classes: Class[] = [];
	let teachers: Teacher[] = [];
	let loading = false;
	let error = '';
	let showAddModal = false;
	let addLoading = false;
	let addError = '';
	let modalError = ''; // Добавляем для DataModal
	let language = $languageStore; // Добавляем для языков

	let newClass = {
		grade: 1,
		letter: '',
		teacherId: 0
	};

	onMount(() => {
		loadData();
	});

	async function loadData() {
		if (!$authStore.schoolId) return;
		
		try {
			loading = true;
			error = '';
			const [classesData, teachersData] = await Promise.all([
				apiClient.getClasses($authStore.schoolId),
				apiClient.getTeachers($authStore.schoolId)
			]);
			classes = classesData;
			teachers = teachersData;
		} catch (err) {
			console.error('Error loading data:', err);
			error = err instanceof Error ? err.message : 'Ошибка загрузки данных';
		} finally {
			loading = false;
		}
	}

	async function addClass() {
		console.log('addClass called');
		console.log('newClass:', newClass);
		console.log('schoolId:', $authStore.schoolId);
		
		// Валидация
		if (!newClass.letter) {
			modalError = 'Выберите букву класса';
			console.log('Validation failed: no letter');
			return;
		}
		if (newClass.grade < 1 || newClass.grade > 11) {
			modalError = 'Класс должен быть от 1 до 11';
			console.log('Validation failed: invalid grade');
			return;
		}

		if (!$authStore.schoolId) {
			modalError = 'ID школы не найден';
			console.log('Validation failed: no schoolId');
			return;
		}

		try {
			addLoading = true;
			modalError = '';
			console.log('Starting API call...');

			const classData = {
				...newClass,
				schoolId: $authStore.schoolId
			};
			console.log('Class data to send:', classData);

			const result = await apiClient.createClass(classData);
			console.log('API call successful:', result);
			
			// Обновляем список классов
			await loadData();
			
			// Закрываем модальное окно и очищаем форму только после успеха
			showAddModal = false;
			addLoading = false;
			
			// Сбрасываем форму
			newClass = {
				grade: 1,
				letter: '',
				teacherId: 0
			};
		} catch (err) {
			console.error('Error creating class:', err);
			modalError = err instanceof Error ? err.message : 'Ошибка создания класса';
			addLoading = false;
		}
	}

	function openAddModal() {
		showAddModal = true;
		modalError = '';
	}

	function closeAddModal() {
		showAddModal = false;
		modalError = '';
		newClass = {
			grade: 1,
			letter: '',
			teacherId: 0
		};
	}

	async function deleteClass(id: number) {
		if (confirm('Вы уверены, что хотите удалить этот класс?')) {
			try {
				await apiClient.deleteClass(id);
				await loadData();
			} catch (err) {
				error = err instanceof Error ? err.message : 'Ошибка удаления класса';
			}
		}
	}
</script>

<svelte:head>
	<title>Классы - Школьная система</title>
</svelte:head>

<div class="classes-page">
	<div class="page-header">
		<h1>Классы школы</h1>
		<div class="page-actions">
			{#if $adminStore.isAdminMode}
				<button class="btn btn-primary add-btn" on:click={openAddModal}>
					<span class="btn-icon">➕</span>
					Добавить класс
				</button>
			{/if}
		</div>
	</div>

	{#if loading}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Загрузка классов...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<h2>Ошибка</h2>
			<p>{error}</p>
			<button class="btn btn-primary" on:click={loadData}>Попробовать снова</button>
		</div>
	{:else if classes.length > 0}
		<div class="classes-grid grid grid-cols-4">
			{#each classes as classItem}
				<ClassCard 
					{classItem} 
					language={$languageStore}
					onDelete={$adminStore.isAdminMode ? () => deleteClass(classItem.id) : undefined}
				/>
			{/each}
		</div>
	{:else}
		<EmptyState
			title="Классов пока нет"
			description="Добавьте первый класс в систему!"
			icon="🏫"
			buttonText="Добавить класс"
			onAction={openAddModal}
			showButton={$adminStore.isAdminMode}
		/>
	{/if}
</div>

<!-- Модальное окно добавления класса -->
<DataModal 
	bind:open={showAddModal} 
	title={language === 'ru' ? 'Добавить класс' : 'Сынып қосу'} 
	loading={addLoading}
	on:close={closeAddModal}
	on:submit={addClass}
>
	{#if modalError}
		<div class="alert alert-error">{modalError}</div>
	{/if}
			<div class="form-group">
			<label for="grade">{language === 'ru' ? 'Класс *' : 'Сынып *'}</label>
			<select id="grade" bind:value={newClass.grade} required class="form-select">
				<option value="">{language === 'ru' ? 'Выберите класс' : 'Сыныпты таңдаңыз'}</option>
				{#each Array.from({length: 11}, (_, i) => i + 1) as grade}
					<option value={grade}>{grade}</option>
				{/each}
			</select>
		</div>

	<div class="form-group">
		<label for="letter">{language === 'ru' ? 'Буква *' : 'Әріп *'}</label>
		<select id="letter" bind:value={newClass.letter} required class="form-select">
			<option value="">{language === 'ru' ? 'Выберите букву' : 'Әріпті таңдаңыз'}</option>
			<option value="А">А</option>
			<option value="Б">Б</option>
			<option value="В">В</option>
			<option value="Г">Г</option>
			<option value="Д">Д</option>
			<option value="Е">Е</option>
			<option value="Ё">Ё</option>
			<option value="Ж">Ж</option>
			<option value="З">З</option>
			<option value="И">И</option>
			<option value="К">К</option>
			<option value="Л">Л</option>
			<option value="М">М</option>
			<option value="Н">Н</option>
			<option value="О">О</option>
			<option value="П">П</option>
			<option value="Р">Р</option>
			<option value="С">С</option>
			<option value="Т">Т</option>
			<option value="У">У</option>
			<option value="Ф">Ф</option>
			<option value="Х">Х</option>
			<option value="Ц">Ц</option>
			<option value="Ч">Ч</option>
			<option value="Ш">Ш</option>
			<option value="Щ">Щ</option>
			<option value="Э">Э</option>
			<option value="Ю">Ю</option>
			<option value="Я">Я</option>
		</select>
	</div>

	<div class="form-group">
		<label for="teacherId">{language === 'ru' ? 'Классный руководитель' : 'Сынып жетекшісі'}</label>
		<select id="teacherId" bind:value={newClass.teacherId} class="form-select">
			<option value={0}>{language === 'ru' ? 'Не назначен' : 'Тағайындалмаған'}</option>
			{#each teachers as teacher}
				<option value={teacher.id}>{language === 'ru' ? teacher.nameRu : teacher.nameKz}</option>
			{/each}
		</select>
	</div>
</DataModal>

<style>
	.classes-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		padding-top: calc(70px + 2rem);
	}

    .page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
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

    /* removed unused .btn-secondary */

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

	.classes-grid {
		display: grid;
		grid-template-columns: repeat(3, 340px);
		justify-content: start;
		gap: 1.5rem;
	}
	
	@media (max-width: 1200px) {
		.classes-grid {
			grid-template-columns: repeat(2, 340px);
		}
	}
	
	@media (max-width: 768px) {
		.classes-grid {
			grid-template-columns: 1fr;
			max-width: 400px;
			margin: 0 auto;
		}
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

	/* Стили для модального окна */
	.form-group {
		margin-bottom: 1.5rem;
	}

    .form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
        color: hsl(var(--foreground));
	}

    .form-select {
		width: 100%;
		padding: 0.75rem 1rem;
        border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		font-size: 1rem;
		transition: border-color 0.2s ease;
        background: hsl(var(--card));
        color: hsl(var(--foreground));
	}

    .form-select:focus {
		outline: none;
        border-color: hsl(var(--ring));
        box-shadow: 0 0 0 2px hsl(var(--ring) / 0.3);
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

    /* removed unused .loading-spinner */
</style> 