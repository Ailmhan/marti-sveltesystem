<script lang="ts">
	export let title: string;
	export let description: string;
	export let icon: string;
	export let buttonText: string;
	export let onAction: () => void;
</script>

<div class="empty-state">
	<div class="empty-icon">
		{icon}
	</div>
	<h2 class="empty-title">{title}</h2>
	<p class="empty-description">{description}</p>
	<button class="btn btn-primary add-btn" on:click={onAction}>
		<span class="btn-icon">➕</span>
		{buttonText}
	</button>
</div>

<style>
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		max-width: 400px;
		margin: 0 auto;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1.5rem;
		opacity: 0.6;
	}

	.empty-title {
		margin: 0 0 1rem 0;
		color: var(--text-primary);
		font-size: 1.5rem;
		font-weight: 600;
	}

	.empty-description {
		margin: 0 0 2rem 0;
		color: var(--text-secondary);
		line-height: 1.5;
	}

	.add-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		border-radius: 8px;
		color: white;
		font-weight: 600;
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
		cursor: pointer;
	}

	.add-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
	}

	.btn-icon {
		font-size: 1.1rem;
	}
</style> 