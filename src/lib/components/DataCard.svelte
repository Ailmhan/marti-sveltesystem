<script lang="ts">
	export let data: any;
	export let type: 'news' | 'teacher' | 'honor-board' | 'section' | 'menu' = 'news';
	export let language: 'ru' | 'kz' = 'ru';
	export let showActions = true;
	export let onEdit: (() => void) | null = null;
	export let onDelete: (() => void) | null = null;
	
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
			<div class="card-description">{description}</div>
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
		background: #ffffff;
		border-radius: 1rem;
		overflow: hidden;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
		border: 1px solid #f3f4f6;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		display: flex;
		flex-direction: column;
	}

	.card:hover {
		transform: translateY(-6px);
		box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
	}

	.card-image {
		height: 180px;
		background: #f9fafb;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
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
		font-size: 3.5rem;
		color: white;
		opacity: 0.85;
	}

	.card-content {
		padding: 1.5rem;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.card-title {
		font-size: 1.3rem;
		font-weight: 600;
		color: #111827;
		margin-bottom: 0.75rem;
		line-height: 1.4;
	}

	.card-description {
		color: #4b5563;
		font-size: 0.95rem;
		line-height: 1.6;
		margin-bottom: 1rem;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		white-space: pre-line;
	}

	.card-details {
		margin-bottom: 1rem;
		border-top: 1px solid #f3f4f6;
		padding-top: 0.75rem;
	}

	.detail-item {
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
		color: #6b7280;
		margin-bottom: 0.4rem;
	}

	.detail-item strong {
		color: #374151;
	}

	.card-date {
		color: #6b7280;
		font-size: 0.85rem;
		margin-top: auto;
		padding-top: 0.5rem;
		border-top: 1px solid #f3f4f6;
	}

	.card-actions {
		display: flex;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
		border-top: 1px solid #f3f4f6;
		background-color: #fafafa;
	}

	.btn {
		padding: 0.6rem 1.2rem;
		border-radius: 0.75rem;
		border: none;
		cursor: pointer;
		font-weight: 500;
		transition: background-color 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		flex: 1;
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
