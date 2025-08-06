<script lang="ts">
	export let data: any;
	export let type: 'news' | 'teacher' | 'honor-board' | 'section' | 'menu' = 'news';
	export let language: 'ru' | 'kz' = 'ru';
	export let showActions = true;
	export let onEdit: (() => void) | null = null;
	export let onDelete: (() => void) | null = null;
	
	// Определяем поля в зависимости от типа
	$: title = type === 'news' 
		? (language === 'ru' ? data.titleRu : data.titleKz)
		: type === 'teacher'
		? (language === 'ru' ? data.nameRu : data.nameKz)
		: type === 'honor-board'
		? data.studentName
		: type === 'section'
		? (language === 'ru' ? data.nameRu : data.nameKz)
		: type === 'menu'
		? `Меню на ${formatDate(data.date)}`
		: data.name || 'Без названия';
	
	$: description = type === 'news'
		? (language === 'ru' ? data.contentRu : data.contentKz)
		: type === 'teacher'
		? (language === 'ru' ? data.subjectRu : data.subjectKz)
		: type === 'honor-board'
		? (language === 'ru' ? data.descriptionRu : data.descriptionKz)
		: type === 'section'
		? (language === 'ru' ? data.scheduleRu : data.scheduleKz)
		: type === 'menu'
		? `Завтрак: ${language === 'ru' ? data.dishesRu?.breakfast : data.dishesKz?.breakfast}\nОбед: ${language === 'ru' ? data.dishesRu?.lunch : data.dishesKz?.lunch}\nУжин: ${language === 'ru' ? data.dishesRu?.dinner : data.dishesKz?.dinner}`
		: data.description || '';
	
	$: imageUrl = data.imageUrl || '';
	$: date = data.createdAt || data.birthday || '';
	$: icon = type === 'news' ? '📰' : type === 'teacher' ? '👨‍🏫' : type === 'honor-board' ? '🏆' : type === 'section' ? '🎯' : type === 'menu' ? '🍽️' : '📋';
	
	function formatDate(dateString: string) {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString('ru-RU', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
	
	function getAdditionalInfo() {
		switch (type) {
			case 'teacher':
				return [
					{ label: 'Email', value: data.email },
					{ label: 'Телефон', value: data.phone }
				];
			case 'honor-board':
				return [];
			case 'section':
				return [
					{ label: 'Руководитель', value: data.teacher }
				];
			case 'menu':
				return [
					{ label: 'Дата', value: formatDate(data.date) }
				];
			default:
				return [
					{ label: 'Дата', value: formatDate(data.createdAt) }
				];
		}
	}
</script>

<div class="card">
	<div class="card-image">
		{#if imageUrl}
			<img src={imageUrl} alt={title} />
		{:else}
			<div class="image-placeholder">
				<span class="placeholder-icon">{icon}</span>
			</div>
		{/if}
	</div>
	
	<div class="card-content">
		<h3 class="card-title">{title}</h3>
		
		{#if description}
			<div class="card-description">
				{description}
			</div>
		{/if}
		
		{#if getAdditionalInfo().length > 0}
			<div class="card-details">
				{#each getAdditionalInfo() as info}
					<div class="detail-item">
						<strong>{info.label}:</strong> {info.value}
					</div>
				{/each}
			</div>
		{/if}
		
		{#if date && type !== 'teacher' && type !== 'section' && type !== 'menu'}
			<div class="card-date">
				📅 {formatDate(date)}
			</div>
		{/if}
	</div>
	
	{#if showActions && (onEdit || onDelete)}
		<div class="card-actions">
			{#if onEdit}
				<button class="btn btn-edit" on:click={onEdit}>
					<span class="btn-icon">✏️</span>
					Редактировать
				</button>
			{/if}
			{#if onDelete}
				<button class="btn btn-danger" on:click={onDelete}>
					<span class="btn-icon">🗑️</span>
					Удалить
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.card {
		background: white;
		border-radius: 1rem;
		overflow: hidden;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s, box-shadow 0.2s;
		border: 1px solid #e5e7eb;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.card:hover {
		transform: translateY(-4px);
		box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
	}

	.card-image {
		width: 100%;
		height: 200px;
		overflow: hidden;
		position: relative;
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.image-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.placeholder-icon {
		font-size: 3rem;
		color: white;
		opacity: 0.8;
	}

	.card-content {
		padding: 1.5rem;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.card-title {
		font-size: 1.25rem;
		font-weight: bold;
		color: #1f2937;
		margin: 0 0 1rem 0;
		line-height: 1.3;
	}

	.card-description {
		color: #6b7280;
		line-height: 1.6;
		margin: 0 0 1rem 0;
		flex: 1;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-details {
		margin-bottom: 1rem;
	}

	.detail-item {
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.detail-item strong {
		color: #374151;
	}

	.card-date {
		color: #9ca3af;
		font-size: 0.875rem;
		margin-top: auto;
		padding-top: 1rem;
		border-top: 1px solid #f3f4f6;
	}

	.card-actions {
		display: flex;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
		border-top: 1px solid #e5e7eb;
		background-color: #f9fafb;
	}

	.btn {
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		border: none;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		flex: 1;
		justify-content: center;
	}

	.btn-edit {
		background-color: #059669;
		color: white;
	}

	.btn-edit:hover {
		background-color: #047857;
	}

	.btn-danger {
		background-color: #dc2626;
		color: white;
	}

	.btn-danger:hover {
		background-color: #b91c1c;
	}

	.btn-icon {
		font-size: 1rem;
	}

	@media (max-width: 768px) {
		.card-actions {
			flex-direction: column;
		}
		
		.card-description {
			-webkit-line-clamp: 4;
		}
	}
</style> 