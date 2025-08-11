<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import { authStore } from '$lib/stores/auth';
	import type { Schedule as ScheduleType, Teacher, Class } from '$lib/types/api';
	import { format } from 'date-fns';
	import { ru } from 'date-fns/locale';
	import DataModal from '$lib/components/DataModal.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import Schedule from '$lib/components/Schedule.svelte';
	import { languageStore } from '$lib/stores/language';
	import { adminStore } from '$lib/stores/admin';
	import { t } from '$lib/i18n/translations';

	let schedule: ScheduleType[] = [];
	let teachers: Teacher[] = [];
	let classes: Class[] = [];
	let loading = false;
	let error = '';
	let showAddModal = false;
	let modalLoading = false;
	let modalError = '';

	let newSchedule = {
		date: '',
		subjectRu: '',
		subjectKz: '',
		teacherId: 0,
		classId: 0,
		startTime: '',
		endTime: '',
		roomRu: '',
		roomKz: ''
	};

	onMount(() => {
		// Ждем пока authStore загрузится
		const unsubscribe = authStore.subscribe(($authStore) => {
			if ($authStore.schoolId && !loading && schedule.length === 0) {
				console.log('📅 Загружаем данные расписания для школы:', $authStore.schoolId);
				loadData();
			}
		});
		
		// Если данные уже есть, загружаем сразу
		if ($authStore.schoolId) {
			loadData();
		}

		return () => unsubscribe();
	});

	async function loadData() {
		const schoolId = $authStore.schoolId;
		
		if (!schoolId) {
			console.warn('⚠️ School ID не доступен, ждем загрузки...');
			return;
		}

		try {
			loading = true;
			error = '';
			console.log('📅 Начинаем загрузку данных расписания...');

			// Загружаем данные по отдельности для лучшей отладки
			const scheduleData = await apiClient.getSchedule(schoolId).catch(err => {
				console.error('❌ Ошибка загрузки расписания:', err);
				return [];
			});

			const teachersData = await apiClient.getTeachers(schoolId).catch(err => {
				console.error('❌ Ошибка загрузки учителей:', err);
				return [];
			});

			const classesData = await apiClient.getClasses(schoolId).catch(err => {
				console.error('❌ Ошибка загрузки классов:', err);
				return [];
			});

			// Присваиваем данные
			schedule = scheduleData || [];
			teachers = teachersData || [];
			classes = classesData || [];

			console.log('✅ Данные загружены:', {
				schedule: schedule.length,
				teachers: teachers.length,
				classes: classes.length
			});

		} catch (err) {
			console.error('❌ Критическая ошибка загрузки данных:', err);
			error = err instanceof Error ? err.message : 'Ошибка загрузки данных';
		} finally {
			loading = false;
		}
	}

	async function addSchedule() {
		if (!$authStore.schoolId) {
			modalError = 'ID школы не найден';
			return;
		}

		// Валидация
		if (!newSchedule.date || !newSchedule.subjectRu.trim() || !newSchedule.subjectKz.trim() ||
			!newSchedule.teacherId || !newSchedule.classId || !newSchedule.startTime || 
			!newSchedule.endTime || !newSchedule.roomRu.trim() || !newSchedule.roomKz.trim()) {
			modalError = 'Все поля должны быть заполнены';
			return;
		}

		try {
			modalError = '';
			await apiClient.createSchedule({
				...newSchedule,
				schoolId: $authStore.schoolId
			});
			
			// Сбрасываем форму
			newSchedule = {
				date: '',
				subjectRu: '',
				subjectKz: '',
				teacherId: 0,
				classId: 0,
				startTime: '',
				endTime: '',
				roomRu: '',
				roomKz: ''
			};
			
			// Закрываем модальное окно
			showAddModal = false;
			
			// Перезагружаем данные
			await loadData();
		} catch (err) {
			console.error('Error creating schedule:', err);
			modalError = err instanceof Error ? err.message : 'Ошибка создания расписания';
		}
	}

	function openModal() {
		showAddModal = true;
		modalError = '';
	}

	function closeModal() {
		showAddModal = false;
		modalError = '';
		newSchedule = {
			date: '',
			subjectRu: '',
			subjectKz: '',
			teacherId: 0,
			classId: 0,
			startTime: '',
			endTime: '',
			roomRu: '',
			roomKz: ''
		};
	}

	function formatDate(date: Date | string) {
		return format(new Date(date), 'dd MMMM yyyy', { locale: ru });
	}

	function formatTime(time: string) {
		return time;
	}

	async function deleteSchedule(id: number) {
		if (confirm('Вы уверены, что хотите удалить это занятие?')) {
			try {
				await apiClient.deleteSchedule(id);
				await loadData();
			} catch (err) {
				error = err instanceof Error ? err.message : 'Ошибка удаления занятия';
			}
		}
	}
</script>

<svelte:head>
	<title>Расписание - Школьная система</title>
