<script lang="ts">
	import type { Class } from '$lib/types/api';

	export let classItem: Class;
	export let onDelete: (() => void) | null = null;
	export let language: 'ru' | 'kz' = 'ru';
	
	$: className = `${classItem.grade}${classItem.letter}`;
	$: teacherName = classItem.Teacher ? 
		(language === 'ru' ? classItem.Teacher.nameRu : classItem.Teacher.nameKz) || 
		classItem.Teacher.nameRu || classItem.Teacher.nameKz : 
		language === 'ru' ? 'Не назначен' : 'Тағайындалмаған';
	$: teacherSubject = classItem.Teacher ? 
		(language === 'ru' ? classItem.Teacher.subjectRu : classItem.Teacher.subjectKz) || 
		classItem.Teacher.subjectRu || classItem.Teacher.subjectKz : 
		'';
</script>

<div class="class-card card">
	<div class="class-header">
		<div class="class-number">
			<h3>{className}</h3>
		</div>
		<div class="class-info">
			<p class="class-teacher">
				<strong>{language === 'ru' ? 'Классный руководитель:' : 'Сынып жетекшісі:'}</strong> {teacherName}
			</p>
			{#if teacherSubject}
				<p class="class-subject">
					<strong>{language === 'ru' ? 'Предмет:' : 'Пән:'}</strong> {teacherSubject}
				</p>
			{/if}
		</div>
	</div>

	<div class="class-details">
		<div class="detail-item">
			<strong>{language === 'ru' ? 'Класс:' : 'Сынып:'}</strong> {classItem.grade} {language === 'ru' ? 'класс' : 'сынып'}
		</div>
		<div class="detail-item">
			<strong>{language === 'ru' ? 'Буква:' : 'Әріп:'}</strong> {classItem.letter}
		</div>
		{#if classItem.Schedule && classItem.Schedule.length > 0}
			<div class="detail-item">
				<strong>{language === 'ru' ? 'Занятий в расписании:' : 'Кестедегі сабақтар:'}</strong> {classItem.Schedule.length}
			</div>
		{/if}
	</div>

	{#if onDelete}
		<div class="class-actions">
			<button class="btn btn-danger" on:click={onDelete}>
				<span class="btn-icon">🗑️</span>
				{language === 'ru' ? 'Удалить' : 'Жою'}
			</button>
		</div>
	{/if}
</div>

<style>
	.class-card {
		background: hsl(var(--background));
		border-radius: 1rem;
		overflow: hidden;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
		border: 1px solid hsl(var(--border));
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 1.5rem;
	}

	/* Dark theme support */
	:global(.dark) .class-card {
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
	}

	.class-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
	}

	.class-header {
		margin-bottom: 1rem;
	}

	.class-number h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: #6366f1;
	}

	.class-teacher {
		margin: 0 0 0.25rem 0;
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
	}

	.class-subject {
		margin: 0;
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
	}

	.class-details {
		flex: 1;
		margin-bottom: 1rem;
	}

	.detail-item {
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
	}

	.detail-item strong {
		color: hsl(var(--foreground));
	}

	.class-actions {
		display: flex;
		gap: 0.5rem;
		padding-top: 1rem;
		border-top: 1px solid hsl(var(--border));
	}

	.btn {
		border: none;
		border-radius: 0.6rem;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 1rem;
		flex: 1;
	}

	.btn-danger {
		background-color: #ef4444;
		color: white;
	}

	.btn-danger:hover {
		background-color: #dc2626;
	}

	.btn-icon {
		font-size: 1rem;
		margin-right: 0.5rem;
	}
</style> 