<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { PageState, Filter, SortOption, ViewOption } from '$lib/types/ui';
	import SearchFilter from './SearchFilter.svelte';

	export let title: string;
	export let loading = false;
	export let error = '';
	export let showSearch = true;
	export let showFilters = true;
	export let showViewToggle = true;
	export let showSort = true;
	export let filters: Filter[] = [];
	export let sortOptions: SortOption[] = [];
	export let viewOptions: ViewOption[] = [
		{ label: 'Сетка', value: 'grid', icon: '⊞' },
		{ label: 'Список', value: 'list', icon: '☰' }
	];

	// Состояние страницы
	let pageState: PageState = {
		searchTerm: '',
		selectedFilters: [],
		sortBy: '',
		view: 'grid',
		currentPage: 1,
		itemsPerPage: 12
	};

	const dispatch = createEventDispatcher<{
		search: string;
		filter: string[];
		sort: string;
		viewChange: 'grid' | 'list' | 'calendar';
		pageChange: number;
		clear: void;
		retry: void;
	}>();

	function handleSearch(event: CustomEvent) {
		pageState.searchTerm = event.detail;
		dispatch('search', event.detail);
	}

	function handleFilter(event: CustomEvent) {
		pageState.selectedFilters = event.detail;
		dispatch('filter', event.detail);
	}

	function handleClear() {
		pageState.searchTerm = '';
		pageState.selectedFilters = [];
		dispatch('clear');
	}

	function handleSortChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		pageState.sortBy = target.value;
		dispatch('sort', target.value);
	}

	function handleViewChange(view: 'grid' | 'list' | 'calendar') {
		pageState.view = view;
		dispatch('viewChange', view);
	}

	function handlePageChange(page: number) {
		pageState.currentPage = page;
		dispatch('pageChange', page);
	}
</script>

<div class="data-page">
	<div class="page-header">
		<h1 class="page-title">{title}</h1>
		<div class="page-actions">
			<slot name="actions" />
		</div>
	</div>

	<!-- Поиск теперь в хедере -->

	{#if showViewToggle || showSort}
		<div class="page-controls">
			{#if showSort && sortOptions.length > 0}
				<div class="sort-control">
					<label for="sort-select" class="control-label">Сортировка:</label>
					<select 
						id="sort-select" 
						class="sort-select"
						value={pageState.sortBy}
						on:change={handleSortChange}
					>
						<option value="">По умолчанию</option>
						{#each sortOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>
			{/if}

			{#if showViewToggle}
				<div class="view-controls">
					<label class="control-label">Вид:</label>
					<div class="view-toggles">
						{#each viewOptions as option}
							<button
								type="button"
								class="view-toggle-btn {pageState.view === option.value ? 'active' : ''}"
								on:click={() => handleViewChange(option.value)}
								title={option.label}
							>
								{option.icon}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}

	{#if loading}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Загрузка...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<h2>Ошибка</h2>
			<p>{error}</p>
			<button class="btn btn-primary" on:click={() => dispatch('retry')}>
				Попробовать снова
			</button>
		</div>
	{:else}
		<div class="page-content">
			<slot {pageState} />
		</div>
	{/if}
</div>

<style>
	.data-page {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
		padding-top: calc(70px + 2rem);
		background: linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.3) 100%);
		min-height: 100vh;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		row-gap: 1rem;
		margin-bottom: 2rem;
		padding: 2rem;
		background: hsl(var(--card));
		border-radius: var(--radius);
		box-shadow: var(--shadow-md);
		border: 1px solid hsl(var(--border));
		position: relative;
		overflow: hidden;
	}

	.page-header::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, hsl(var(--primary)), hsl(262 83% 68%));
	}

	.page-title {
		margin: 0;
		font-size: 2.25rem;
		font-weight: 800;
		background: linear-gradient(135deg, hsl(var(--foreground)), hsl(var(--primary)));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		position: relative;
		z-index: 1;
	}

	.page-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	/* Поиск теперь в хедере */

	.page-controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: hsl(var(--card));
		border-radius: var(--radius);
		border: 1px solid hsl(var(--border));
		box-shadow: var(--shadow-md);
		backdrop-filter: blur(10px);
	}

	.sort-control,
	.view-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.control-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		white-space: nowrap;
	}

	.sort-select {
		padding: 0.75rem 1rem;
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		font-size: 0.875rem;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 200px;
	}

	.sort-select:focus {
		outline: none;
		border-color: hsl(var(--ring));
		box-shadow: 0 0 0 3px hsl(var(--ring) / 0.1);
	}

	.sort-select:hover {
		border-color: hsl(var(--ring));
	}

	.view-toggles {
		display: flex;
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		overflow: hidden;
		background: hsl(var(--muted));
		padding: 0.25rem;
		gap: 0.25rem;
	}

	.view-toggle-btn {
		background: transparent;
		border: none;
		padding: 0.75rem 1rem;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 3rem;
		border-radius: calc(var(--radius) - 0.25rem);
		color: hsl(var(--muted-foreground));
	}

	.view-toggle-btn:hover {
		background: hsl(var(--accent));
		color: hsl(var(--accent-foreground));
	}

	.view-toggle-btn.active {
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		box-shadow: var(--shadow-sm);
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 40vh;
		gap: 1rem;
		color: #6b7280;
		text-align: center;
	}

	.spinner {
		border: 4px solid #e5e7eb;
		border-top: 4px solid #6366f1;
		border-radius: 50%;
		width: 2.5rem;
		height: 2.5rem;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.error-container {
		text-align: center;
		padding: 2rem;
		color: #b91c1c;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 0.75rem;
	}

	.error-container h2 {
		margin: 0 0 1rem 0;
		color: #b91c1c;
	}

	.error-container p {
		margin: 0 0 1.5rem 0;
	}

	.page-content {
		min-height: 200px;
	}

	.btn {
		border: none;
		border-radius: 0.6rem;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.6rem 1.2rem;
	}

	.btn-primary {
		background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(262 83% 68%) 100%);
		color: hsl(var(--primary-foreground));
		box-shadow: var(--shadow-md);
		border: none;
		font-weight: 600;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
		background: linear-gradient(135deg, hsl(262 83% 68%) 0%, hsl(var(--primary)) 100%);
	}

	@media (max-width: 768px) {
		.data-page {
			padding: 1rem;
			padding-top: calc(70px + 1rem);
		}

		.page-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.page-actions {
			width: 100%;
			justify-content: space-between;
		}

		.page-controls {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.sort-control,
		.view-controls {
			justify-content: space-between;
		}
	}
</style>
