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
		loadData();
	});

	async function loadData() {
		if (!$authStore.schoolId) return;
		
		try {
			loading = true;
			error = '';
			const [scheduleData, teachersData, classesData] = await Promise.all([
				apiClient.getSchedule($authStore.schoolId),
				apiClient.getTeachers($authStore.schoolId),
				apiClient.getClasses($authStore.schoolId)
			]);
			schedule = scheduleData;
			teachers = teachersData;
			classes = classesData;
		} catch (err) {
			console.error('Error loading data:', err);
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
		<h1>Расписание занятий</h1>
		<div class="page-actions">
			<button class="btn btn-primary add-btn" on:click={openModal}>
				<span class="btn-icon">➕</span>
				Добавить занятие
			</button>
		</div>
	</div>

	{#if loading}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Загрузка расписания...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<h2>Ошибка</h2>
			<p>{error}</p>
			<button class="btn btn-primary" on:click={loadData}>Попробовать снова</button>
		</div>
	{:else if schedule.length > 0}
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
	{:else}
		<EmptyState
			title="Расписание пусто"
			description="Добавьте первое занятие в расписание!"
			icon="📅"
			buttonText="Добавить занятие"
			onAction={openModal}
		/>
	{/if}
</div>

<!-- Модальное окно добавления расписания -->
<DataModal
	bind:open={showAddModal}
	title="Добавить занятие"
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

	.schedule-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.schedule-card {
		background: #ffffff;
		border-radius: 1rem;
		overflow: hidden;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
		border: 1px solid #f3f4f6;
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
		border-bottom: 1px solid #e5e7eb;
	}

	.schedule-date {
		font-weight: 600;
		color: #374151;
		font-size: 1.125rem;
	}

	.schedule-time {
		font-weight: bold;
		color: #6366f1;
		font-size: 1rem;
	}

	.schedule-content {
		flex: 1;
	}

	.schedule-subject h3 {
		margin: 0 0 1rem 0;
		color: #1f2937;
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
		color: #6b7280;
	}

	.detail-item strong {
		color: #374151;
	}

	.schedule-actions {
		display: flex;
		gap: 0.5rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
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

		.schedule-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.schedule-actions {
			flex-direction: column;
		}
	}
</style> 