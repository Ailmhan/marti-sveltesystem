<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/auth';
    import { languageStore } from '$lib/stores/language';
    import Button from '$lib/components/ui/button/button.svelte';
    import LanguageSwitch from '$lib/components/LanguageSwitch.svelte';
    import HeaderSearch from '$lib/components/HeaderSearch.svelte';
    import { cn } from '$lib/utils/cn';
    import '../app.css';

    let sidebarOpen = false;
    let isDark = false;

    onMount(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            isDark = saved === 'dark';
            document.documentElement.classList.toggle('dark', isDark);
        }
    });

	const navigation = [
		{ name: 'Главная', href: '/', icon: '🏠' },
		{ name: 'Новости', href: '/news', icon: '📰' },
		{ name: 'Учителя', href: '/teachers', icon: '👥' },
		{ name: 'Дни рождения', href: '/teachers/birthdays', icon: '🎂' },
		{ name: 'Доска почета', href: '/honor-board', icon: '🏆' },
		{ name: 'Меню', href: '/canteen', icon: '🍽️' },
		{ name: 'Расписание', href: '/schedule', icon: '📅' },
		{ name: 'Классы', href: '/classes', icon: '🎓' },
	];

	function logout() {
		authStore.logout();
		goto('/login');
	}

	function toggleSidebar() {
		console.log('Toggle sidebar clicked, current state:', sidebarOpen);
		sidebarOpen = !sidebarOpen;
		console.log('New state:', sidebarOpen);
	}

	function handleLanguageChange(event: CustomEvent<'ru' | 'kz'>) {
		languageStore.set(event.detail);
	}

	function handleSearch(event: CustomEvent<string>) {
		// Здесь можно добавить глобальную логику поиска
		console.log('Global search:', event.detail);
	}

	function handleSearchClear() {
		// Здесь можно добавить логику очистки поиска
		console.log('Search cleared');
	}

    function toggleTheme() {
        isDark = !isDark;
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            document.documentElement.classList.toggle('dark', isDark);
        }
    }

    function openSchoolPage() {
        goto('/school');
    }
</script>

<svelte:head>
	<title>Школьная система</title>
</svelte:head>

