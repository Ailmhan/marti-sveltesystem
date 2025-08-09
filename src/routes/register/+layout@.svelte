<svelte:head>
  <title>Регистрация</title>
</svelte:head>

<div class="auth-layout">
  <slot />
</div>

<style>
  .auth-layout {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.3) 100%);
    padding: 2rem;
  }
</style>


