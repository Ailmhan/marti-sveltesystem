<script lang="ts">
	import type { Teacher } from '$lib/types/api';
	import { format } from 'date-fns';
	import { ru, kk } from 'date-fns/locale';

	export let teacher: Teacher;
	export let language: 'ru' | 'kz' = 'ru';
	$: name = language === 'ru' ? teacher.nameRu : teacher.nameKz;
	$: subject = language === 'ru' ? teacher.subjectRu : teacher.subjectKz;
	$: formattedBirthday = format(new Date(teacher.birthday), 'dd MMMM yyyy', {
		locale: language === 'ru' ? ru : kk
	});
</script>

<div class="teacher-card card">
	<div class="teacher-header">
		{#if teacher.imageUrl}
			<div class="teacher-avatar">
				<img src={teacher.imageUrl} alt={name} />
			</div>
		{:else}
			<div class="teacher-avatar-placeholder">
				{name.charAt(0)}
			</div>
		{/if}
		<div class="teacher-info">
			<h3 class="teacher-name">{name}</h3>
			<p class="teacher-subject">{subject}</p>
		</div>
	</div>

	<div class="teacher-details">
		<div class="detail-item">
			<strong>Email:</strong> {teacher.email}
		</div>
		<div class="detail-item">
			<strong>Телефон:</strong> {teacher.phone}
		</div>
		<div class="detail-item">
			<strong>День рождения:</strong> {formattedBirthday}
		</div>
	</div>


</div>

<style>
	.teacher-card {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.teacher-header {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
	}

	.teacher-avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		overflow: hidden;
		margin-right: 1rem;
		flex-shrink: 0;
	}

	.teacher-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.teacher-avatar-placeholder {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background-color: #007bff;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: bold;
		margin-right: 1rem;
		flex-shrink: 0;
	}

	.teacher-info {
		flex: 1;
	}

	.teacher-name {
		margin: 0 0 0.25rem 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: #333;
	}

	.teacher-subject {
		margin: 0;
		color: #666;
		font-size: 0.875rem;
	}

	.teacher-details {
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