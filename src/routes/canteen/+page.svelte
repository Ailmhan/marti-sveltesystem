<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import type { CanteenMenu } from '$lib/types/api';
	import { format } from 'date-fns';
	import { ru, kk } from 'date-fns/locale';
	import DataCard from '$lib/components/DataCard.svelte';

	let menus: CanteenMenu[] = [];
	let loading = true;
	let error = '';
	let language: 'ru' | 'kz' = 'ru';

	onMount(async () => {
		try {
			const school = await apiClient.getMe();
			menus = await apiClient.getCanteenMenu(school.id, language);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка загрузки меню';
		} finally {
			loading = false;
		}
	});

	async function toggleLanguage() {
		language = language === 'ru' ? 'kz' : 'ru';
		loading = true;
		error = '';

		try {
			const school = await apiClient.getMe();
			menus = await apiClient.getCanteenMenu(school.id, language);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка загрузки меню';
		} finally {
			loading = false;
		}
	}

	function formatDate(date: Date | string) {
		return format(new Date(date), 'dd MMMM yyyy', {
			locale: language === 'ru' ? ru : kk
		});
	}
</script>

<svelte:head>
	<title>Столовая - Школьная система</title>
</svelte:head>

<div class="canteen-page">
	<div class="page-header">
		<h1>Меню столовой</h1>
		<div class="page-actions">
			<button class="btn btn-secondary" on:click={toggleLanguage}>
				{language === 'ru' ? 'KZ' : 'RU'}
			</button>
			<a href="/canteen/create" class="btn btn-primary">Добавить меню</a>
		</div>
	</div>

	{#if loading}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Загрузка меню...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<h2>Ошибка</h2>
			<p>{error}</p>
		</div>
	{:else if menus.length > 0}
		<div class="grid-container grid-2">
			{#each menus as menu}
				<DataCard
					data={menu}
					type="menu"
					{language}
					showActions={true}
					onEdit={() => console.log('Edit menu:', menu.id)}
					onDelete={() => console.log('Delete menu:', menu.id)}
				/>
			{/each}
		</div>
	{:else}
		<div class="empty-state">
			<h2>Меню пока нет</h2>
			<p>Добавьте первое меню в систему!</p>
			<a href="/canteen/create" class="btn btn-primary">Добавить меню</a>
		</div>
	{/if}
</div>

<style>
	.canteen-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		padding-top: calc(70px + 2rem);
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #eee;
	}

	.page-header h1 {
		margin: 0;
		color: #333;
		font-size: 2rem;
	}

	.page-actions {
		display: flex;
		gap: 0.5rem;
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		gap: 1rem;
	}

	.error-container {
		text-align: center;
		padding: 2rem;
	}

	.menu-card {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.menu-image {
		width: 100%;
		height: 200px;
		overflow: hidden;
		border-radius: 8px 8px 0 0;
		margin: -1.5rem -1.5rem 1rem -1.5rem;
	}

	.menu-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.menu-content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.menu-date h3 {
		margin: 0 0 1rem 0;
		color: #007bff;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.menu-meals {
		flex: 1;
	}

	.meal-item {
		margin-bottom: 1rem;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 6px;
		border-left: 4px solid #28a745;
	}

	.meal-item h4 {
		margin: 0 0 0.5rem 0;
		color: #333;
		font-size: 1rem;
		font-weight: 600;
	}

	.meal-item p {
		margin: 0;
		color: #666;
		line-height: 1.4;
	}

	.menu-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #eee;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
	}

	.empty-state h2 {
		margin: 0 0 1rem 0;
		color: #333;
	}

	.empty-state p {
		margin: 0 0 2rem 0;
		color: #666;
	}

	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.page-actions {
			justify-content: center;
		}

		.menu-actions {
			flex-direction: column;
		}
	}
</style> 