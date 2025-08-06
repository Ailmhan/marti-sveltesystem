<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import type { Class, Teacher } from '$lib/types/api';
	import ClassCard from '$lib/components/ClassCard.svelte';
	import Modal from '$lib/components/Modal.svelte';

	let classes: Class[] = [];
	let teachers: Teacher[] = [];
	let loading = true;
	let error = '';
	let showAddModal = false;
	let addLoading = false;
	let addError = '';

	let newClass = {
		grade: 1,
		letter: '',
		teacherId: 0
	};

	onMount(async () => {
		try {
			const school = await apiClient.getMe();
			const [classesData, teachersData] = await Promise.all([
				apiClient.getClasses(school.id),
				apiClient.getTeachers(school.id)
			]);
			classes = classesData;
			teachers = teachersData;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка загрузки данных';
		} finally {
			loading = false;
		}
	});

	async function addClass() {
		addLoading = true;
		addError = '';

		try {
			const school = await apiClient.getMe();
			await apiClient.createClass({
				...newClass,
				schoolId: school.id
			});
			
			// Обновляем список классов
			classes = await apiClient.getClasses(school.id);
			
			// Закрываем модальное окно и очищаем форму
			showAddModal = false;
			newClass = {
				grade: 1,
				letter: '',
				teacherId: 0
			};
		} catch (err) {
			addError = err instanceof Error ? err.message : 'Ошибка создания класса';
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
	<title>Классы - Школьная система</title>
</svelte:head>

<div class="classes-page">
	<div class="page-header">
		<h1>Классы школы</h1>
		<div class="page-actions">
			<button class="btn btn-primary" on:click={openAddModal}>Добавить класс</button>
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
		</div>
	{:else if classes.length > 0}
		<div class="classes-grid grid grid-cols-4">
			{#each classes as classItem}
				<ClassCard {classItem} />
			{/each}
		</div>
	{:else}
		<div class="empty-state">
			<h2>Классов пока нет</h2>
			<p>Добавьте первый класс в систему!</p>
			<button class="btn btn-primary" on:click={openAddModal}>Добавить класс</button>
		</div>
	{/if}
</div>

<!-- Модальное окно добавления класса -->
<Modal isOpen={showAddModal} title="Добавить класс" on:close={closeAddModal}>
	<form on:submit|preventDefault={addClass}>
		{#if addError}
			<div class="alert alert-error">{addError}</div>
		{/if}

		<div class="form-group">
			<label for="grade">Класс *</label>
			<select id="grade" bind:value={newClass.grade} required class="form-select">
				<option value="">Выберите класс</option>
				{#each Array.from({length: 11}, (_, i) => i + 1) as grade}
					<option value={grade}>{grade}</option>
				{/each}
			</select>
		</div>

		<div class="form-group">
			<label for="letter">Буква *</label>
			<select id="letter" bind:value={newClass.letter} required class="form-select">
				<option value="">Выберите букву</option>
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
			<label for="teacherId">Классный руководитель</label>
			<select id="teacherId" bind:value={newClass.teacherId} class="form-select">
				<option value={0}>Не назначен</option>
				{#each teachers as teacher}
					<option value={teacher.id}>{teacher.nameRu}</option>
				{/each}
			</select>
		</div>

		<div class="form-actions">
			<button type="button" class="btn btn-secondary" on:click={closeAddModal}>
				Отмена
			</button>
			<button type="submit" class="btn btn-primary" disabled={addLoading}>
				{#if addLoading}
					<div class="loading"></div>
				{/if}
				{addLoading ? 'Добавление...' : 'Добавить класс'}
			</button>
		</div>
	</form>
</Modal>

<style>
	.classes-page {
		padding: var(--space-6);
		padding-top: calc(70px + var(--space-6));
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-8);
	}

	.page-header h1 {
		font-size: 2rem;
	}

	.page-actions {
		display: flex;
		gap: var(--space-2);
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		gap: var(--space-4);
	}

	.error-container {
		text-align: center;
		padding: var(--space-8);
	}

	.empty-state {
		text-align: center;
		padding: var(--space-16) var(--space-8);
	}

	.empty-state h2 {
		margin: 0 0 var(--space-4) 0;
		color: var(--text-primary);
	}

	.empty-state p {
		margin: 0 0 var(--space-8) 0;
		color: var(--text-secondary);
	}

	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
			gap: var(--space-4);
			align-items: stretch;
		}

		.page-actions {
			justify-content: center;
		}
	}

	/* Стили для модального окна */
	.form-group {
		margin-bottom: var(--space-6);
	}

	.form-group label {
		display: block;
		margin-bottom: var(--space-2);
		font-weight: 500;
		color: var(--text-primary);
	}

	.form-group select {
		width: 100%;
		padding: var(--space-3) var(--space-4);
		border: 2px solid var(--border-primary);
		border-radius: var(--radius-lg);
		font-size: 1rem;
		transition: border-color var(--transition-fast);
		background: var(--bg-primary);
		color: var(--text-primary);
	}

	.form-group select:focus {
		outline: none;
		border-color: var(--border-focus);
	}

	.form-actions {
		display: flex;
		gap: var(--space-4);
		justify-content: flex-end;
		margin-top: var(--space-8);
	}

	.alert {
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-lg);
		margin-bottom: var(--space-6);
		font-weight: 500;
	}

	.alert-error {
		background-color: var(--error-light);
		color: var(--error-dark);
		border: 1px solid var(--error);
	}
</style> 