<div class="min-h-screen bg-background">
    <!-- Показываем навигацию только если пользователь авторизован и не на страницах авторизации -->
    {#if $authStore.isAuthenticated && !$page.url.pathname.startsWith('/login') && !$page.url.pathname.startsWith('/register')}
		<!-- Sidebar for desktop -->
		<div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
			<div class="sidebar-surface flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
				<div class="sidebar-header">
					<div class="brand">
						{#if $authStore.schoolData?.logoUrl}
							<img class="brand-logo" src={$authStore.schoolData.logoUrl} alt="Логотип школы" />
						{:else}
							<div class="brand-logo ph">🏫</div>
						{/if}
						<div class="brand-text">
							<div class="brand-title">Школьная система</div>
							<div class="brand-sub">{$authStore.schoolData?.nameRu || 'Добро пожаловать'}</div>
						</div>
					</div>
				</div>
				<nav class="flex flex-1 flex-col sidebar-nav">
					<ul role="list" class="flex flex-1 flex-col gap-y-2">
						<li>
							<ul role="list" class="-mx-2 space-y-1">
								{#each navigation as item}
									<li>
										<a
											href={item.href}
											class="nav-item {$page.url.pathname === item.href ? 'active' : ''}"
										>
											<span class="nav-icon">{item.icon}</span>
											<span class="nav-text">{item.name}</span>
										</a>
									</li>
								{/each}
							</ul>
						</li>
						<li class="mt-auto">
							<Button variant="outline" class="w-full justify-start" on:click={logout}>
								<span class="mr-2">🚪</span>
								Выйти
							</Button>
						</li>
					</ul>
				</nav>
			</div>
		</div>

		<!-- Mobile sidebar -->
		{#if sidebarOpen}
			<div class="mobile-sidebar-overlay">
                <div
                    class="mobile-sidebar-backdrop"
                    role="button"
                    tabindex="0"
                    aria-label="Закрыть меню"
                    on:click={toggleSidebar}
                    on:keydown={(e: KeyboardEvent) => {
                        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') toggleSidebar();
                    }}
                ></div>
				<div class="mobile-sidebar">
					<div class="mobile-sidebar-header">
						<h1 class="mobile-sidebar-title">Школьная система</h1>
						<button class="mobile-sidebar-close" on:click={toggleSidebar}>
							<span>✕</span>
						</button>
					</div>
					<nav class="mobile-sidebar-nav">
						<ul role="list" class="mobile-sidebar-menu">
							{#each navigation as item}
								<li>
                                    <a
                                        href={item.href}
                                        class="mobile-sidebar-link {$page.url.pathname === item.href ? 'active' : ''}"
                                        on:click={() => sidebarOpen = false}
                                        role="button"
                                        tabindex="0"
                                        on:keydown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { sidebarOpen = false; } }}
                                    >
										<span class="mobile-sidebar-icon">{item.icon}</span>
										<span class="mobile-sidebar-text">{item.name}</span>
									</a>
								</li>
							{/each}
						</ul>
						<div class="mobile-sidebar-footer">
							<button class="mobile-sidebar-logout" on:click={logout}>
								<span class="mobile-sidebar-icon">🚪</span>
								<span class="mobile-sidebar-text">Выйти</span>
							</button>
						</div>
					</nav>
				</div>
			</div>
		{/if}

		<!-- Main content -->
		<div class="lg:pl-72">
							<!-- Desktop header -->
		<div class="desktop-header">
			<div class="header-content">
				<div class="header-left">
					<div class="search-container">
						<HeaderSearch
							placeholder="Поиск по всей системе..."
							on:search={handleSearch}
							on:clear={handleSearchClear}
						/>
					</div>
				</div>
                <div class="header-right">
                    <div class="header-actions">
                        <Button class="btn-modern" on:click={openSchoolPage}>
                            <span class="btn-icon">🏫</span>
                            О школе
                        </Button>
                    <button class="theme-toggle" type="button" on:click={toggleTheme} aria-label={isDark ? 'Светлая тема' : 'Тёмная тема'}>
                            {#if isDark}
                                <span class="theme-icon">🌞</span>
                            {:else}
                                <span class="theme-icon">🌙</span>
                            {/if}
                        </button>
						<LanguageSwitch
							language={$languageStore}
							on:change={handleLanguageChange}
						/>
					</div>
				</div>
			</div>
		</div>

			<!-- Mobile header -->
			<div class="mobile-header">
                <div class="mobile-header-content">
                    <button type="button" class="menu-btn" aria-label="Меню" on:click={toggleSidebar}>
                        <span>☰</span>
                    </button>
                    <div class="mobile-search">
                        <HeaderSearch
                            placeholder="Поиск..."
                            compact={true}
                            on:search={handleSearch}
                            on:clear={handleSearchClear}
                        />
                    </div>
                    <Button variant="outline" on:click={openSchoolPage}>
                        🏫
                    </Button>
                    <button class="theme-toggle" type="button" on:click={toggleTheme} aria-label={isDark ? 'Светлая тема' : 'Тёмная тема'}>
                        {#if isDark}
                            <span class="theme-icon">🌞</span>
                        {:else}
                            <span class="theme-icon">🌙</span>
                        {/if}
                    </button>
					<LanguageSwitch
						language={$languageStore}
						on:change={handleLanguageChange}
					/>
				</div>
			</div>

			<!-- Page content -->
			<main class="py-6">
				<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<slot />
				</div>
			</main>
		</div>
	{:else}
		<!-- Для неавторизованных пользователей показываем только контент -->
		<main>
			<slot />
		</main>
	{/if}
</div>

<style>
	/* Desktop Header Styles */
	.desktop-header {
		position: sticky;
		top: 0;
		z-index: 40;
		display: none;
		backdrop-filter: blur(20px);
	}

	@media (min-width: 1024px) {
		.desktop-header {
			display: block;
		}
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 2rem;
		max-width: 1210px;
		margin: 0 auto;
		gap: 2rem;
	}

	.header-left {
		flex: 1;
		max-width: 600px;
	}

	.search-container {
		position: relative;
		width: 100%;
	}

	.search-container :global(.header-search) {
		width: 100%;
	}

	.header-right {
		flex: 0 1 auto;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

  /* Fun Sidebar */
  .sidebar-surface{
    border-right: 1px solid hsl(var(--border));
    background: linear-gradient(180deg, hsl(var(--card)/.9), hsl(var(--muted)/.3));
    backdrop-filter: blur(18px);
    box-shadow: inset -1px 0 0 hsl(var(--background)/.4), var(--shadow-xl);
  }
  .sidebar-header{ padding: 1rem 0 .5rem; position: relative; }
  .brand{ display:flex; align-items:center; gap:.75rem; }
  .brand-logo{ width:42px; height:42px; border-radius:10px; border:1px solid hsl(var(--border)); object-fit:cover; background:hsl(var(--background)); }
  .brand-logo.ph{ display:flex; align-items:center; justify-content:center; font-size:1.1rem; }
  .brand-text{ line-height:1.2; }
  .brand-title{ font-weight:800; color:hsl(var(--foreground)); }
  .brand-sub{ color:hsl(var(--muted-foreground)); font-size:.875rem; }

  .sidebar-nav{ padding-top:.25rem; }
  .nav-item{ display:flex; align-items:center; gap:.6rem; padding:.6rem .75rem; border-radius:.65rem; text-decoration:none; color:hsl(var(--muted-foreground)); transition: all .2s ease; position:relative; }
  .nav-item:hover{ background:hsl(var(--accent)); color:hsl(var(--accent-foreground)); transform: translateX(2px); }
  .nav-item.active{ background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); box-shadow: var(--shadow-sm); }
  .nav-icon{ font-size:1.1rem; width:1.5rem; text-align:center; }
  .nav-text{ font-weight:700; }

.theme-toggle {
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    color: hsl(var(--foreground));
    transition: all 0.2s ease;
    box-shadow: var(--shadow-sm);
}

.theme-toggle:hover {
    background: hsl(var(--accent));
    border-color: hsl(var(--ring));
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.theme-icon {
    font-size: 1rem;
}

	/* Mobile Header Styles */
	.mobile-header {
		position: sticky;
		top: 0;
		z-index: 40;
		display: block;
		background: linear-gradient(135deg, hsl(var(--background) / 0.95) 0%, hsl(var(--muted) / 0.3) 100%);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid hsl(var(--border) / 0.3);
	}

	@media (min-width: 1024px) {
		.mobile-header {
			display: none !important;
		}
	}

	.mobile-header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.menu-btn {
		flex-shrink: 0;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		padding: 0.5rem;
		color: hsl(var(--foreground));
		transition: all 0.2s ease;
		box-shadow: var(--shadow-sm);
	}

	.menu-btn:hover {
		background: hsl(var(--accent));
		border-color: hsl(var(--ring));
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.mobile-search {
		flex: 1;
		min-width: 0;
		max-width: 400px;
	}

    .mobile-search :global(.header-search) { width: 100%; }
    .mobile-search :global(input.search-input) {
        font-size: 16px; /* prevents iOS zoom */
    }

	/* Mobile Sidebar Styles */
	.mobile-sidebar-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 50;
		display: flex;
	}

	.mobile-sidebar-backdrop {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
	}

	.mobile-sidebar {
		position: relative;
		width: 280px;
		height: 100vh;
		background: linear-gradient(135deg, hsl(var(--card) / 0.95) 0%, hsl(var(--muted) / 0.3) 100%);
		backdrop-filter: blur(20px);
		border-right: 1px solid hsl(var(--border) / 0.3);
		box-shadow: var(--shadow-xl);
		display: flex;
		flex-direction: column;
		transform: translateX(-100%);
		animation: slideIn 0.3s ease-out forwards;
	}

	@keyframes slideIn {
		to {
			transform: translateX(0);
		}
	}

	.mobile-sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid hsl(var(--border) / 0.3);
	}

	.mobile-sidebar-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: hsl(var(--primary));
		margin: 0;
	}

	.mobile-sidebar-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: hsl(var(--muted-foreground));
		cursor: pointer;
		padding: 0.5rem;
		border-radius: var(--radius);
		transition: all 0.2s ease;
	}

	.mobile-sidebar-close:hover {
		background: hsl(var(--accent));
		color: hsl(var(--accent-foreground));
	}

	.mobile-sidebar-nav {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem 0;
	}

	.mobile-sidebar-menu {
		list-style: none;
		padding: 0;
		margin: 0;
		flex: 1;
	}

	.mobile-sidebar-link {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.5rem;
		color: hsl(var(--muted-foreground));
		text-decoration: none;
		transition: all 0.2s ease;
		border-radius: 0;
	}

	.mobile-sidebar-link:hover {
		background: hsl(var(--accent));
		color: hsl(var(--accent-foreground));
	}

	.mobile-sidebar-link.active {
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
	}

	.mobile-sidebar-icon {
		font-size: 1.25rem;
		width: 1.5rem;
		text-align: center;
	}

	.mobile-sidebar-text {
		font-weight: 600;
		font-size: 0.95rem;
	}

	.mobile-sidebar-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid hsl(var(--border) / 0.3);
	}

	.mobile-sidebar-logout {
		display: flex;
		align-items: center;
		gap: 1rem;
		width: 100%;
		padding: 1rem;
		background: hsl(var(--destructive) / 0.1);
		color: hsl(var(--destructive));
		border: 1px solid hsl(var(--destructive) / 0.2);
		border-radius: var(--radius);
		cursor: pointer;
		transition: all 0.2s ease;
		font-weight: 600;
	}

	.mobile-sidebar-logout:hover {
		background: hsl(var(--destructive));
		color: hsl(var(--destructive-foreground));
	}

	/* Enhanced Button Styles */
	:global(.btn-modern) {
		background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(262 83% 68%) 100%);
		color: hsl(var(--primary-foreground));
		border: none;
		border-radius: var(--radius);
		padding: 0.75rem 1.5rem;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: var(--shadow-md);
		position: relative;
		overflow: hidden;
	}

	:global(.btn-modern::before) {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, hsl(var(--primary-foreground) / 0.2), transparent);
		transition: left 0.5s ease;
	}

	:global(.btn-modern:hover::before) {
		left: 100%;
	}

	:global(.btn-modern:hover) {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
		background: linear-gradient(135deg, hsl(262 83% 68%) 0%, hsl(var(--primary)) 100%);
	}

	:global(.btn-modern:active) {
		transform: translateY(0);
		box-shadow: var(--shadow-sm);
	}
</style>
