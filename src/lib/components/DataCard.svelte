<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { 
		News, 
		Teacher, 
		HonorBoard, 
		CanteenMenu, 
		Section 
	} from '$lib/types/api';

	// Типы для карточки
	type CardData = News | Teacher | HonorBoard | CanteenMenu | Section;
	type CardType = 'news' | 'teacher' | 'honor-board' | 'canteen' | 'section';

	// Тип конфигурации карточки
	type CardConfig = {
		icon: string;
		imageHeight: number;
		objectPosition: string;
		titleField: string;
		contentField: string;
		showDate: boolean;
		dateField?: string;
		additionalFields?: string[];
		isSpecialContent?: boolean;
	};

	// Конфигурация для разных типов карточек
	const CARD_CONFIG: Record<CardType, CardConfig> = {
		news: {
			icon: '📰',
			imageHeight: 180,
			objectPosition: 'center',
			titleField: 'titleRu',
			contentField: 'contentRu',
			showDate: true,
			dateField: 'createdAt'
		},
		teacher: {
			icon: '👨‍🏫',
			imageHeight: 220,
			objectPosition: 'top center',
			titleField: 'nameRu',
			contentField: 'subjectRu',
			showDate: false,
			additionalFields: ['email', 'phone']
		},
		'honor-board': {
			icon: '🏆',
			imageHeight: 200,
			objectPosition: 'center',
			titleField: 'nameRu',
			contentField: 'descriptionRu',
			showDate: false
		},
		section: {
			icon: '🎯',
			imageHeight: 180,
			objectPosition: 'center',
			titleField: 'nameRu',
			contentField: 'scheduleRu',
			showDate: false,
			additionalFields: ['teacher']
		},
		canteen: {
			icon: '🍽️',
			imageHeight: 160,
			objectPosition: 'center',
			titleField: 'date',
			contentField: 'dishesRu',
			showDate: true,
			dateField: 'date',
			isSpecialContent: true
		}
	};

	// Пропсы компонента
	interface Props {
		data: CardData;
		type: CardType;
		language?: 'ru' | 'kz';
		showActions?: boolean;
		showImage?: boolean;
		compact?: boolean;
		onEdit?: () => void;
		onDelete?: () => void;
		onClick?: () => void;
		class?: string;
	}

	// Устанавливаем значения по умолчанию
	let {
		data,
		type,
		language = 'ru',
		showActions = false,
		showImage = true,
		compact = false,
		onEdit,
		onDelete,
		onClick,
		class: className = ''
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		edit: void;
		delete: void;
		click: void;
	}>();

	// Получаем конфигурацию для текущего типа
	const config = $derived(CARD_CONFIG[type]);
	
	// Вычисляемые значения
	const title = $derived(getFieldValue(data, config.titleField, language));
	const content = $derived(getFieldValue(data, config.contentField, language));
	const imageUrl = $derived(data.imageUrl || '');
	const date = $derived(config.showDate && config.dateField ? getFieldValue(data, config.dateField, language) : '');
	const additionalInfo = $derived(config.additionalFields ? getAdditionalInfo(data, config.additionalFields) : []);

	// Вспомогательные функции
	function getFieldValue(data: CardData, field: string, language: 'ru' | 'kz'): string {
		if (field === 'dishesRu' && 'dishesRu' in data) {
			const dishes = data.dishesRu as any;
			return `Завтрак: ${dishes?.breakfast || 'Не указано'}\nОбед: ${dishes?.lunch || 'Не указано'}\nУжин: ${dishes?.dinner || 'Не указано'}`;
		}
		
		if (field === 'date' && 'date' in data) {
			return formatDate(data.date as string);
		}

		const value = (data as any)[field];
		if (typeof value === 'string') return value;
		
		// Пробуем получить значение на нужном языке
		const langField = field.replace('Ru', language === 'ru' ? 'Ru' : 'Kz');
		return (data as any)[langField] || value || '';
	}

	function getAdditionalInfo(data: CardData, fields: string[]): Array<{ label: string; value: string }> {
		const labels: Record<string, string> = {
			email: 'Email',
			phone: 'Телефон',
			teacher: 'Руководитель'
		};

		return fields
			.map(field => {
				const value = (data as any)[field];
				return value ? { label: labels[field] || field, value } : null;
			})
			.filter(Boolean) as Array<{ label: string; value: string }>;
	}

	function formatDate(dateString: string): string {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString('ru-RU', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	// Обработчики событий
	function handleEdit(event: Event) {
		event.stopPropagation();
		dispatch('edit');
		onEdit?.();
	}

	function handleDelete(event: Event) {
		event.stopPropagation();
		dispatch('delete');
		onDelete?.();
	}

	function handleClick() {
		dispatch('click');
		onClick?.();
	}

	// CSS классы
	const cardClasses = $derived([
		'card',
		`card--${type}`,
		{ 'card--compact': compact, 'card--clickable': !!onClick },
		className
	].filter(Boolean).join(' '));
</script>

<div class={cardClasses} data-type={type} on:click={handleClick}>
	{#if showImage}
		<div class="card-image" style="height: {config.imageHeight}px">
			{#if imageUrl}
				<img 
					src={imageUrl} 
					alt={title} 
					loading="lazy"
					style="object-position: {config.objectPosition}"
					on:error={() => data.imageUrl = ''}
				/>
			{:else}
				<div class="image-placeholder">
					<span class="placeholder-icon">{config.icon}</span>
				</div>
			{/if}
		</div>
	{/if}

	<div class="card-content">
		<h3 class="card-title">{title}</h3>

		{#if content}
			<div class="card-description">{content}</div>
		{/if}

		{#if additionalInfo.length > 0}
			<div class="card-details">
				{#each additionalInfo as info}
					<div class="detail-item">
						<strong>{info.label}:</strong> {info.value}
					</div>
				{/each}
			</div>
		{/if}

		{#if date && config.showDate}
			<div class="card-date">
				📅 {date}
			</div>
		{/if}

		<!-- Слот для дополнительного контента -->
		<slot name="extra" />
	</div>

	{#if showActions && (onEdit || onDelete)}
		<div class="card-actions">
			{#if onEdit}
				<button class="btn btn-edit" on:click={handleEdit}>
					<span class="btn-icon">✏️</span>
					Редактировать
				</button>
			{/if}
			{#if onDelete}
				<button class="btn btn-danger" on:click={handleDelete}>
					<span class="btn-icon">🗑️</span>
					Удалить
				</button>
			{/if}
		</div>
	{/if}

	<!-- Слот для действий -->
	<slot name="actions" />
</div>

<style>
	/* CSS переменные для настройки */
	:root {
		--card-padding: 1.5rem;
		--card-gap: 0.75rem;
		--card-border-radius: var(--radius);
		--card-shadow: var(--shadow-md);
		--card-shadow-hover: var(--shadow-xl);
		--card-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		--card-image-height: 200px;
		--card-min-height: 400px;
		--card-compact-height: 320px;
	}

	/* Базовые стили карточки */
	.card {
		background: hsl(var(--card));
		border-radius: var(--card-border-radius);
		overflow: hidden;
		box-shadow: var(--card-shadow);
		border: 1px solid hsl(var(--border));
		transition: var(--card-transition);
		display: flex;
		flex-direction: column;
		position: relative;
		backdrop-filter: blur(10px);
		height: 100%;
		min-height: var(--card-min-height);
	}

	/* Модификаторы карточки */
	.card--compact {
		min-height: var(--card-compact-height);
	}

	.card--clickable {
		cursor: pointer;
	}

	.card--clickable:hover {
		transform: translateY(-4px);
		box-shadow: var(--card-shadow-hover);
		border-color: hsl(var(--primary) / 0.3);
	}

	/* Специфичные стили для разных типов */
	.card--news {
		border-left: 3px solid hsl(200 100% 50%);
	}

	.card--teacher {
		border-left: 3px solid hsl(120 100% 40%);
	}

	.card--honor-board {
		border-left: 3px solid hsl(45 100% 50%);
	}

	.card--section {
		border-left: 3px solid hsl(280 100% 60%);
	}

	.card--canteen {
		border-left: 3px solid hsl(15 100% 50%);
	}

	.card:hover::before {
		opacity: 1;
	}

	.card-image {
		height: var(--card-image-height); /* Фиксированная высота для всех изображений */
		background: linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--accent)) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
		flex-shrink: 0; /* Предотвращаем сжатие */
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover; /* Сохраняем пропорции */
		object-position: center; /* Центрируем изображение */
		transition: transform 0.3s ease, opacity 0.3s ease;
		will-change: transform; /* Оптимизация производительности */
		opacity: 1;
	}

	.card-image img[src=""] {
		opacity: 0;
	}

	.card:hover .card-image img {
		transform: scale(1.05);
	}

	/* Плавное появление изображений */
	.card-image img {
		animation: fadeIn 0.3s ease-in-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* Улучшенный placeholder для разных типов контента */
	.image-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(262 83% 68%) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
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

	.image-placeholder::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 80px;
		height: 80px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		backdrop-filter: blur(10px);
	}

	.placeholder-icon {
		font-size: 2.5rem;
		color: white;
		opacity: 0.9;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
		z-index: 2;
		position: relative;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.card-content {
		padding: var(--card-padding);
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--card-gap);
	}

	.card-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		margin: 0;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-description {
		color: hsl(var(--muted-foreground));
		font-size: 0.875rem;
		line-height: 1.5;
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		white-space: pre-line;
		flex: 1;
	}

	.card-details {
		margin: 0;
		border-top: 1px solid hsl(var(--border));
		padding-top: 0.75rem;
	}

	.detail-item {
		display: flex;
		justify-content: space-between;
		font-size: 0.8rem;
		color: hsl(var(--muted-foreground));
		margin-bottom: 0.25rem;
	}

	.detail-item:last-child {
		margin-bottom: 0;
	}

	.detail-item strong {
		color: hsl(var(--foreground));
		font-weight: 500;
	}

	.card-date {
		color: hsl(var(--muted-foreground));
		font-size: 0.8rem;
		margin-top: auto;
		padding-top: 0.75rem;
		border-top: 1px solid hsl(var(--border));
		opacity: 0.8;
	}

	.card-actions {
		display: flex;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
		border-top: 1px solid hsl(var(--border));
		background: hsl(var(--muted) / 0.3);
		backdrop-filter: blur(10px);
		flex-shrink: 0; /* Предотвращаем сжатие */
	}

	.btn {
		padding: 0.5rem 1rem;
		border-radius: calc(var(--radius) - 0.25rem);
		border: none;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		font-size: 0.8rem;
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
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		box-shadow: var(--shadow-sm);
	}

	.btn-edit:hover {
		background: hsl(var(--primary) / 0.9);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.btn-danger {
		background: hsl(var(--destructive));
		color: hsl(var(--destructive-foreground));
		box-shadow: var(--shadow-sm);
	}

	.btn-danger:hover {
		background: hsl(var(--destructive) / 0.9);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.btn-icon {
		font-size: 0.875rem;
	}

	/* Темная тема */
	:global(.dark) .card {
		background: hsl(var(--card));
		border-color: hsl(var(--border));
	}

	:global(.dark) .card-title {
		color: hsl(var(--foreground));
	}

	:global(.dark) .card-description {
		color: hsl(var(--muted-foreground));
	}

	:global(.dark) .detail-item strong {
		color: hsl(var(--foreground));
	}

	:global(.dark) .detail-item {
		color: hsl(var(--muted-foreground));
	}

	:global(.dark) .card-date {
		color: hsl(var(--muted-foreground));
	}

	:global(.dark) .card-actions {
		background: hsl(var(--muted) / 0.2);
		border-color: hsl(var(--border));
	}

	/* Адаптивные размеры для разных типов контента */
	.card[data-type="news"] .card-image {
		height: 180px;
	}

	.card[data-type="teacher"] .card-image {
		height: 220px;
	}

	.card[data-type="honor-board"] .card-image {
		height: 200px;
	}

	.card[data-type="canteen"] .card-image {
		height: 160px;
	}

	.card[data-type="section"] .card-image {
		height: 180px;
	}

	/* Улучшенное отображение изображений для портретных фото */
	.card[data-type="teacher"] .card-image img {
		object-position: top center;
	}

	/* Улучшенное отображение для новостей и достижений */
	.card[data-type="news"] .card-image img,
	.card[data-type="honor-board"] .card-image img {
		object-position: center;
	}

	/* Специальная обработка для меню столовой */
	.card[data-type="canteen"] .card-image img {
		object-position: center;
	}

	/* Адаптивность для мобильных устройств */
	@media (max-width: 768px) {
		.card {
			min-height: 350px;
		}

		.card-image {
			height: 160px !important; /* Единая высота на мобильных */
		}

		.placeholder-icon {
			font-size: 2rem;
		}

		.image-placeholder::after {
			width: 60px;
			height: 60px;
		}

		.card-actions {
			flex-direction: column;
		}

		.card-description {
			-webkit-line-clamp: 4;
		}
	}

	@media (max-width: 480px) {
		.card-image {
			height: 140px !important;
		}

		.placeholder-icon {
			font-size: 1.8rem;
		}

		.card-content {
			padding: 1rem;
		}

		.card-title {
			font-size: 1.1rem;
		}

		.card-description {
			font-size: 0.8rem;
		}
	}
</style>
