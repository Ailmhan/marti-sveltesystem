<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { ScheduleItem } from '$lib/types/api';

	export let schedule: ScheduleItem[] = [];
	export let showNavigation = true;
	export let showToday = true;
	export let selectedDate = new Date();

	const dispatch = createEventDispatcher<{
		dateSelect: Date;
		itemClick: ScheduleItem;
		viewChange: 'week' | 'day';
	}>();

	let currentDate = new Date(selectedDate);
	let currentView: 'week' | 'day' = 'week';

	// Временные слоты для расписания
	const timeSlots = [
		'08:00', '08:45', '09:30', '10:15', '11:00', '11:45',
		'12:30', '13:15', '14:00', '14:45', '15:30', '16:15'
	];

	// Дни недели
	const weekDays = [
		{ key: 'monday', label: 'Понедельник', short: 'Пн' },
		{ key: 'tuesday', label: 'Вторник', short: 'Вт' },
		{ key: 'wednesday', label: 'Среда', short: 'Ср' },
		{ key: 'thursday', label: 'Четверг', short: 'Чт' },
		{ key: 'friday', label: 'Пятница', short: 'Пт' },
		{ key: 'saturday', label: 'Суббота', short: 'Сб' }
	];

	// Генерация дат для текущей недели
	$: weekDates = generateWeekDates(currentDate);
	$: currentWeekName = getWeekName(currentDate);

	function generateWeekDates(date: Date) {
		const startOfWeek = new Date(date);
		const day = startOfWeek.getDay();
		const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Понедельник как начало недели
		startOfWeek.setDate(diff);

		const dates = [];
		for (let i = 0; i < 6; i++) {
			const weekDate = new Date(startOfWeek);
			weekDate.setDate(startOfWeek.getDate() + i);
			dates.push(weekDate);
		}
		return dates;
	}

	function getWeekName(date: Date) {
		const startOfWeek = new Date(date);
		const day = startOfWeek.getDay();
		const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
		startOfWeek.setDate(diff);

		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(startOfWeek.getDate() + 5);

		return `${startOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
	}

	function getScheduleForTimeSlot(date: Date, timeSlot: string): ScheduleItem[] {
		return schedule.filter(item => {
			const itemDate = new Date(item.date);
			return itemDate.toDateString() === date.toDateString() && 
				   item.startTime === timeSlot;
		});
	}

	function isToday(date: Date): boolean {
		return date.toDateString() === new Date().toDateString();
	}

	function isSelectedDate(date: Date): boolean {
		return date.toDateString() === selectedDate.toDateString();
	}

	function previousWeek() {
		currentDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
	}

	function nextWeek() {
		currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
	}

	function goToToday() {
		currentDate = new Date();
		selectedDate = new Date();
		dispatch('dateSelect', selectedDate);
	}

	function selectDate(date: Date) {
		selectedDate = date;
		dispatch('dateSelect', date);
	}

	function handleItemClick(scheduleItem: ScheduleItem) {
		dispatch('itemClick', scheduleItem);
	}

	function changeView(newView: 'week' | 'day') {
		currentView = newView;
		dispatch('viewChange', newView);
	}

	function formatTime(time: string) {
		return time.substring(0, 5);
	}
</script>

<div class="schedule-container">
	{#if showNavigation}
		<div class="schedule-header">
			<div class="schedule-controls">
				<button 
					type="button" 
					class="nav-btn"
					on:click={previousWeek}
					aria-label="Предыдущая неделя"
				>
					‹
				</button>
				<h2 class="schedule-title">{currentWeekName}</h2>
				<button 
					type="button" 
					class="nav-btn"
					on:click={nextWeek}
					aria-label="Следующая неделя"
				>
					›
				</button>
			</div>
			
			<div class="schedule-actions">
				<div class="view-toggles">
					<button 
						type="button" 
						class="view-btn {currentView === 'week' ? 'active' : ''}"
						on:click={() => changeView('week')}
					>
						Неделя
					</button>
					<button 
						type="button" 
						class="view-btn {currentView === 'day' ? 'active' : ''}"
						on:click={() => changeView('day')}
					>
						День
					</button>
				</div>
				
				{#if showToday}
					<button 
						type="button" 
						class="today-btn"
						on:click={goToToday}
					>
						Сегодня
					</button>
				{/if}
			</div>
		</div>
	{/if}

	<div class="schedule-body">
		{#if currentView === 'week'}
			<div class="schedule-table">
				<!-- Заголовок с днями недели -->
				<div class="schedule-header-row">
					<div class="time-column-header">Время</div>
					{#each weekDates as date, index}
						<div 
							class="day-column-header {isToday(date) ? 'today' : ''} {isSelectedDate(date) ? 'selected' : ''}"
							on:click={() => selectDate(date)}
						>
							<div class="day-name">{weekDays[index].short}</div>
							<div class="day-date">{date.getDate()}</div>
						</div>
					{/each}
				</div>

				<!-- Строки с временными слотами -->
				{#each timeSlots as timeSlot}
					<div class="schedule-row">
						<div class="time-slot">
							{formatTime(timeSlot)}
						</div>
						{#each weekDates as date}
							<div class="schedule-cell">
								{#each getScheduleForTimeSlot(date, timeSlot) as item}
									<div 
										class="schedule-item"
										on:click={() => handleItemClick(item)}
									>
										<div class="item-subject">{item.subjectRu || item.subjectKz}</div>
										<div class="item-teacher">{item.Teacher?.nameRu || item.Teacher?.nameKz || 'Учитель не указан'}</div>
										<div class="item-room">{item.roomRu || item.roomKz || 'Кабинет не указан'}</div>
										<div class="item-time">{formatTime(item.startTime)} - {formatTime(item.endTime)}</div>
									</div>
								{/each}
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{:else}
			<!-- Вид одного дня -->
			<div class="day-schedule">
				<div class="day-header">
					<h3>{selectedDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
				</div>
				<div class="day-items">
					{#each schedule.filter(item => {
						const itemDate = new Date(item.date);
						return itemDate.toDateString() === selectedDate.toDateString();
					}).sort((a, b) => a.startTime.localeCompare(b.startTime)) as item}
						<div 
							class="day-schedule-item"
							on:click={() => handleItemClick(item)}
						>
							<div class="item-time-slot">
								{formatTime(item.startTime)} - {formatTime(item.endTime)}
							</div>
							<div class="item-content">
								<div class="item-subject">{item.subjectRu || item.subjectKz}</div>
								<div class="item-teacher">{item.Teacher?.nameRu || item.Teacher?.nameKz || 'Учитель не указан'}</div>
								<div class="item-room">{item.roomRu || item.roomKz || 'Кабинет не указан'}</div>
								{#if item.Class}
									<div class="item-class">{item.Class.grade}{item.Class.letter} класс</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.schedule-container {
		background: white;
		border-radius: 0.75rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e7eb;
		overflow: hidden;
	}

	.schedule-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		background: #f9fafb;
	}

	.schedule-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.nav-btn {
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 1.25rem;
		color: #374151;
		transition: all 0.2s ease;
	}

	.nav-btn:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}

	.schedule-title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		min-width: 200px;
		text-align: center;
	}

	.schedule-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.view-toggles {
		display: flex;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		overflow: hidden;
	}

	.view-btn {
		background: white;
		border: none;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.view-btn:hover {
		background: #f3f4f6;
	}

	.view-btn.active {
		background: #6366f1;
		color: white;
	}

	.today-btn {
		background: #6366f1;
		color: white;
		border: none;
		border-radius: 0.375rem;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.today-btn:hover {
		background: #5855eb;
	}

	.schedule-body {
		padding: 1rem;
		overflow-x: auto;
	}

	.schedule-table {
		display: table;
		width: 100%;
		border-collapse: collapse;
		min-width: 800px;
	}

	.schedule-header-row {
		display: table-row;
		background: #f9fafb;
	}

	.time-column-header {
		display: table-cell;
		padding: 0.75rem;
		text-align: center;
		font-weight: 600;
		font-size: 0.875rem;
		color: #6b7280;
		border: 1px solid #e5e7eb;
		width: 80px;
	}

	.day-column-header {
		display: table-cell;
		padding: 0.75rem;
		text-align: center;
		font-weight: 600;
		font-size: 0.875rem;
		color: #374151;
		border: 1px solid #e5e7eb;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.day-column-header:hover {
		background: #f3f4f6;
	}

	.day-column-header.today {
		background: #eff6ff;
		color: #1d4ed8;
	}

	.day-column-header.selected {
		background: #dbeafe;
		border: 2px solid #3b82f6;
	}

	.day-name {
		font-weight: 600;
		margin-bottom: 0.25rem;
	}

	.day-date {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.schedule-row {
		display: table-row;
	}

	.time-slot {
		display: table-cell;
		padding: 0.5rem;
		text-align: center;
		font-size: 0.75rem;
		color: #6b7280;
		border: 1px solid #e5e7eb;
		background: #f9fafb;
		vertical-align: top;
		width: 80px;
	}

	.schedule-cell {
		display: table-cell;
		padding: 0.25rem;
		border: 1px solid #e5e7eb;
		vertical-align: top;
		min-height: 60px;
	}

	.schedule-item {
		background: #6366f1;
		color: white;
		padding: 0.5rem;
		border-radius: 0.25rem;
		margin-bottom: 0.25rem;
		cursor: pointer;
		transition: opacity 0.2s ease;
		font-size: 0.75rem;
	}

	.schedule-item:hover {
		opacity: 0.8;
	}

	.item-subject {
		font-weight: 600;
		margin-bottom: 0.125rem;
	}

	.item-teacher {
		font-size: 0.625rem;
		opacity: 0.9;
		margin-bottom: 0.125rem;
	}

	.item-room {
		font-size: 0.625rem;
		opacity: 0.9;
	}

	.item-time {
		font-size: 0.625rem;
		opacity: 0.8;
		margin-top: 0.125rem;
	}

	/* Вид одного дня */
	.day-schedule {
		max-width: 600px;
		margin: 0 auto;
	}

	.day-header {
		text-align: center;
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 0.5rem;
	}

	.day-header h3 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
	}

	.day-items {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.day-schedule-item {
		display: flex;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.day-schedule-item:hover {
		background: #f9fafb;
		border-color: #d1d5db;
	}

	.item-time-slot {
		flex-shrink: 0;
		width: 100px;
		font-weight: 600;
		color: #6366f1;
		font-size: 0.875rem;
	}

	.item-content {
		flex: 1;
	}

	.item-content .item-subject {
		font-weight: 600;
		font-size: 1rem;
		color: #111827;
		margin-bottom: 0.25rem;
	}

	.item-content .item-teacher {
		font-size: 0.875rem;
		color: #6b7280;
		margin-bottom: 0.125rem;
	}

	.item-content .item-room {
		font-size: 0.875rem;
		color: #6b7280;
		margin-bottom: 0.125rem;
	}

	.item-content .item-class {
		font-size: 0.875rem;
		color: #6366f1;
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.schedule-header {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.schedule-controls {
			justify-content: space-between;
		}

		.schedule-actions {
			justify-content: center;
		}

		.schedule-body {
			padding: 0.5rem;
		}

		.time-slot {
			width: 60px;
			font-size: 0.625rem;
		}

		.time-column-header {
			width: 60px;
		}

		.schedule-item {
			padding: 0.25rem;
			font-size: 0.625rem;
		}

		.day-schedule-item {
			flex-direction: column;
			gap: 0.5rem;
		}

		.item-time-slot {
			width: auto;
		}
	}
</style>
