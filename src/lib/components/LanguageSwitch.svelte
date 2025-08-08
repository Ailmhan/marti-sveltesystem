<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let language: 'ru' | 'kz' = 'ru';
	export let disabled = false;

	const dispatch = createEventDispatcher<{
		change: 'ru' | 'kz';
	}>();

	function toggleLanguage() {
		if (disabled) return;
		
		const newLanguage = language === 'ru' ? 'kz' : 'ru';
		language = newLanguage;
		dispatch('change', newLanguage);
	}
</script>

<button
	type="button"
	class="language-switch"
	class:disabled={disabled}
	on:click={toggleLanguage}
	aria-label="Переключить язык"
>
	<div class="switch-track" class:active={language === 'kz'}>
		<div class="switch-thumb" class:active={language === 'kz'} />
	</div>
	<div class="language-labels">
		<span class="label ru" class:active={language === 'ru'}>RU</span>
		<span class="label kz" class:active={language === 'kz'}>KZ</span>
	</div>
</button>

<style>
	.language-switch {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: linear-gradient(135deg, hsl(var(--card) / 0.9) 0%, hsl(var(--muted) / 0.3) 100%);
		border: 1px solid hsl(var(--border) / 0.5);
		cursor: pointer;
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 
			var(--shadow-sm),
			inset 0 1px 0 hsl(var(--background) / 0.8);
		backdrop-filter: blur(15px);
		position: relative;
		overflow: hidden;
	}

	.language-switch::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), transparent);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.language-switch:hover:not(.disabled) {
		border-color: hsl(var(--ring));
		box-shadow: 
			var(--shadow-lg),
			inset 0 1px 0 hsl(var(--background) / 0.9);
		transform: translateY(-2px);
	}

	.language-switch:hover:not(.disabled)::before {
		opacity: 1;
	}

	.language-switch.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.switch-track {
		position: relative;
		width: 3.5rem;
		height: 1.75rem;
		background: hsl(var(--muted));
		border-radius: 1rem;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border: 1px solid hsl(var(--border));
	}

	.switch-track.active {
		background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(262 83% 68%) 100%);
		border-color: hsl(var(--primary));
	}

	.switch-thumb {
		position: absolute;
		top: 0.125rem;
		left: 0.125rem;
		width: 1.5rem;
		height: 1.5rem;
		background: white;
		border-radius: 50%;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: var(--shadow-md);
		border: 1px solid hsl(var(--border));
	}

	.switch-thumb.active {
		transform: translateX(1.75rem);
	}

	.language-labels {
		display: flex;
		gap: 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.label {
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		transition: all 0.2s ease;
	}

	.label.ru {
		color: #6b7280;
	}

	.label.ru.active {
		color: #6366f1;
		background: rgba(99, 102, 241, 0.1);
	}

	.label.kz {
		color: #6b7280;
	}

	.label.kz.active {
		color: #6366f1;
		background: rgba(99, 102, 241, 0.1);
	}
</style>