</svelte:head>

<div class="schedule-page">
	<div class="page-header">
		<h1>{t('pageHeaders.schedule', $languageStore)}</h1>
		{#if $adminStore.isAdminMode}
			<div class="page-actions">
				<button class="btn btn-primary add-btn" on:click={openModal}>
					<span class="btn-icon">➕</span>
					{t('buttons.addSchedule', $languageStore)}
				</button>
			</div>
		{/if}
	</div>

	{#if loading}
		<div class="loading-container">
			<LoadingSpinner />
			<p>Загрузка данных расписания...</p>
			<p class="loading-details">Загружаем расписание, учителей и классы...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<h2>❌ Ошибка загрузки</h2>
			<p>{error}</p>
			<div class="error-actions">
				<button class="btn btn-primary" on:click={loadData}>🔄 Попробовать снова</button>
				<button class="btn btn-secondary" on:click={() => window.location.reload()}>🔄 Обновить страницу</button>
			</div>
		</div>
	{:else if schedule.length > 0}
		<!-- Статистика по загруженным данным -->
		<div class="data-info">
			<p>📊 Загружено: <strong>{schedule.length}</strong> занятий, <strong>{teachers.length}</strong> учителей, <strong>{classes.length}</strong> классов</p>
		</div>

		<Schedule 
			{schedule}
			on:itemClick={(event: CustomEvent<ScheduleType>) => {
				console.log('Schedule item clicked:', event.detail);
				// Здесь можно добавить логику для редактирования
			}}
			on:dateSelect={(event: CustomEvent<Date>) => {
				console.log('Date selected:', event.detail);
			}}
			on:viewChange={(event: CustomEvent<'week' | 'day'>) => {
				console.log('View changed:', event.detail);
			}}
		/>

		<!-- Список всех занятий для отладки -->
		{#if schedule.length > 0}
			<details class="debug-info">
				<summary>🔍 Все занятия (для отладки)</summary>
				<div class="schedule-debug-list">
					{#each schedule as item, index}
						<div class="schedule-debug-item">
							<strong>#{index + 1}.</strong>
							📅 {new Date(item.date).toLocaleDateString('ru-RU')} 
							⏰ {item.startTime} - {item.endTime} 
							📚 {$languageStore === 'ru' ? item.subjectRu : item.subjectKz}
							👨‍🏫 {item.Teacher ? ($languageStore === 'ru' ? item.Teacher.nameRu : item.Teacher.nameKz) : 'Не указан'}
							🏫 {$languageStore === 'ru' ? item.roomRu : item.roomKz}
							🎓 {item.Class ? `${item.Class.grade}${item.Class.letter}` : 'Не указан'}
						</div>
					{/each}
				</div>
			</details>
		{/if}
	{:else}
		<!-- Показываем количество данных даже если расписание пустое -->
		<div class="data-info">
			<p>📊 В базе: <strong>{teachers.length}</strong> учителей, <strong>{classes.length}</strong> классов</p>
		</div>

		<EmptyState
			title={t('emptyStates.schedule.title', $languageStore)}
			description={t('emptyStates.schedule.description', $languageStore)}
			icon="📅"
			buttonText={$adminStore.isAdminMode ? t('emptyStates.schedule.buttonText', $languageStore) : null}
			onAction={$adminStore.isAdminMode ? openModal : null}
		/>
	{/if}
</div>

<!-- Модальное окно добавления расписания -->
<DataModal
	bind:open={showAddModal}
	title={t('modalTitles.addSchedule', $languageStore)}
	loading={modalLoading}
	on:close={closeModal}
	on:submit={addSchedule}
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
				bind:value={newSchedule.date}
				required
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="startTime" class="block text-sm font-medium mb-2 text-gray-700">
					Время начала *
				</label>
				<input
					id="startTime"
					type="time"
					bind:value={newSchedule.startTime}
					required
					class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
				/>
						</div>

			<div>
				<label for="endTime" class="block text-sm font-medium mb-2 text-gray-700">
					Время окончания *
				</label>
				<input
					id="endTime"
					type="time"
					bind:value={newSchedule.endTime}
					required
					class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
				/>
						</div>
					</div>
					
		<div>
			<label for="subjectRu" class="block text-sm font-medium mb-2 text-gray-700">
				Предмет (Русский) *
			</label>
			<input
				id="subjectRu"
				type="text"
				bind:value={newSchedule.subjectRu}
				required
				placeholder="Введите предмет на русском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
						</div>
						
		<div>
			<label for="subjectKz" class="block text-sm font-medium mb-2 text-gray-700">
				Предмет (Казахский) *
			</label>
			<input
				id="subjectKz"
				type="text"
				bind:value={newSchedule.subjectKz}
				required
				placeholder="Введите предмет на казахском"
				class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
			/>
							</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="teacherId" class="block text-sm font-medium mb-2 text-gray-700">
					Учитель *
				</label>
				<select
					id="teacherId"
					bind:value={newSchedule.teacherId}
					required
					class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
				>
					<option value={0}>Выберите учителя</option>
					{#each teachers as teacher}
						<option value={teacher.id}>{teacher.nameRu}</option>
					{/each}
				</select>
							</div>

			<div>
				<label for="classId" class="block text-sm font-medium mb-2 text-gray-700">
					Класс *
				</label>
				<select
					id="classId"
					bind:value={newSchedule.classId}
					required
					class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
				>
					<option value={0}>Выберите класс</option>
					{#each classes as classItem}
						<option value={classItem.id}>{classItem.grade}{classItem.letter}</option>
					{/each}
				</select>
						</div>
					</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="roomRu" class="block text-sm font-medium mb-2 text-gray-700">
					Кабинет (Русский) *
				</label>
				<input
					id="roomRu"
					type="text"
					bind:value={newSchedule.roomRu}
					required
					placeholder="Кабинет 101"
					class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
				/>
			</div>

			<div>
				<label for="roomKz" class="block text-sm font-medium mb-2 text-gray-700">
					Кабинет (Казахский) *
				</label>
				<input
					id="roomKz"
					type="text"
					bind:value={newSchedule.roomKz}
					required
					placeholder="101 кабинет"
					class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
				/>
					</div>
				</div>
		</div>
</DataModal>

<style>
	.schedule-page {
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

	.btn-edit {
		background-color: #10b981;
		color: white;
	}

	.btn-edit:hover {
		background-color: #059669;
	}

	.btn-danger {
		background-color: #ef4444;
		color: white;
	}

	.btn-danger:hover {
		background-color: #dc2626;
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

	.schedule-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.schedule-card {
        background: hsl(var(--card));
        border-radius: 1rem;
        overflow: hidden;
        box-shadow: var(--shadow-md);
        border: 1px solid hsl(var(--border));
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem;
	}

	.schedule-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
	}

	.schedule-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 1rem;
        border-bottom: 1px solid hsl(var(--border));
	}

	.schedule-date {
		font-weight: 600;
        color: hsl(var(--foreground));
		font-size: 1.125rem;
	}

	.schedule-time {
		font-weight: bold;
        color: hsl(var(--primary));
		font-size: 1rem;
	}

	.schedule-content {
		flex: 1;
	}

	.schedule-subject h3 {
		margin: 0 0 1rem 0;
        color: hsl(var(--foreground));
		font-size: 1.25rem;
		font-weight: 600;
	}

	.schedule-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.detail-item {
		font-size: 0.875rem;
        color: hsl(var(--muted-foreground));
	}

	.detail-item strong {
        color: hsl(var(--foreground));
	}

	.schedule-actions {
		display: flex;
		gap: 0.5rem;
		padding-top: 1rem;
        border-top: 1px solid hsl(var(--border));
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

    /* Dark-theme friendly form controls */
    .schedule-page input,
    .schedule-page textarea,
    .schedule-page select {
        background: hsl(var(--card));
        color: hsl(var(--foreground));
        border: 1px solid hsl(var(--border));
    }
    .schedule-page input:focus,
    .schedule-page textarea:focus,
    .schedule-page select:focus {
        outline: none;
        border-color: hsl(var(--ring));
        box-shadow: 0 0 0 2px hsl(var(--ring) / 0.3);
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

		.schedule-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.schedule-actions {
			flex-direction: column;
		}
	}

	/* Новые стили для улучшенного отображения */
	.loading-details {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
		margin-top: 0.5rem;
	}

	.error-actions {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
		flex-wrap: wrap;
	}

	.data-info {
		background: hsl(var(--muted) / 0.3);
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		padding: 1rem;
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.data-info p {
		margin: 0;
		color: hsl(var(--foreground));
		font-size: 0.875rem;
	}

	.debug-info {
		margin-top: 2rem;
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		background: hsl(var(--muted) / 0.1);
	}

	.debug-info summary {
		padding: 1rem;
		cursor: pointer;
		font-weight: 500;
		color: hsl(var(--foreground));
		background: hsl(var(--muted) / 0.3);
		border-radius: 0.5rem 0.5rem 0 0;
	}

	.debug-info summary:hover {
		background: hsl(var(--muted) / 0.5);
	}

	.schedule-debug-list {
		max-height: 300px;
		overflow-y: auto;
		padding: 1rem;
	}

	.schedule-debug-item {
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 0.375rem;
		padding: 0.75rem;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		line-height: 1.4;
		word-wrap: break-word;
	}

	.schedule-debug-item:last-child {
		margin-bottom: 0;
	}

	@media (max-width: 640px) {
		.error-actions {
			flex-direction: column;
		}
		
		.error-actions button {
			width: 100%;
		}

		.schedule-debug-list {
			max-height: 200px;
		}
	}
</style> 