<script lang="ts">
  import { onMount } from 'svelte';
  import { apiClient } from '$lib/api/client';
  import { authStore } from '$lib/stores/auth';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  type Birthday = { id:number; nameRu:string; nameKz:string; birthday:string; imageUrl?:string|null };

  let birthdays: any[] = [];
  let loading = false;
  let error = '';

  onMount(load);
  async function load(){
    if(!$authStore.schoolId) return;
    loading = true; error='';
    try{
      console.log('🎂 Loading teacher birthdays for school:', $authStore.schoolId);
      const response = await fetch(`https://walrus-app-fioy4.ondigitalocean.app/api/teachers/birthdays/school/${$authStore.schoolId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      birthdays = await response.json();
      console.log('🎂 Birthdays loaded:', birthdays.length);
    }catch(e){
      console.error('❌ Error loading birthdays:', e);
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
  <div class="header">
    <h1>Дни рождения учителей</h1>
    <p class="subtitle">Ближайшие даты</p>
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
  .page{ max-width:1210px; margin:0 auto; padding:1.5rem; }
  .header{ margin-bottom:1rem; }
  .header h1{ margin:0 0 .25rem; font-size:1.75rem; }
  .subtitle{ color:hsl(var(--muted-foreground)); margin:0; }

  .loading{ min-height: 30vh; display:flex; flex-direction:column; gap:.75rem; align-items:center; justify-content:center; color:hsl(var(--muted-foreground)); }

  .grid{ display:grid; grid-template-columns: repeat(auto-fit, minmax(240px,1fr)); gap:1rem; }
  .card{ display:flex; gap:.75rem; padding:.75rem; text-decoration:none; background:hsl(var(--card)); border:1px solid hsl(var(--border)); border-radius:12px; box-shadow: var(--shadow-sm); align-items:center; transition: transform .2s ease, box-shadow .2s ease; }
  .card:hover{ transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: hsl(var(--ring)); }
  .avatar{ width:64px; height:64px; border-radius:10px; overflow:hidden; border:1px solid hsl(var(--border)); background:hsl(var(--background)); display:flex; align-items:center; justify-content:center; }
  .avatar img{ width:100%; height:100%; object-fit:cover; }
  .ph{ font-size:1.5rem; }
  .name{ color:hsl(var(--foreground)); font-weight:700; }
  .date{ color:hsl(var(--muted-foreground)); }
  .empty{ color:hsl(var(--muted-foreground)); }
</style>


