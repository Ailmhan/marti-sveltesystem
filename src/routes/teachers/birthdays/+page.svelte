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
        <a href={`/teachers/${t.id}`} class="birthday-card">
          <div class="card-header">
            <div class="birthday-icon">🎂</div>
            <div class="days-until">
              {#if new Date(t.birthday).toDateString() === new Date().toDateString()}
                <span class="today">Сегодня!</span>
              {:else}
                <span class="upcoming">{formatDate(t.birthday)}</span>
              {/if}
            </div>
          </div>
          
          <div class="teacher-info">
            <div class="avatar">
              {#if t.imageUrl}
                <img src={t.imageUrl} alt={t.nameRu} />
              {:else}
                <div class="ph">👤</div>
              {/if}
            </div>
            <div class="details">
              <div class="name">{t.nameRu}</div>
              <div class="school-info">{t.School?.nameRu || 'Школа'}</div>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {:else}
    <div class="empty-state">
      <div class="empty-icon">🎂</div>
      <h3 class="empty-title">Дни рождения не найдены</h3>
      <p class="empty-description">В текущем период нет дней рождения учителей</p>
    </div>
  {/if}
</div>

<style>
  .page{ max-width:1210px; margin:0 auto; padding:1.5rem; }
  .header{ margin-bottom:1rem; }
  .header h1{ margin:0 0 .25rem; font-size:1.75rem; }
  .subtitle{ color:hsl(var(--muted-foreground)); margin:0; }

  .loading{ min-height: 30vh; display:flex; flex-direction:column; gap:.75rem; align-items:center; justify-content:center; color:hsl(var(--muted-foreground)); }

  .grid{ display:grid; grid-template-columns: repeat(auto-fit, minmax(320px,1fr)); gap:1.5rem; }
  
  .birthday-card{ 
    display:flex; 
    flex-direction:column;
    gap:1rem; 
    padding:1.5rem; 
    text-decoration:none; 
    background:hsl(var(--card)); 
    border:1px solid hsl(var(--border)); 
    border-radius:16px; 
    box-shadow: 0 2px 8px rgba(0,0,0,0.04); 
    transition: all 0.3s ease; 
    position:relative;
    overflow:hidden;
  }
  .birthday-card:hover{ 
    transform: translateY(-4px); 
    box-shadow: 0 8px 25px rgba(0,0,0,0.1); 
    border-color: hsl(var(--primary) / 0.3); 
  }
  
  .card-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:0.5rem;
  }
  
  .birthday-icon{
    font-size:2rem;
    animation: bounce 2s infinite;
  }
  
  .days-until .today{
    background:hsl(var(--destructive));
    color:white;
    padding:0.25rem 0.75rem;
    border-radius:20px;
    font-size:0.875rem;
    font-weight:600;
    animation: glow 1.5s ease-in-out infinite alternate;
  }
  
  .days-until .upcoming{
    background:hsl(var(--primary) / 0.1);
    color:hsl(var(--primary));
    padding:0.25rem 0.75rem;
    border-radius:20px;
    font-size:0.875rem;
    font-weight:500;
  }
  
  .teacher-info{
    display:flex;
    gap:1rem;
    align-items:center;
  }
  .avatar{ width:64px; height:64px; border-radius:10px; overflow:hidden; border:1px solid hsl(var(--border)); background:hsl(var(--background)); display:flex; align-items:center; justify-content:center; }
  .avatar img{ width:100%; height:100%; object-fit:cover; }
  .ph{ font-size:1.5rem; }
  .details .name{ 
    color:hsl(var(--foreground)); 
    font-weight:700; 
    font-size:1.125rem;
    margin-bottom:0.25rem; 
    line-height:1.3;
  }
  .school-info{ 
    color:hsl(var(--muted-foreground)); 
    font-size:0.875rem; 
    display:flex;
    align-items:center;
    gap:0.5rem;
  }
  .school-info:before{
    content:"🏫";
    font-size:0.875rem;
  }
  
  .empty-state{ 
    display:flex; 
    flex-direction:column; 
    align-items:center; 
    justify-content:center; 
    min-height:30vh; 
    text-align:center; 
    padding:2rem; 
  }
  .empty-icon{ font-size:4rem; margin-bottom:1rem; }
  .empty-title{ 
    font-size:1.5rem; 
    font-weight:600; 
    color:hsl(var(--foreground)); 
    margin:0 0 0.5rem 0; 
  }
  .empty-description{ 
    color:hsl(var(--muted-foreground)); 
    margin:0; 
    font-size:1rem; 
  }
  
  /* Анимации */
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
  
  @keyframes glow {
    0% {
      box-shadow: 0 0 5px hsl(var(--destructive) / 0.5);
    }
    100% {
      box-shadow: 0 0 20px hsl(var(--destructive) / 0.8);
    }
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .grid{ grid-template-columns: 1fr; gap:1rem; }
    .birthday-card{ padding:1rem; }
    .card-header{ margin-bottom:0.75rem; }
  }
</style>


