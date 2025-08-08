import type { Filter, SortOption } from '$lib/types/ui';

export function searchItems<T>(
	items: T[],
	searchTerm: string,
	searchFields: (keyof T)[]
): T[] {
	if (!searchTerm.trim()) return items;

	const term = searchTerm.toLowerCase();
	return items.filter(item =>
		searchFields.some(field => {
			const value = item[field];
			if (typeof value === 'string') {
				return value.toLowerCase().includes(term);
			}
			if (typeof value === 'number') {
				return value.toString().includes(term);
			}
			return false;
		})
	);
}

export function filterItems<T>(
	items: T[],
	selectedFilters: string[],
	filterField: keyof T
): T[] {
	if (selectedFilters.length === 0) return items;

	return items.filter(item => {
		const value = item[filterField];
		if (typeof value === 'string') {
			return selectedFilters.includes(value);
		}
		if (typeof value === 'number') {
			return selectedFilters.includes(value.toString());
		}
		return false;
	});
}

export function sortItems<T>(
	items: T[],
	sortBy: string,
	sortOptions: SortOption[]
): T[] {
	if (!sortBy) return items;

	const option = sortOptions.find(opt => opt.value === sortBy);
	if (!option) return items;

	return [...items].sort((a, b) => {
		const aValue = a[sortBy as keyof T];
		const bValue = b[sortBy as keyof T];

		if (typeof aValue === 'string' && typeof bValue === 'string') {
			const comparison = aValue.localeCompare(bValue);
			return option.direction === 'desc' ? -comparison : comparison;
		}

		if (typeof aValue === 'number' && typeof bValue === 'number') {
			const comparison = aValue - bValue;
			return option.direction === 'desc' ? -comparison : comparison;
		}

		return 0;
	});
}

export function generateFilters<T>(
	items: T[],
	field: keyof T,
	labelField?: keyof T
): Filter[] {
	const uniqueValues = new Set<string>();
	const valueCounts = new Map<string, number>();

	items.forEach(item => {
		const value = item[field];
		if (value !== null && value !== undefined) {
			const stringValue = value.toString();
			uniqueValues.add(stringValue);
			valueCounts.set(stringValue, (valueCounts.get(stringValue) || 0) + 1);
		}
	});

	return Array.from(uniqueValues).map(value => ({
		label: labelField ? 
			items.find(item => item[field]?.toString() === value)?.[labelField]?.toString() || value :
			value,
		value,
		count: valueCounts.get(value)
	}));
}

export function paginateItems<T>(
	items: T[],
	currentPage: number,
	itemsPerPage: number
): { items: T[]; totalPages: number; totalItems: number } {
	const totalItems = items.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;

	return {
		items: items.slice(startIndex, endIndex),
		totalPages,
		totalItems
	};
}

// Специфичные фильтры для разных типов данных
export function getNewsFilters(news: any[]): Filter[] {
	return [
		{ label: 'Все новости', value: 'all' }
	];
}

export function getTeacherFilters(teachers: any[]): Filter[] {
	const subjects = generateFilters(teachers, 'subjectRu');
	return [
		{ label: 'Все учителя', value: 'all' },
		...subjects
	];
}

export function getClassFilters(classes: any[]): Filter[] {
	const grades = generateFilters(classes, 'grade');
	return [
		{ label: 'Все классы', value: 'all' },
		...grades.map(grade => ({
			...grade,
			label: `${grade.label} класс`
		}))
	];
}

export function getScheduleFilters(schedule: any[]): Filter[] {
	const subjects = generateFilters(schedule, 'subjectRu');
	const classes = generateFilters(schedule, 'classId');
	
	return [
		{ label: 'Все занятия', value: 'all' },
		...subjects,
		...classes.map(cls => ({
			...cls,
			label: `Класс ${cls.label}`
		}))
	];
}

// Специфичные опции сортировки
export function getNewsSortOptions(): SortOption[] {
	return [
		{ label: 'По дате (новые)', value: 'createdAt', direction: 'desc' },
		{ label: 'По дате (старые)', value: 'createdAt', direction: 'asc' },
		{ label: 'По заголовку', value: 'titleRu', direction: 'asc' }
	];
}

export function getTeacherSortOptions(): SortOption[] {
	return [
		{ label: 'По имени', value: 'nameRu', direction: 'asc' },
		{ label: 'По предмету', value: 'subjectRu', direction: 'asc' },
		{ label: 'По дате рождения', value: 'birthday', direction: 'asc' }
	];
}

export function getClassSortOptions(): SortOption[] {
	return [
		{ label: 'По номеру класса', value: 'grade', direction: 'asc' },
		{ label: 'По букве', value: 'letter', direction: 'asc' }
	];
}

export function getScheduleSortOptions(): SortOption[] {
	return [
		{ label: 'По дате', value: 'date', direction: 'asc' },
		{ label: 'По времени', value: 'startTime', direction: 'asc' },
		{ label: 'По предмету', value: 'subjectRu', direction: 'asc' }
	];
}
