<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { apiClient } from '$lib/api/client';
  import { languageStore } from '$lib/stores/language';
  import type { News } from '$lib/types/api';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let news: News | null = null;
  let loading = false;
  let error = '';

  $: id = Number($page.params.id);

  onMount(load);
  async function load() {
    loading = true; error='';
    try {
      news = await apiClient.getNewsById(id);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Ошибка загрузки новости';
    } finally {
      loading = false;
    }
  }

  function formatDate(date: string | Date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ru-RU', { year:'numeric', month:'long', day:'numeric' });
  }
</script>

<svelte:head>
  <title>{news ? (news.titleRu || news.titleKz) : 'Новость'} — детали</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="news-page">
  {#if loading}
    <div class="loading">
      <LoadingSpinner />
      <p>Загрузка новости…</p>
    </div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if news}
    <article class="news-article">
      {#if news.imageUrl}
        <div class="hero">
          <img src={news.imageUrl} alt={news.titleRu || news.titleKz} />
          <div class="hero-overlay"></div>
          <div class="hero-text">
            <h1>{($languageStore === 'ru' ? news.titleRu : news.titleKz) || news.titleRu}</h1>
            <div class="meta">{formatDate(news.createdAt)}</div>
          </div>
        </div>
      {/if}

      <div class="content">
        <a class="back" href="/news">← Ко всем новостям</a>
        <div class="prose">
          {#if $languageStore === 'ru'}
            {@html (news.contentRu || '').replace(/\n/g,'<br/>')}
          {:else}
            {@html (news.contentKz || '').replace(/\n/g,'<br/>')}
          {/if}
        </div>
      </div>
    </article>
  {/if}
</div>

<style>
  .news-page{ max-width: 1210px; margin:0 auto; padding: 1rem; }
  .loading{ min-height: 40vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.75rem; color:hsl(var(--muted-foreground)); }

  .news-article{ border:1px solid hsl(var(--border)); border-radius:16px; overflow:hidden; box-shadow: var(--shadow-md); background:hsl(var(--card)); }
  .hero{ position:relative; height: 360px; background:hsl(var(--muted)); }
  .hero img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .hero-overlay{ position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.55)); }
  .hero-text{ position:absolute; left:0; right:0; bottom:0; padding: 1rem 1.25rem; color:white; }
  .hero-text h1{ margin:0 0 .25rem; font-size: 1.75rem; font-weight:800; text-shadow:0 2px 6px rgba(0,0,0,.5); }
  .meta{ opacity:.9; }

  .content{ padding: 1.25rem; }
  .back{ display:inline-block; margin-bottom:.75rem; color:hsl(var(--primary)); text-decoration:none; font-weight:600; }
  .back:hover{ text-decoration: underline; }
  .prose{ color:hsl(var(--foreground)); line-height:1.7; }
</style>


