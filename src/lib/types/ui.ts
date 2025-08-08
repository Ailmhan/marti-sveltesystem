export interface Filter {
	label: string;
	value: string;
	count?: number;
}

export interface ScheduleEvent {
	id: string | number;
	title: string;
	date: Date;
	description?: string;
	type?: 'news' | 'schedule' | 'canteen' | 'honor-board';
	color?: string;
}

export interface SortOption {
	label: string;
	value: string;
	direction?: 'asc' | 'desc';
}

export interface ViewOption {
	label: string;
	value: 'grid' | 'list' | 'calendar';
	icon: string;
}

export interface PageState {
	searchTerm: string;
	selectedFilters: string[];
	sortBy: string;
	view: 'grid' | 'list' | 'calendar';
	currentPage: number;
	itemsPerPage: number;
}
