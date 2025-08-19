<script lang="ts">
  import { onMount } from 'svelte';
  import { apiClient } from '$lib/api/client';
  import { authStore } from '$lib/stores/auth';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  type Birthday = { id:number; nameRu:string; nameKz:string; birthday:string; imageUrl?:string|null };

  let birthdays: Birthday[] = [];
  let loading = false;
  let error = '';

  onMount(load);
  async function load(){
    if(!$authStore.schoolId) return;
    loading = true; error='';
    try{
      const response = await apiClient.getTeacherBirthdays($authStore.schoolId);
      birthdays = response as Birthday[];
    }catch(e){
      error = e instanceof Error ? e.message : 'Не удалось загрузить дни рождения';
    }finally{ loading=false; }
  }

  function formatDate(d:string){
    return new Date(d).toLocaleDateString('ru-RU', { day:'2-digit', month:'long' });
  }
</script>

<svelte:head>
  <title>Дни рождения учителей</title>
</svelte:head>

<div class="page">
  <div class="page-header">
    <h1 class="page-title">Дни рождения учителей</h1>
    <p class="page-subtitle">Ближайшие даты</p>
  </div>

  {#if loading}
    <div class="loading"><LoadingSpinner /><p>Загрузка…</p></div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if birthdays.length}
    <div class="grid">
      {#each birthdays.sort((a,b)=> new Date(a.birthday).getTime() - new Date(b.birthday).getTime()) as t}
        <a href={`/teachers/${t.id}`} class="card">
          <div class="avatar">
            {#if t.imageUrl}
              <img src={t.imageUrl} alt={t.nameRu} />
            {:else}
              <div class="ph">👤</div>
            {/if}
          </div>
          <div class="info">
            <div class="name">{t.nameRu}</div>
            <div class="date">{formatDate(t.birthday)}</div>
          </div>
        </a>
      {/each}
    </div>
  {:else}
    <div class="empty">Дней рождения пока нет</div>
  {/if}
</div>

<style>
  .page{ 
    max-width:1210px; 
    margin:0 auto; 
    padding:1.5rem; 
  }

  /* Стили для заголовка страницы */
  .page-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid hsl(var(--border));
  }

  .page-title {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    font-weight: 800;
    color: hsl(var(--foreground));
    line-height: 1.2;
  }

  .page-subtitle {
    margin: 0;
    font-size: 1.125rem;
    color: hsl(var(--muted-foreground));
    line-height: 1.5;
  }

  .loading{ 
    min-height: 30vh; 
    display:flex; 
    flex-direction:column; 
    gap:.75rem; 
    align-items:center; 
    justify-content:center; 
    color:hsl(var(--muted-foreground)); 
  }

  .grid{ 
    display:grid; 
    grid-template-columns: repeat(auto-fit, minmax(240px,1fr)); 
    gap:1rem; 
  }
  
  .card{ 
    display:flex; 
    gap:.75rem; 
    padding:1rem; 
    text-decoration:none; 
    background:hsl(var(--card)); 
    border:1px solid hsl(var(--border)); 
    border-radius:12px; 
    box-shadow: var(--shadow-sm); 
    align-items:center; 
    transition: transform .2s ease, box-shadow .2s ease; 
  }
  
  .card:hover{ 
    transform: translateY(-2px); 
    box-shadow: var(--shadow-md); 
    border-color: hsl(var(--ring)); 
  }
  
  .avatar{ 
    width:64px; 
    height:64px; 
    border-radius:10px; 
    overflow:hidden; 
    border:1px solid hsl(var(--border)); 
    background:hsl(var(--background)); 
    display:flex; 
    align-items:center; 
    justify-content:center; 
  }
  
  .avatar img{ 
    width:100%; 
    height:100%; 
    object-fit:cover; 
  }
  
  .ph{ 
    font-size:1.5rem; 
  }
  
  .name{ 
    color:hsl(var(--foreground)); 
    font-weight:700; 
    font-size: 1.125rem;
    margin-bottom: 0.25rem;
  }
  
  .date{ 
    color:hsl(var(--muted-foreground)); 
    font-size: 0.875rem;
  }
  
  .empty{ 
    color:hsl(var(--muted-foreground)); 
    text-align: center;
    padding: 2rem;
    font-size: 1.125rem;
  }

  /* Темная тема */
  :global(.dark) .page-title {
    color: var(--text-primary);
  }

  :global(.dark) .page-subtitle {
    color: var(--text-secondary);
  }

  :global(.dark) .name {
    color: var(--text-primary);
  }

  :global(.dark) .date {
    color: var(--text-secondary);
  }

  :global(.dark) .empty {
    color: var(--text-secondary);
  }
</style>


