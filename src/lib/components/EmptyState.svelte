<script lang="ts">
	export let title: string;
	export let description: string;
	export let icon: string;
	export let buttonText: string;
	export let onAction: () => void;
	export let showButton: boolean = true;
</script>

	<div class="empty-state">
		<div class="empty-icon">
			{icon}
		</div>
		<h2 class="empty-title">{title}</h2>
		<p class="empty-description">{description}</p>
		{#if showButton}
			<button class="btn btn-primary add-btn" on:click={onAction}>
				<span class="btn-icon">➕</span>
				{buttonText}
			</button>
		{/if}
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
		color: #1f2937;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.empty-description {
		margin: 0 0 2rem 0;
		color: #6b7280;
		line-height: 1.5;
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
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
	}

	.add-btn {
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	}

	.add-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
	}

	.btn-icon {
		font-size: 1.2rem;
		margin-right: 0.5rem;
	}
</style> 