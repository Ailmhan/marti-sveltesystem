<script lang="ts">
	import { createEventDispatcher } from 'svelte';

  export let placeholder = 'Поиск...';
  export let value = '';
  export let disabled = false;
  export let compact = false; // мобильный режим: свёрнут в иконку

	const dispatch = createEventDispatcher<{
		search: string;
		clear: void;
	}>();

  let searchTimeout: ReturnType<typeof setTimeout>;
  let expanded = false; // для compact

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		
		// Debounced search
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			dispatch('search', value);
		}, 300);
	}

	function handleClear() {
		value = '';
		dispatch('clear');
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			dispatch('search', value);
		}
	}
</script>

{#if compact}
  <div class="header-search compact">
    <button class="compact-btn" type="button" aria-label="Открыть поиск" on:click={() => (expanded = true)}>🔍</button>
    {#if expanded}
      <div class="mobile-search-overlay" role="dialog" aria-modal="true" tabindex="-1" on:click={() => (expanded = false)} on:keydown={(e: KeyboardEvent) => { if (e.key === 'Escape') expanded = false; }}>
        <section class="mobile-search-panel" role="document" on:click|stopPropagation>
          <div class="search-input-wrapper">
            <div class="search-icon">🔍</div>
            <input
              type="search"
              bind:value={value}
              {placeholder}
              {disabled}
              class="search-input"
              class:disabled={disabled}
              on:input={handleInput}
              on:keydown={handleKeyDown}
              aria-label="Поиск по системе"
              autocomplete="off"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              inputmode="search"
              enterkeyhint="search"
              
            />
            {#if value}
              <button type="button" class="clear-btn" on:click={handleClear} aria-label="Очистить поиск">✕</button>
            {/if}
            <button type="button" class="close-btn" aria-label="Закрыть поиск" on:click={() => (expanded = false)}>✕</button>
          </div>
        </section>
      </div>
    {/if}
  </div>
{:else}
  <div class="header-search">
    <div class="search-input-wrapper">
      <div class="search-icon">🔍</div>
      <input
        type="search"
        bind:value={value}
        {placeholder}
        {disabled}
        class="search-input"
        class:disabled={disabled}
        on:input={handleInput}
        on:keydown={handleKeyDown}
        aria-label="Поиск по системе"
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        inputmode="search"
        enterkeyhint="search"
      />
      {#if value}
        <button type="button" class="clear-btn" on:click={handleClear} aria-label="Очистить поиск">✕</button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .header-search { position: relative; }
  .header-search.compact { display: inline-flex; }

	.search-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		background: linear-gradient(135deg, hsl(var(--card) / 0.9) 0%, hsl(var(--muted) / 0.3) 100%);
		border: 1px solid hsl(var(--border) / 0.5);
		border-radius: var(--radius);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		backdrop-filter: blur(15px);
		box-shadow: 
			var(--shadow-sm),
			inset 0 1px 0 hsl(var(--background) / 0.8);
		overflow: hidden;
	}

	.search-input-wrapper::before {
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

	.search-input-wrapper:focus-within {
		border-color: hsl(var(--ring));
		box-shadow: 
			var(--shadow-lg),
			0 0 0 3px hsl(var(--ring) / 0.1),
			inset 0 1px 0 hsl(var(--background) / 0.9);
		transform: translateY(-2px);
	}

	.search-input-wrapper:focus-within::before {
		opacity: 1;
	}

	.search-icon {
		padding: 0.75rem 1rem;
		color: hsl(var(--muted-foreground));
		font-size: 1rem;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.search-input-wrapper:focus-within .search-icon {
		color: hsl(var(--primary));
		transform: scale(1.1);
	}

    .search-input {
        flex: 1;
        border: none;
        outline: none;
        padding: 0.75rem 1rem;
        font-size: 0.95rem;
        background: transparent;
        color: hsl(var(--foreground));
        min-width: 200px;
        font-weight: 500;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
    }

	.search-input::placeholder {
		color: hsl(var(--muted-foreground));
		font-weight: 400;
	}

	.search-input.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.clear-btn {
		background: none;
		border: none;
		padding: 0.75rem;
		color: hsl(var(--muted-foreground));
		cursor: pointer;
		border-radius: var(--radius);
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.clear-btn:hover {
		background: hsl(var(--accent));
		color: hsl(var(--accent-foreground));
		transform: scale(1.1);
		box-shadow: var(--shadow-sm);
	}

	.clear-btn:active {
		transform: scale(0.95);
	}

  /* Compact mode */
  .compact-btn {
    width: 40px; height: 40px;
    border-radius: var(--radius);
    border: 1px solid hsl(var(--border));
    background: hsl(var(--card));
    color: hsl(var(--foreground));
    display: inline-flex; align-items: center; justify-content: center;
    box-shadow: var(--shadow-sm);
  }

  .mobile-search-overlay {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(4px);
    display: flex; align-items: flex-start; justify-content: center;
    padding: 10px;
  }
  .mobile-search-panel { width: 100%; max-width: 700px; }
  .mobile-search-panel .search-input-wrapper { border-radius: 12px; }
  .close-btn { background: none; border: none; padding: 0.75rem; color: hsl(var(--muted-foreground)); }

    @media (max-width: 768px) {
    .search-input { min-width: 0; }
    .search-input-wrapper { padding-right: 0.25rem; }
    .clear-btn { padding: 0.5rem; }
    }
</style>
