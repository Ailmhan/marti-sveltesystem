<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	export let placeholder = 'Поиск...';
	export let filters: any[] = [];
	export let searchTerm = '';
	export let selectedFilters: string[] = [];

	const dispatch = createEventDispatcher<{
		search: string;
		filter: string[];
		clear: void;
	}>();

	function handleSearch() {
		dispatch('search', searchTerm);
	}

	function handleFilterChange(filterValue: string) {
		const index = selectedFilters.indexOf(filterValue);
		if (index > -1) {
			selectedFilters = selectedFilters.filter(f => f !== filterValue);
		} else {
			selectedFilters = [...selectedFilters, filterValue];
		}
		dispatch('filter', selectedFilters);
	}

	function clearAll() {
		searchTerm = '';
		selectedFilters = [];
		dispatch('clear');
	}

	// Debounced search
	let searchTimeout: ReturnType<typeof setTimeout>;
	$: if (searchTerm !== undefined) {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			handleSearch();
		}, 300);
	}
</script>

<div class="search-filter-container">
	<div class="search-section">
		<div class="search-input-wrapper">
			<input
				type="text"
				bind:value={searchTerm}
				{placeholder}
				class="search-input"
			/>
			{#if searchTerm}
				<button 
					type="button" 
					class="clear-search-btn"
					on:click={() => searchTerm = ''}
					aria-label="Очистить поиск"
				>
					✕
				</button>
			{/if}
		</div>
	</div>

	{#if filters.length > 0}
		<div class="filters-section">
			<div class="filters-header">
				<h4>Фильтры</h4>
				{#if selectedFilters.length > 0}
					<button 
						type="button" 
						class="clear-filters-btn"
						on:click={clearAll}
					>
						Очистить все
					</button>
				{/if}
			</div>
			<div class="filters-grid">
				{#each filters as filter}
					<label class="filter-item">
						<input
							type="checkbox"
							value={filter.value}
							checked={selectedFilters.includes(filter.value)}
							on:change={() => handleFilterChange(filter.value)}
						/>
						<span class="filter-label">{filter.label}</span>
						{#if filter.count !== undefined}
							<span class="filter-count">({filter.count})</span>
						{/if}
					</label>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.search-filter-container {
		background: white;
		border-radius: 0.75rem;
		padding: 1.5rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e7eb;
		margin-bottom: 2rem;
	}

	.search-section {
		margin-bottom: 1.5rem;
	}

	.search-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-input {
		width: 100%;
		padding: 0.75rem 1rem;
		padding-right: 2.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		background: #f9fafb;
		transition: all 0.2s ease;
	}

	.search-input:focus {
		outline: none;
		border-color: #6366f1;
		background: white;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.clear-search-btn {
		position: absolute;
		right: 0.75rem;
		background: none;
		border: none;
		color: #6b7280;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 0.25rem;
		transition: color 0.2s ease;
	}

	.clear-search-btn:hover {
		color: #374151;
	}

	.filters-section {
		border-top: 1px solid #e5e7eb;
		padding-top: 1.5rem;
	}

	.filters-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.filters-header h4 {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
	}

	.clear-filters-btn {
		background: none;
		border: none;
		color: #6366f1;
		font-size: 0.75rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		transition: background-color 0.2s ease;
	}

	.clear-filters-btn:hover {
		background-color: #f3f4f6;
	}

	.filters-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 0.75rem;
	}

	.filter-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.375rem;
		transition: background-color 0.2s ease;
	}

	.filter-item:hover {
		background-color: #f9fafb;
	}

	.filter-item input[type="checkbox"] {
		margin: 0;
		accent-color: #6366f1;
	}

	.filter-label {
		font-size: 0.875rem;
		color: #374151;
		flex: 1;
	}

	.filter-count {
		font-size: 0.75rem;
		color: #6b7280;
		background: #f3f4f6;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
	}

	@media (max-width: 768px) {
		.search-filter-container {
			padding: 1rem;
		}

		.filters-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
