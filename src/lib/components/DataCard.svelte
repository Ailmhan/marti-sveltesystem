<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { CalendarDays, GraduationCap, Newspaper, Pencil, Target, Trash2, Trophy, UtensilsCrossed } from 'lucide-svelte';
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
	type IconComponent = typeof Newspaper;

	// Тип конфигурации карточки
	type CardConfig = {
		icon: IconComponent;
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
			icon: Newspaper,
			imageHeight: 280,
			objectPosition: 'center',
			titleField: 'titleRu',
			contentField: 'contentRu',
			showDate: true,
			dateField: 'createdAt'
		},
		teacher: {
			icon: GraduationCap,
			imageHeight: 240,
			objectPosition: 'top center',
			titleField: 'nameRu',
			contentField: 'subjectRu',
			showDate: false,
			additionalFields: ['email', 'phone']
		},
		'honor-board': {
			icon: Trophy,
			imageHeight: 280,
			objectPosition: 'center',
			titleField: 'studentName',
			contentField: 'descriptionRu',
			showDate: false,
			additionalFields: []
		},
		section: {
			icon: Target,
			imageHeight: 280,
			objectPosition: 'center',
			titleField: 'nameRu',
			contentField: 'scheduleRu',
			showDate: false,
			additionalFields: ['teacher']
		},
		canteen: {
			icon: UtensilsCrossed,
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
			{@const PlaceholderIcon = config.icon}
			<div class="image-placeholder">
				<div class="placeholder-icon">
					<PlaceholderIcon class="placeholder-icon-svg" />
				</div>
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
				<CalendarDays class="card-date-icon" />
				<span>{date}</span>
			</div>
		{/if}

		<!-- Слот для дополнительного контента -->
		<slot name="extra" />
	</div>

		{#if showActions && (onEdit || onDelete)}
			<div class="card-actions">
				{#if onEdit}
					<button class="btn btn-edit" on:click={handleEdit}>
						<Pencil class="btn-icon" />
						Редактировать
					</button>
				{/if}
				{#if onDelete}
					<button class="btn btn-danger" on:click={handleDelete}>
						<Trash2 class="btn-icon" />
						Удалить
					</button>
				{/if}
		</div>
	{/if}

	<!-- Слот для действий -->
	<slot name="actions" />
</div>

<style>
	.card {
		--card-accent-start: 211 95% 52%;
		--card-accent-end: 25 92% 58%;
		--card-min-height: 410px;
		--card-compact-height: 330px;

		position: relative;
		isolation: isolate;
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: var(--card-min-height);
		overflow: hidden;
		border-radius: calc(var(--radius) + 0.25rem);
		border: 1px solid hsl(var(--border) / 0.72);
		background:
			radial-gradient(circle at 100% 0%, hsl(var(--card-accent-start) / 0.12), transparent 42%),
			linear-gradient(152deg, hsl(var(--card) / 0.98), hsl(var(--card) / 0.9));
		box-shadow: var(--shadow-md);
		transition:
			transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1),
			box-shadow 260ms ease,
			border-color 260ms ease;
	}

	.card::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			linear-gradient(160deg, hsl(var(--card-accent-start) / 0.08), transparent 36%),
			linear-gradient(340deg, hsl(var(--card-accent-end) / 0.08), transparent 45%);
		opacity: 0;
		transition: opacity 240ms ease;
	}

	.card::after {
		content: '';
		position: absolute;
		left: 1rem;
		right: 1rem;
		top: 0.72rem;
		height: 3px;
		border-radius: 999px;
		background: linear-gradient(90deg, hsl(var(--card-accent-start)), hsl(var(--card-accent-end)));
		opacity: 0.94;
	}

	.card--compact {
		min-height: var(--card-compact-height);
	}

	.card--clickable {
		cursor: pointer;
	}

	.card--clickable:hover {
		transform: translateY(-6px);
		border-color: hsl(var(--card-accent-start) / 0.45);
		box-shadow:
			0 18px 38px rgb(15 23 42 / 0.16),
			0 8px 18px rgb(15 23 42 / 0.12);
	}

	.card--clickable:hover::before {
		opacity: 1;
	}

	.card--news {
		--card-accent-start: 204 92% 56%;
		--card-accent-end: 224 88% 60%;
	}

	.card--teacher {
		--card-accent-start: 158 62% 44%;
		--card-accent-end: 186 70% 45%;
	}

	.card--honor-board {
		--card-accent-start: 41 93% 55%;
		--card-accent-end: 18 92% 60%;
	}

	.card--section {
		--card-accent-start: 268 85% 63%;
		--card-accent-end: 230 80% 66%;
	}

	.card--canteen {
		--card-accent-start: 16 90% 58%;
		--card-accent-end: 35 94% 56%;
	}

	.card-image {
		position: relative;
		margin: 0.9rem 0.9rem 0;
		overflow: hidden;
		border-radius: calc(var(--radius) + 0.02rem);
		border: 1px solid hsl(var(--border) / 0.72);
		background: hsl(var(--muted) / 0.5);
		flex-shrink: 0;
	}

	.card-image::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: linear-gradient(180deg, transparent 35%, rgb(2 6 23 / 0.22) 100%);
		opacity: 0.35;
		transition: opacity 260ms ease;
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		transition: transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1), filter 260ms ease;
	}

	.card--teacher .card-image img {
		object-position: top center;
	}

	.card:hover .card-image img {
		transform: scale(1.08);
		filter: saturate(1.08) contrast(1.04);
	}

	.card:hover .card-image::after {
		opacity: 0.14;
	}

	.image-placeholder {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		background:
			radial-gradient(circle at 22% 20%, hsl(var(--card-accent-start) / 0.28), transparent 46%),
			radial-gradient(circle at 82% 80%, hsl(var(--card-accent-end) / 0.28), transparent 52%),
			linear-gradient(145deg, hsl(var(--muted)), hsl(var(--card)));
	}

	.placeholder-icon {
		width: 3.6rem;
		height: 3.6rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: hsl(var(--card) / 0.7);
		border-radius: 999px;
		box-shadow: var(--shadow);
	}

	.placeholder-icon-svg {
		width: 1.7rem;
		height: 1.7rem;
		color: hsl(var(--foreground) / 0.86);
		stroke-width: 1.9;
	}

	.card-content {
		padding: 1.1rem 1.2rem 1.2rem;
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 0.78rem;
	}

	.card-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.22rem;
		font-weight: 700;
		letter-spacing: -0.015em;
		line-height: 1.24;
		color: hsl(var(--foreground));
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-description {
		margin: 0;
		color: hsl(var(--muted-foreground));
		font-size: 0.93rem;
		line-height: 1.58;
		white-space: pre-line;
		flex: 1;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-details {
		display: grid;
		gap: 0.4rem;
		padding-top: 0.85rem;
		border-top: 1px dashed hsl(var(--border) / 0.78);
	}

	.detail-item {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.45rem;
		font-size: 0.81rem;
		line-height: 1.45;
		color: hsl(var(--muted-foreground));
	}

	.detail-item strong {
		color: hsl(var(--foreground) / 0.86);
		font-weight: 600;
	}

	.card-date {
		margin-top: auto;
		padding-top: 0.82rem;
		border-top: 1px dashed hsl(var(--border) / 0.78);
		font-size: 0.79rem;
		color: hsl(var(--muted-foreground));
		display: flex;
		align-items: center;
		gap: 0.38rem;
	}

	.card-date-icon {
		width: 0.86rem;
		height: 0.86rem;
		flex-shrink: 0;
	}

	.card-actions {
		display: flex;
		gap: 0.55rem;
		margin: 0 0.9rem 0.95rem;
		padding-top: 0.88rem;
		border-top: 1px solid hsl(var(--border) / 0.72);
	}

	.btn {
		flex: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.38rem;
		padding: 0.62rem 0.92rem;
		border-radius: 0.8rem;
		border: 1px solid transparent;
		font-size: 0.81rem;
		font-weight: 700;
		cursor: pointer;
		transition: transform 180ms ease, box-shadow 220ms ease, background-color 220ms ease;
	}

	.btn-edit {
		background: linear-gradient(130deg, hsl(var(--primary)), hsl(var(--primary) / 0.82));
		color: hsl(var(--primary-foreground));
		box-shadow: var(--shadow-sm);
	}

	.btn-edit:hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.btn-danger {
		background: linear-gradient(130deg, hsl(var(--destructive)), hsl(var(--destructive) / 0.86));
		color: hsl(var(--destructive-foreground));
		box-shadow: var(--shadow-sm);
	}

	.btn-danger:hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.btn-icon {
		width: 0.84rem;
		height: 0.84rem;
		stroke-width: 2.2;
	}

	@media (max-width: 768px) {
		.card {
			--card-min-height: 360px;
			--card-compact-height: 300px;
		}

		.card-content {
			padding: 1rem 1rem 1.05rem;
		}

		.card-title {
			font-size: 1.1rem;
		}

		.card-actions {
			flex-direction: column;
			margin: 0 0.75rem 0.8rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card,
		.card::before,
		.card-image::after,
		.card-image img,
		.btn {
			transition: none;
		}

		.card--clickable:hover {
			transform: none;
		}

		.card:hover .card-image img {
			transform: none;
			filter: none;
		}
	}
</style>
