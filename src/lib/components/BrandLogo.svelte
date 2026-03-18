<script lang="ts">
  export let imageUrl: string | undefined;
  export let emblemUrl: string | undefined;
  export let alt = 'Логотип школы';
  export let size = 44;
  export let compact = false;

  $: src = emblemUrl || imageUrl || '';
  $: initial = alt.trim().charAt(0).toUpperCase() || 'M';
</script>

<div class="brand-mark {compact ? 'compact' : ''}" style={`width:${size}px;height:${size}px;`} aria-hidden="true">
  {#if src}
    <img src={src} alt={alt} loading="lazy" />
  {:else}
    <span>{initial}</span>
  {/if}
</div>

<style>
  .brand-mark {
    position: relative;
    border-radius: 14px;
    display: grid;
    place-items: center;
    overflow: hidden;
    background:
      radial-gradient(circle at 16% 14%, hsl(var(--brand-accent) / 0.6), transparent 40%),
      linear-gradient(140deg, hsl(var(--brand-primary) / 0.92), hsl(var(--brand-accent) / 0.95));
    color: hsl(var(--primary-foreground));
    border: 1px solid hsl(var(--border));
    box-shadow: var(--shadow-md);
  }

  .brand-mark::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(120deg, transparent 30%, rgb(255 255 255 / 0.26), transparent 70%);
    transform: translateX(-120%);
    transition: transform 380ms ease;
  }

  .brand-mark:hover::after {
    transform: translateX(120%);
  }

  .brand-mark.compact {
    border-radius: 10px;
  }

  .brand-mark img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
  }

  .brand-mark span {
    font-family: var(--font-display);
    font-weight: 700;
    letter-spacing: -0.03em;
    font-size: clamp(0.85rem, 2.4vw, 1.05rem);
  }
</style>
