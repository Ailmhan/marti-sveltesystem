<script lang="ts">
	export let error = '';
	export let title = 'Ошибка';
	export let className = '';
</script>

{#if error}
	<div class="error-container {className}">
		<h2 class="error-title">{title}</h2>
		<p class="error-message">{error}</p>
	</div>
{/if}

<style>
	.error-container {
		background-color: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 0.5rem;
		padding: 1rem;
		margin-bottom: 2rem;
		text-align: center;
	}

	.error-title {
		color: #dc2626;
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
	}

	.error-message {
		color: #dc2626;
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.5;
	}
</style> 