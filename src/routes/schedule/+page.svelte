<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import type { Schedule } from '$lib/types/api';
	import { format } from 'date-fns';
	import { ru } from 'date-fns/locale';

	let schedule: Schedule[] = [];
	let loading = true;
	let error = '';

	onMount(async () => {
		try {
			const school = await apiClient.getMe();
			schedule = await apiClient.getSchedule(school.id);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка загрузки расписания';
		} finally {
			loading = false;
		}
	});

	function formatDate(date: Date | string) {
		return format(new Date(date), 'dd MMMM yyyy', { locale: ru });
	}

	function formatTime(time: string) {
		return time;
	}
</script>

<svelte:head>
	<title>Расписание - Школьная система</title>
</svelte:head>

<div class="schedule-page">
	<div class="page-header">
		<h1>Расписание занятий</h1>
		<div class="page-actions">
			<a href="/schedule/create" class="btn btn-primary">Добавить занятие</a>
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
		</div>
	{:else if schedule.length > 0}
		<div class="schedule-list">
			{#each schedule as scheduleItem}
				<div class="schedule-card card">
					<div class="schedule-header">
						<div class="schedule-date">
							{formatDate(scheduleItem.date)}
						</div>
						<div class="schedule-time">
							{formatTime(scheduleItem.startTime)} - {formatTime(scheduleItem.endTime)}
						</div>
					</div>
					
					<div class="schedule-content">
						<div class="schedule-subject">
							<h3>{scheduleItem.subjectRu}</h3>
						</div>
						
						<div class="schedule-details">
							<div class="detail-item">
								<strong>Класс:</strong> 
								{scheduleItem.Class ? `${scheduleItem.Class.grade}${scheduleItem.Class.letter}` : 'N/A'}
							</div>
							<div class="detail-item">
								<strong>Учитель:</strong> 
								{scheduleItem.Teacher ? scheduleItem.Teacher.nameRu : 'N/A'}
							</div>
							<div class="detail-item">
								<strong>Кабинет:</strong> {scheduleItem.roomRu}
							</div>
						</div>
					</div>

					<div class="schedule-actions">
						<button class="btn btn-primary">Редактировать</button>
						<button class="btn btn-danger">Удалить</button>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="empty-state">
			<h2>Расписание пусто</h2>
			<p>Добавьте первое занятие в расписание!</p>
			<a href="/schedule/create" class="btn btn-primary">Добавить занятие</a>
		</div>
	{/if}
</div>

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
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #eee;
	}

	.page-header h1 {
		margin: 0;
		color: #333;
		font-size: 2rem;
	}

	.page-actions {
		display: flex;
		gap: 0.5rem;
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		gap: 1rem;
	}

	.error-container {
		text-align: center;
		padding: 2rem;
	}

	.schedule-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.schedule-card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.schedule-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 1rem;
		border-bottom: 1px solid #eee;
	}

	.schedule-date {
		font-weight: 600;
		color: #333;
		font-size: 1.125rem;
	}

	.schedule-time {
		font-weight: bold;
		color: #007bff;
		font-size: 1rem;
	}

	.schedule-content {
		flex: 1;
	}

	.schedule-subject h3 {
		margin: 0 0 1rem 0;
		color: #333;
		font-size: 1.25rem;
	}

	.schedule-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.detail-item {
		font-size: 0.875rem;
	}

	.detail-item strong {
		color: #333;
	}

	.schedule-actions {
		display: flex;
		gap: 0.5rem;
		padding-top: 1rem;
		border-top: 1px solid #eee;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
	}

	.empty-state h2 {
		margin: 0 0 1rem 0;
		color: #333;
	}

	.empty-state p {
		margin: 0 0 2rem 0;
		color: #666;
	}

	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.page-actions {
			justify-content: center;
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