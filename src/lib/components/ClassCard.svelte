<script lang="ts">
	import type { Class } from '$lib/types/api';

	export let classItem: Class;
	$: className = `${classItem.grade}${classItem.letter}`;
	$: teacherName = classItem.Teacher ? 
		(classItem.Teacher.nameRu || classItem.Teacher.nameKz) : 
		'Не назначен';
</script>

<div class="class-card card">
	<div class="class-header">
		<div class="class-number">
			<h3>{className}</h3>
		</div>
		<div class="class-info">
			<p class="class-teacher">
				<strong>Классный руководитель:</strong> {teacherName}
			</p>
			{#if classItem.Teacher?.subjectRu}
				<p class="class-subject">
					<strong>Предмет:</strong> {classItem.Teacher.subjectRu}
				</p>
			{/if}
		</div>
	</div>

	<div class="class-details">
		<div class="detail-item">
			<strong>Класс:</strong> {classItem.grade} класс
		</div>
		<div class="detail-item">
			<strong>Буква:</strong> {classItem.letter}
		</div>
		{#if classItem.Schedule && classItem.Schedule.length > 0}
			<div class="detail-item">
				<strong>Занятий в расписании:</strong> {classItem.Schedule.length}
			</div>
		{/if}
	</div>


</div>

<style>
	.class-card {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.class-header {
		margin-bottom: 1rem;
	}

	.class-number h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: #007bff;
	}

	.class-teacher {
		margin: 0 0 0.25rem 0;
		font-size: 0.875rem;
	}

	.class-subject {
		margin: 0;
		font-size: 0.875rem;
		color: #666;
	}

	.class-details {
		flex: 1;
	}

	.detail-item {
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}

	.detail-item strong {
		color: #333;
	}


</style> 