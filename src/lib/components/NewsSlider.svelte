<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { languageStore } from '$lib/stores/language';
  import type { News } from '$lib/types/api';

  export let news: News[] = [];
  export let autoPlayMs: number = 5000;

  let pageIndex = 0;
  let timer: number | null = null;
  let hovering = false;
  let perView = 3;

  const hasSlides = () => news && news.length > 0;

  function updatePerView() {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    perView = w < 640 ? 1 : w < 1024 ? 2 : 3;
    // clamp page if needed
    if (totalPages > 0 && pageIndex >= totalPages) pageIndex = totalPages - 1;
  }

  function next() {
    if (!hasSlides()) return;
    pageIndex = (pageIndex + 1) % totalPages;
  }

  function prev() {
    if (!hasSlides()) return;
    pageIndex = (pageIndex - 1 + totalPages) % totalPages;
  }

  function goTo(i: number) {
    if (!hasSlides()) return;
    pageIndex = i % totalPages;
  }

  function start() {
    stop();
    if (autoPlayMs > 0) {
      timer = window.setInterval(() => {
        if (!hovering) next();
      }, autoPlayMs);
    }
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  onMount(() => {
    updatePerView();
    start();
    window.addEventListener('resize', updatePerView);
  });
  onDestroy(stop);
  onDestroy(() => window.removeEventListener('resize', updatePerView));

  function formatDate(date: string | Date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  $: slides = news?.map((n) => ({
    id: n.id,
    title: $languageStore === 'ru' ? n.titleRu : n.titleKz,
    content: $languageStore === 'ru' ? n.contentRu : n.contentKz,
    imageUrl: n.imageUrl,
    createdAt: n.createdAt
  })) ?? [];
  $: totalPages = Math.max(1, Math.ceil((slides?.length ?? 0) / perView));
</script>

{#if hasSlides()}
<div class="news-slider" role="region" aria-label="Слайдер новостей" on:mouseenter={() => (hovering = true)} on:mouseleave={() => (hovering = false)}>
  <div class="slides" style={`--per: ${perView}; transform: translateX(-${pageIndex * 100}%); width: calc(${totalPages} * 100%);`}>
    {#each slides as s (s.id)}
      <div class="slide">
        {#if s.imageUrl}
          <img class="slide-bg" src={s.imageUrl} alt={s.title} />
        {:else}
          <div class="slide-bg placeholder"></div>
        {/if}
        <div class="slide-overlay"></div>
        <div class="slide-content">
          <div class="slide-badge">📰 Новости</div>
          <h3 class="slide-title">{s.title}</h3>
          {#if s.content}
            <p class="slide-desc">{s.content.length > 160 ? s.content.slice(0, 160) + '…' : s.content}</p>
          {/if}
          <div class="slide-footer">
            <span class="slide-date">{formatDate(s.createdAt)}</span>
            <a class="slide-link" href="/news">Читать все</a>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Controls -->
  <button class="nav prev" type="button" aria-label="Предыдущая новость" on:click={prev}>❮</button>
  <button class="nav next" type="button" aria-label="Следующая новость" on:click={next}>❯</button>

  <!-- Dots -->
  <div class="dots">
    {#each Array(totalPages) as _, i}
      <button class={`dot ${i === pageIndex ? 'active' : ''}`} aria-label={`Страница ${i + 1}`} on:click={() => goTo(i)}></button>
    {/each}
  </div>
</div>
{/if}

<style>
  .news-slider {
    position: relative;
    width: 100%;
    border-radius: 16px;
    overflow: hidden;
    border: none;
    box-shadow: var(--shadow-md);
    background: transparent;
    height: 340px;
  }

  .slides {
    display: flex;
    height: 100%;
    transition: transform 500ms ease;
    will-change: transform;
  }

  .slide {
    position: relative;
    flex: 0 0 calc(100% / var(--per));
    height: 100%;
  }

  .slide-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .slide-bg.placeholder {
    background: linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--accent)) 100%);
  }

  .slide-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.6) 100%);
  }

  .slide-content {
    position: relative;
    z-index: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 1.25rem 1.5rem;
    color: white;
    gap: 0.5rem;
  }

  .slide-badge {
    align-self: flex-start;
    background: rgba(255,255,255,0.14);
    border: 1px solid rgba(255,255,255,0.25);
    padding: 0.35rem 0.65rem;
    border-radius: 9999px;
    font-weight: 600;
    font-size: 0.8rem;
    backdrop-filter: blur(6px);
    margin-bottom: 0.25rem;
  }

  .slide-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 800;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  }

  .slide-desc {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.45;
    opacity: 0.95;
  }

  .slide-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
  }

  .slide-date {
    font-size: 0.85rem;
    opacity: 0.9;
  }

  .slide-link {
    color: white;
    text-decoration: none;
    font-weight: 700;
    border: 1px solid rgba(255,255,255,0.4);
    padding: 0.5rem 0.8rem;
    border-radius: 9999px;
    backdrop-filter: blur(6px);
    transition: all 0.2s ease;
  }

  .slide-link:hover { background: rgba(255,255,255,0.15); }

  .nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px; height: 40px;
    border-radius: 9999px;
    border: 1px solid hsl(var(--border));
    background: hsl(var(--card));
    color: hsl(var(--foreground));
    display: inline-flex;
    align-items: center; justify-content: center;
    box-shadow: var(--shadow-sm);
    transition: all 0.2s ease;
  }

  .nav:hover { background: hsl(var(--accent)); box-shadow: var(--shadow-md); }
  .nav.prev { left: 10px; }
  .nav.next { right: 10px; }

  .dots {
    position: absolute;
    bottom: 10px; left: 0; right: 0;
    display: flex;
    justify-content: center;
    gap: 6px;
  }

  .dot {
    width: 8px; height: 8px;
    border-radius: 9999px;
    background: rgba(255,255,255,0.4);
    border: none;
    padding: 0;
    cursor: pointer;
    transition: transform 0.15s ease, background 0.15s ease;
  }

  .dot.active { background: white; transform: scale(1.15); }

  @media (max-width: 768px) {
    .news-slider { height: 300px; }
    .slide-title { font-size: 1.25rem; }
    .slide-desc { display: none; }
  }
</style>


