<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { apiClient } from '$lib/api/client';
  import type { Teacher } from '$lib/types/api';
  import Schedule from '$lib/components/Schedule.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let teacher: Teacher | null = null;
  let schedule: any[] = [];
  let loading = false;
  let error = '';

  $: id = Number($page.params.id);

  onMount(load);

  async function load() {
    if (!id) return;
    loading = true;
    error = '';
    try {
      teacher = await apiClient.getTeacher(id);
      schedule = await apiClient.getTeacherSchedule(id);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Ошибка загрузки';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>{teacher ? teacher.nameRu : 'Учитель'} — профиль</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="teacher-page">
  {#if loading}
    <div class="loading-container">
      <LoadingSpinner />
      <p>Загрузка профиля учителя…</p>
    </div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if teacher}
    <div class="layout">
      <aside class="left">
        <div class="card">
          <div class="avatar">
            {#if teacher.imageUrl}
              <img src={teacher.imageUrl} alt={teacher.nameRu} />
            {:else}
              <div class="placeholder">👤</div>
            {/if}
          </div>
          <div class="bio">
            <h1 class="title">{teacher.nameRu}</h1>
            <div class="chips">
              <span class="chip">{teacher.subjectRu}</span>
            </div>
            <div class="info-grid">
              <div class="info-row">
                <span class="label">Email</span>
                <a class="value link" href={`mailto:${teacher.email}`}>{teacher.email}</a>
              </div>
              <div class="info-row">
                <span class="label">Телефон</span>
                <a class="value link" href={`tel:${teacher.phone}`}>{teacher.phone}</a>
              </div>
              <div class="info-row"><span class="label">День рождения</span><span class="value">{new Date(teacher.birthday).toLocaleDateString('ru-RU')}</span></div>
            </div>
          </div>
        </div>
      </aside>
      <section class="right">
        <div class="section">
          <h2>Расписание</h2>
          {#if schedule && schedule.length}
            <Schedule {schedule} />
          {:else}
            <div class="empty">У учителя пока нет занятий</div>
          {/if}
        </div>
      </section>
    </div>
  {/if}
</div>

<style>
  .teacher-page { max-width: 1210px; margin: 0 auto; padding: 1.5rem; }
  .layout { display: grid; grid-template-columns: 360px 1fr; gap: 1rem; align-items: start; }
  .left { position: sticky; top: 80px; align-self: start; }
  .card { background: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: 16px; padding: 1rem; box-shadow: var(--shadow-md); }
  .card{ position: relative; }
  .card::before{ content:''; position:absolute; left:0; right:0; top:0; height:3px; background: linear-gradient(90deg, hsl(var(--primary)), hsl(262 83% 68%)); opacity:.9; border-top-left-radius:16px; border-top-right-radius:16px; }
  .avatar { width: 100%; aspect-ratio: 1 / 1; border-radius: 12px; overflow: hidden; border: 1px solid hsl(var(--border)); background: hsl(var(--card)); display:flex; align-items:center; justify-content:center; }
  .avatar img { width: 100%; height: 100%; object-fit: cover; }
  .placeholder { font-size: 2rem; }
  .bio { margin-top: 0.75rem; }
  .title { margin: 0 0 0.25rem 0; font-size: 1.35rem; }
  .chips{ display:flex; gap:.5rem; margin: .25rem 0 .75rem; flex-wrap: wrap; }
  .chip{ display:inline-flex; align-items:center; gap:.35rem; padding:.25rem .6rem; border-radius:9999px; background: hsl(var(--accent)); color: hsl(var(--accent-foreground)); font-weight:600; font-size:.8rem; border:1px solid hsl(var(--border)); }
  .info-grid { display: grid; grid-template-columns: 1fr; gap: 0.5rem; }
  .info-row { display: flex; justify-content: space-between; gap: 0.5rem; padding: 0.6rem 0.75rem; border: 1px solid hsl(var(--border)); border-radius: 10px; background: hsl(var(--background)); }
  .label { color: hsl(var(--muted-foreground)); }
  .value { color: hsl(var(--foreground)); font-weight: 600; }
  .link{ text-decoration: none; color: hsl(var(--primary)); }
  .link:hover{ text-decoration: underline; }

  .right .section { margin-top: 0; }
  .section h2 { margin: 0 0 0.75rem 0; font-size: 1.25rem; }
  /* schedule reused component */

  @media (max-width: 900px) {
    .layout { grid-template-columns: 1fr; }
    .left { position: static; }
  }

  .loading-container{ display:flex; flex-direction:column; align-items:center; justify-content:center; min-height: 40vh; gap:.75rem; color:hsl(var(--muted-foreground)); }
  .loading, .error, .empty { color: hsl(var(--muted-foreground)); }
</style>


