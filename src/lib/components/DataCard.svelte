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
			imageHeight: 280,
			objectPosition: 'center',
			titleField: 'titleRu',
			contentField: 'contentRu',
			showDate: true,
			dateField: 'createdAt'
		},
		teacher: {
			icon: '👨‍🏫',
			imageHeight: 240,
			objectPosition: 'top center',
			titleField: 'nameRu',
			contentField: 'subjectRu',
			showDate: false,
			additionalFields: ['email', 'phone']
		},
		'honor-board': {
			icon: '🏆',
			imageHeight: 280,
			objectPosition: 'center',
			titleField: 'studentName',
			contentField: 'descriptionRu',
			showDate: false,
			additionalFields: []
		},
		section: {
			icon: '🎯',
			imageHeight: 280,
			objectPosition: 'center',
			titleField: 'nameRu',
			contentField: 'scheduleRu',
			showDate: false,
			additionalFields: ['teacher']
		},
		canteen: {
			icon: '🍽️',
			imageHeight: 240,
			objectPosition: 'center',
			titleField: 'date',
			contentField: 'dishes',
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

	// Функция для получения настроек изображений из localStorage
	function getImageSettings(cardType: CardType) {
		if (typeof window === 'undefined') return { height: 280, width: 100 };
		
		const height = parseInt(localStorage.getItem(`cardImageHeight_${cardType}`) || '280');
		const width = parseInt(localStorage.getItem(`cardImageWidth_${cardType}`) || '100');
		
		return { height, width };
	}

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
	
	// Простая логика - никаких сложных состояний

	// Вспомогательные функции
	function getFieldValue(data: CardData, field: string, language: 'ru' | 'kz'): string {
			// Специальная обработка для меню столовой
	if (field === 'dishes' && 'dishesRu' in data) {
		const dishes = language === 'ru' ? (data as any).dishesRu : (data as any).dishesKz;
		return `Завтрак: ${dishes?.breakfast || 'Не указано'}\nОбед: ${dishes?.lunch || 'Не указано'}\nУжин: ${dishes?.dinner || 'Не указано'}`;
	}
		
		// Специальная обработка для даты
		if (field === 'date' && 'date' in data) {
			return formatDate(data.date as string);
		}

		// Поля без языковых вариантов (возвращаем как есть)
		const nonLocalizedFields = ['studentName', 'teacher', 'teacherId', 'grade', 'letter', 'phone', 'email', 'birthday'];
		if (nonLocalizedFields.includes(field)) {
			return (data as any)[field] || '';
		}

		// Поля с языковыми вариантами (автоматическое переключение)
		if (field.endsWith('Ru') || field.endsWith('Kz')) {
			const baseField = field.replace(/Ru$|Kz$/, '');
			const langField = language === 'ru' ? `${baseField}Ru` : `${baseField}Kz`;
			return (data as any)[langField] || (data as any)[field] || '';
		}

		// Для остальных полей пробуем получить значение на нужном языке
		const langField = field.replace('Ru', language === 'ru' ? 'Ru' : 'Kz');
		return (data as any)[langField] || (data as any)[field] || '';
	}

	function getAdditionalInfo(data: CardData, fields: string[]): Array<{ label: string; value: string }> {
		const labels: Record<string, string> = {
			email: 'Email',
			phone: 'Телефон',
			teacher: 'Руководитель',
			studentName: 'Имя ученика',
			descriptionKz: 'Описание (КЗ)',
			descriptionRu: 'Описание (РУ)'
		};

		return fields
			.map(field => {
				// Используем ту же логику перевода, что и в getFieldValue
				const value = getFieldValue(data, field, language);
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

	// Функция для получения настроек отображения изображения
	function getImageDisplaySettings(data: CardData) {
		// Проверяем, есть ли настройки изображения в данных
		if ('imageDisplay' in data && data.imageDisplay) {
			const settings = data.imageDisplay;
			return {
				objectFit: 'cover', // Всегда cover для карточек
				objectPosition: `${settings.cropX}% ${settings.cropY}%`,
				zoom: settings.zoom
			};
		}
		
		// Возвращаем настройки по умолчанию
		return {
			objectFit: 'cover',
			objectPosition: '50% 50%', // По центру
			zoom: 1
		};
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
		<div class="card-image" style="height: {getImageSettings(type).height}px; width: {getImageSettings(type).width}%;">
		{#if imageUrl}
			<img 
				src={imageUrl} 
				alt={title} 
				loading="lazy"
				style="
					object-fit: {getImageDisplaySettings(data).objectFit};
					object-position: {getImageDisplaySettings(data).objectPosition};
					transform: scale({getImageDisplaySettings(data).zoom});
					width: 100%; 
					height: 100%;
				"
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
	@layer critical {
		.card-image img {
			/* Настройки изображения теперь управляются через JavaScript */
			width: 100%;
			height: 100%;
		}
	}
	
	/* CSS переменные для настройки */
	:root {
		--card-padding: 1.5rem;
		--card-gap: 0.75rem;
		--card-border-radius: var(--radius);
		--card-shadow: var(--shadow-md);
		--card-shadow-hover: var(--shadow-xl);
		--card-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
		position: relative;
		overflow: hidden;
		flex-shrink: 0;
		background: hsl(var(--muted) / 0.05);
		margin: 0 auto;
	}

	.card-image img {
		width: 100% !important;
		height: 100% !important;
		object-fit: fill !important;
		object-position: center !important;
		transition: transform 0.3s ease, filter 0.3s ease;
		background: hsl(var(--muted) / 0.1);
	}

	/* Принудительно применяем object-fit: fill для всех типов карточек */
	.card--news .card-image img,
	.card--teacher .card-image img,
	.card--honor-board .card-image img,
	.card--canteen .card-image img,
	.card--section .card-image img {
		object-fit: fill !important;
		object-position: center !important;
	}
	
	/* Специальное позиционирование для учителей */
	.card--teacher .card-image img {
		object-position: top center !important;
	}
	
	/* Принудительно переопределяем любые другие стили */
	.card-image img[style*="object-fit"] {
		object-fit: contain !important;
	}
	
	/* Убираем любые ограничения по высоте */
	.card-image img {
		max-height: none !important;
		min-height: none !important;
	}
	
	/* Принудительно применяем object-fit: fill через селектор по атрибуту */
	img[src] {
		object-fit: fill !important;
	}
	
	/* Максимальная специфичность для object-fit */
	:where(.card-image img) {
		object-fit: fill !important;
	}
	
	/* Еще более специфичный селектор */
	.card-image:has(img) img {
		object-fit: fill !important;
	}

	.card:hover .card-image img {
		transform: scale(1.05);
		filter: brightness(1.1) contrast(1.05);
	}

	/* Простой placeholder */
	.image-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(262 83% 68%) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Простой placeholder без сложных эффектов */

	.placeholder-icon {
		font-size: 2.5rem;
		color: white;
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
		color: hsl(var(--foreground));
	}

	:global(.dark) .card:hover {
		border-color: hsl(var(--ring));
		box-shadow: 0 10px 25px -5px hsl(var(--foreground) / 0.1), 0 10px 10px -5px hsl(var(--foreground) / 0.04);
	}

	:global(.dark) .card-title {
		color: hsl(var(--foreground));
	}

	:global(.dark) .card-description {
		color: hsl(var(--muted-foreground));
	}

	:global(.dark) .card-meta {
		color: hsl(var(--muted-foreground));
	}

	:global(.dark) .btn-edit {
		background: hsl(var(--secondary));
		color: hsl(var(--secondary-foreground));
	}

	:global(.dark) .btn-edit:hover {
		background: hsl(var(--secondary) / 0.9);
	}

	:global(.dark) .btn-danger {
		background: hsl(var(--destructive));
		color: hsl(var(--destructive-foreground));
	}

	:global(.dark) .btn-danger:hover {
		background: hsl(var(--destructive) / 0.9);
	}

	/* Убираем дублирующиеся правила для разных типов */

	/* Убираем дублирующиеся правила для мобильных */
</style>
