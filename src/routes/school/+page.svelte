<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { languageStore } from '$lib/stores/language';
</script>

<svelte:head>
  <title>Страница школы</title>
</svelte:head>

<div class="container" style="max-width:1210px;margin:0 auto;padding:2rem;">
  <h1 style="font-size:2rem;font-weight:700;margin:0 0 1rem 0;">{$languageStore === 'ru' ? $authStore.schoolData?.nameRu : $authStore.schoolData?.nameKz || 'Школа'}</h1>
  <p style="color:hsl(var(--muted-foreground));">Скоро здесь будет страница школы (лендинг).</p>
</div>


