<svelte:head>
  <title>Авторизация</title>
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
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    padding: 2rem;
  }

  :global(.dark) .auth-layout {
    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
  }
</style>


