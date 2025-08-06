<script lang="ts">
	export let size = 'md';
	export let text = '';
	export let className = '';
	
	$: sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
	$: textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base';
</script>

<div class="loading-spinner-container {className}">
	<div class="spinner {sizeClass}"></div>
	{#if text}
		<p class="loading-text {textSize}">{text}</p>
	{/if}
</div>

<style>
	.loading-spinner-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}
	
	.spinner {
		border: 2px solid #e5e7eb;
		border-top: 2px solid #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	
	.loading-text {
		color: #6b7280;
		margin: 0;
		text-align: center;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style> 