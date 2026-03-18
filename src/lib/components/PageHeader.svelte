<script lang="ts">
	export let title = '';
	export let showLanguageToggle = false;
	export let language = 'ru';
	export let onLanguageToggle = () => {};
	export let actions: Array<{
		text: string;
		onClick: () => void;
		variant?: string;
		icon?: string;
		disabled?: boolean;
	}> = [];
</script>

<div class="page-header">
	<h1 class="page-title">{title}</h1>
	<div class="page-actions">
		{#if showLanguageToggle}
			<button class="btn btn-secondary" on:click={onLanguageToggle}>
				{language === 'ru' ? 'KZ' : 'RU'}
			</button>
		{/if}
		
		{#each actions as action}
			<button 
				class="btn {action.variant || 'btn-primary'}" 
				on:click={action.onClick}
				disabled={action.disabled}
			>
				{#if action.icon}
					<span class="btn-icon">{action.icon}</span>
				{/if}
				{action.text}
			</button>
		{/each}
	</div>
</div>

<style>
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding: 1.15rem 1.25rem;
		border-bottom: 1px solid hsl(var(--border));
		background: var(--gradient-surface);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
	}

	.page-title {
		margin: 0;
		font-family: var(--font-display);
		color: hsl(var(--foreground));
		font-size: clamp(1.55rem, 2.8vw, 2rem);
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.page-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.btn-icon {
		font-size: 1.1rem;
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
	}
</style> 
