<script lang="ts">
	export let data: any;
	export let type: string;
	export let language: 'ru' | 'kz' = 'ru';
	export let showActions = false;
	export let onEdit = () => {};
	export let onDelete = () => {};

	$: title = type === 'news' 
		? (language === 'ru' ? data.titleRu : data.titleKz)
		: type === 'teacher' 
		? (language === 'ru' ? data.nameRu : data.nameKz)
		: type === 'honor-board'
		? (language === 'ru' ? data.nameRu : data.nameKz)
		: data.name || data.title;

	$: content = type === 'news' 
		? (language === 'ru' ? data.contentRu : data.contentKz)
		: type === 'teacher' 
		? (language === 'ru' ? data.subjectRu : data.subjectKz)
		: type === 'honor-board'
		? (language === 'ru' ? data.descriptionRu : data.descriptionKz)
		: type === 'section'
		? (language === 'ru' ? data.scheduleRu : data.scheduleKz)
		: type === 'canteen'
		? `Завтрак: ${language === 'ru' ? data.dishesRu?.breakfast : data.dishesKz?.breakfast}\nОбед: ${language === 'ru' ? data.dishesRu?.lunch : data.dishesKz?.lunch}\nУжин: ${language === 'ru' ? data.dishesRu?.dinner : data.dishesKz?.dinner}`
		: data.content || data.description;

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
			case 'news':
				return []; // Убираем дату из дополнительной информации для новостей
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

		{#if content}
			<div class="card-description">{content}</div>
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
		background: hsl(var(--card));
		border-radius: var(--radius);
		overflow: hidden;
		box-shadow: var(--shadow-md);
		border: 1px solid hsl(var(--border));
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		flex-direction: column;
		position: relative;
		backdrop-filter: blur(10px);
	}

	.card:hover {
		transform: translateY(-8px);
		box-shadow: var(--shadow-xl);
		border-color: hsl(var(--primary) / 0.2);
	}

	.card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, hsl(var(--primary)), hsl(262 83% 68%));
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.card:hover::before {
		opacity: 1;
	}

	.card-image {
		height: 200px;
		background: linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--accent)) 100%);
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
		background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(262 83% 68%) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.image-placeholder::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
		opacity: 0.3;
	}

	.placeholder-icon {
		font-size: 4rem;
		color: white;
		opacity: 0.9;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
		z-index: 1;
		position: relative;
	}

	.card-content {
		padding: 1.5rem;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.card-title {
		font-size: 1.4rem;
		font-weight: 700;
		background: linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--primary)) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 0.75rem;
		line-height: 1.4;
	}

	.card-description {
		color: hsl(var(--muted-foreground));
		font-size: 0.95rem;
		line-height: 1.6;
		margin-bottom: 1rem;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		line-clamp: 3;
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
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: 1px solid hsl(var(--border));
		background: linear-gradient(135deg, hsl(var(--muted) / 0.5) 0%, hsl(var(--accent) / 0.3) 100%);
		backdrop-filter: blur(10px);
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border-radius: var(--radius);
		border: none;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		flex: 1;
		position: relative;
		overflow: hidden;
	}

	.btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s;
	}

	.btn:hover::before {
		left: 100%;
	}

	.btn-edit {
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		color: white;
		box-shadow: var(--shadow-sm);
	}

	.btn-edit:hover {
		background: linear-gradient(135deg, #059669 0%, #047857 100%);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.btn-danger {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		color: white;
		box-shadow: var(--shadow-sm);
	}

	.btn-danger:hover {
		background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
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
