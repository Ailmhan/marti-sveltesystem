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
		padding-bottom: 1rem;
		border-bottom: 2px solid #eee;
	}

	.page-title {
		margin: 0;
		color: #1f2937;
		font-size: 2rem;
		font-weight: bold;
	}

	.page-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.btn {
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		border: none;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn-secondary {
		background-color: #f3f4f6;
		color: #374151;
	}

	.btn-secondary:hover {
		background-color: #e5e7eb;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
	}

	.btn-primary:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
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