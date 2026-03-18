<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/auth';
    import { languageStore } from '$lib/stores/language';
    import Button from '$lib/components/ui/button/button.svelte';
    import LanguageSwitch from '$lib/components/LanguageSwitch.svelte';
    import HeaderSearch from '$lib/components/HeaderSearch.svelte';
    import ToastContainer from '$lib/components/ToastContainer.svelte';
    import AdminLoginModal from '$lib/components/AdminLoginModal.svelte';
    import BrandLogo from '$lib/components/BrandLogo.svelte';
    import { adminStore } from '$lib/stores/admin';
    import { cn } from '$lib/utils/cn';
    import { t } from '$lib/i18n/translations';
    import IdleRedirect from '$lib/components/IdleRedirect.svelte';
    	import { themeStore, isDark, currentTheme } from '$lib/stores/theme';
	import ThemeProvider from '$lib/components/ThemeProvider.svelte';
	import '../app.css';
	
	// Инициализируем тему при загрузке
	onMount(() => {
		if (typeof window !== 'undefined') {
			// Принудительно устанавливаем тему по умолчанию сразу
			if (!document.documentElement.classList.contains('light') && 
				!document.documentElement.classList.contains('dark')) {
				document.documentElement.classList.add('light');
			}
			
			// Инициализируем тему store
			themeStore.init();
		}
	});

    let sidebarOpen = false;
    let showAdminModal = false;



	const navigationItems = [
		{ key: 'home', href: '/', icon: '🏠' },
		{ key: 'news', href: '/news', icon: '📰' },
		{ key: 'teachers', href: '/teachers', icon: '👥' },
		{ key: 'birthdays', href: '/teachers/birthdays', icon: '🎂' },
		{ key: 'honorBoard', href: '/honor-board', icon: '🏆' },
		{ key: 'canteen', href: '/canteen', icon: '🍽️' },
		{ key: 'schedule', href: '/schedule', icon: '📅' },
		{ key: 'classes', href: '/classes', icon: '🎓' },
	];

	function isPublicRoute(pathname: string) {
		return (
			pathname === '/login' ||
			pathname.startsWith('/login/') ||
			pathname === '/register' ||
			pathname.startsWith('/register/') ||
			pathname === '/school' ||
			pathname.startsWith('/school/')
		);
	}

	$: if (browser && !$authStore.isLoading) {
		const pathname = $page.url.pathname;

		if (!$authStore.isAuthenticated && !isPublicRoute(pathname)) {
			goto('/login', { replaceState: true });
		}

		if ($authStore.isAuthenticated && (pathname === '/login' || pathname === '/register')) {
			goto('/', { replaceState: true });
		}
	}

	// Фильтруем навигацию и добавляем переводы
	$: filteredNavigation = navigationItems.map(item => ({
		...item,
		name: (t.navigation as any)[item.key]?.[$languageStore] || item.key
	}));

	function logout() {
		sidebarOpen = false;
		showAdminModal = false;
		adminStore.reset();
		authStore.logout();
		goto('/login', { replaceState: true });
	}

	function toggleSidebar() {
		console.log('Toggle sidebar clicked, current state:', sidebarOpen);
		sidebarOpen = !sidebarOpen;
		console.log('New state:', sidebarOpen);
	}

	function handleLanguageChange(event: CustomEvent<'ru' | 'kz'>) {
		languageStore.set(event.detail);
	}

	function openAdminModal() {
		console.log('openAdminModal called, current showAdminModal:', showAdminModal);
		showAdminModal = true;
		console.log('showAdminModal set to:', showAdminModal);
	}

	function closeAdminModal() {
		showAdminModal = false;
	}

	function exitAdminMode() {
		console.log('=== exitAdminMode called ===');
		console.log('Current adminStore state:', $adminStore);
		console.log('showAdminModal before:', showAdminModal);
		
		try {
			// Очищаем localStorage напрямую
			console.log('Clearing localStorage directly...');
			if (typeof window !== 'undefined') {
				localStorage.removeItem('adminMode');
				localStorage.removeItem('adminData');
				console.log('localStorage cleared directly');
			}
			
			// Вызываем метод store для изменения состояния
			console.log('Calling adminStore.exitAdminMode()...');
			adminStore.exitAdminMode();
			console.log('adminStore.exitAdminMode() called successfully');
			console.log('New adminStore state:', $adminStore);
			
			// Также закрываем модальное окно, если оно открыто
			showAdminModal = false;
			console.log('showAdminModal after:', showAdminModal);
			
			console.log('=== exitAdminMode completed ===');
		} catch (error) {
			console.error('Error in exitAdminMode:', error);
		}
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
        themeStore.toggleTheme();
    }

    function openSchoolPage() {
        goto('/school');
    }
</script>

<svelte:head>
	<title>{$languageStore === 'kz' ? 'Мектеп жүйесі' : 'Школьная система'}</title>
</svelte:head>

<ThemeProvider>
	<div class="min-h-screen bg-background">
    <!-- Показываем навигацию только если пользователь авторизован и не на страницах авторизации и не на странице школы -->
    {#if $authStore.isAuthenticated && !$page.url.pathname.startsWith('/login') && !$page.url.pathname.startsWith('/register') && !$page.url.pathname.startsWith('/school')}
		<!-- Sidebar for desktop -->
		<div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
			<div class="sidebar-surface flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
				<div class="sidebar-header">
					<div class="brand">
						<BrandLogo
							size={44}
							emblemUrl={$authStore.schoolData?.schoolEmblem}
							imageUrl={$authStore.schoolData?.logoUrl}
							alt={$authStore.schoolData?.nameRu || 'Marti'}
						/>
						<div class="brand-text">
							<div class="brand-title">{$languageStore === 'kz' ? 'Мектеп жүйесі' : 'Школьная система'}</div>
							<div class="brand-sub">{$authStore.schoolData?.nameRu || ($languageStore === 'kz' ? 'Қош келдіңіз' : 'Добро пожаловать')}</div>
						</div>
					</div>
				</div>
				<nav class="flex flex-1 flex-col sidebar-nav">
					<ul role="list" class="flex flex-1 flex-col gap-y-2">
						<li>
							<ul role="list" class="-mx-2 space-y-1">
								{#each filteredNavigation as item}
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
							<Button variant="outline" class="w-full justify-start logout-btn" onclick={logout}>
								<span class="mr-2">🚪</span>
								{$languageStore === 'kz' ? 'Шығу' : 'Выйти'}
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
						<h1 class="mobile-sidebar-title">{$languageStore === 'kz' ? 'Мектеп жүйесі' : 'Школьная система'}</h1>
						<button class="mobile-sidebar-close" on:click={toggleSidebar}>
							<span>✕</span>
						</button>
					</div>
					<nav class="mobile-sidebar-nav">
						<ul role="list" class="mobile-sidebar-menu">
							{#each filteredNavigation as item}
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
                        {#if $adminStore.isAdminMode}
                            <button 
                                type="button" 
                                class="admin-exit-btn" 
                                on:click={exitAdminMode}
                            >
                                <span class="btn-icon">🔒</span>
                                Выйти из режима администратора
                            </button>
                        {:else}
                            <button 
                                type="button" 
                                class="admin-entry-btn" 
                                on:click={openAdminModal}
                            >
                                <span class="btn-icon">🔐</span>
                                Войти в режим администратора
                            </button>
                        {/if}
                        
                        <Button class="btn-modern" onclick={openSchoolPage}>
                            <span class="btn-icon">🏫</span>
                            {$languageStore === 'kz' ? 'Мектеп туралы' : 'О школе'}
                        </Button>
                    <button class="theme-toggle" type="button" on:click={toggleTheme} aria-label={$isDark ? ($languageStore === 'kz' ? 'Жарық тақырып' : 'Светлая тема') : ($languageStore === 'kz' ? 'Қараңғы тақырып' : 'Тёмная тема')}>
                            {#if $isDark}
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
                    <button type="button" class="menu-btn" aria-label={$languageStore === 'kz' ? 'Мәзір' : 'Меню'} on:click={toggleSidebar}>
                        <span>☰</span>
                    </button>
                    <div class="mobile-search">
                        <HeaderSearch
                            placeholder={$languageStore === 'kz' ? 'Іздеу...' : 'Поиск...'}
                            compact={true}
                            on:search={handleSearch}
                            on:clear={handleSearchClear}
                        />
                    </div>
                    
                    {#if $adminStore.isAdminMode}
                        <button 
                            type="button" 
                            class="mobile-admin-exit-btn" 
                            on:click={exitAdminMode}
                        >
                            🔒
                        </button>
                    {:else}
                        <button 
                            type="button" 
                            class="mobile-admin-entry-btn" 
                            on:click={openAdminModal}
                        >
                            🔐
                        </button>
                    {/if}
                    
                    <Button variant="outline" onclick={openSchoolPage}>
                        🏫
                    </Button>
                    <button class="theme-toggle" type="button" on:click={toggleTheme} aria-label={$isDark ? ($languageStore === 'kz' ? 'Жарық тақырып' : 'Светлая тема') : ($languageStore === 'kz' ? 'Қараңғы тақырып' : 'Тёмная тема')}>
                        {#if $isDark}
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
	{:else if $page.url.pathname.startsWith('/school')}
		<!-- Для страницы школы показываем только контент без основного лайаута -->
		<slot />
	{:else}
		<!-- Для неавторизованных пользователей показываем только контент -->
		<main>
			<slot />
		</main>
	{/if}
	</div>
</ThemeProvider>

<!-- Toast notifications -->
<ToastContainer />

<!-- Admin login modal -->
<AdminLoginModal bind:open={showAdminModal} on:close={closeAdminModal} />

<!-- Автоматическое перенаправление при бездействии (только для страниц системы) -->
{#if $page.url.pathname !== '/school'}
	<IdleRedirect timeout={30000} redirectTo="/school" />
{/if}

<style>
  .desktop-header {
    position: sticky;
    top: 0;
    z-index: 40;
    display: none;
    backdrop-filter: blur(16px);
    background: hsl(var(--background) / 0.75);
    border-bottom: 1px solid hsl(var(--border) / 0.68);
    box-shadow: var(--shadow);
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
    max-width: 620px;
  }

  .search-container {
    position: relative;
    width: 100%;
  }

  .search-container :global(.header-search) {
    width: 100%;
  }

  .header-right,
  .header-actions {
    flex: 0 1 auto;
    display: flex;
    align-items: center;
    gap: 0.9rem;
  }

  .sidebar-surface {
    border-right: 1px solid hsl(var(--border) / 0.72);
    background:
      radial-gradient(circle at 14% 12%, hsl(var(--primary) / 0.12), transparent 35%),
      radial-gradient(circle at 90% 4%, hsl(var(--accent) / 0.12), transparent 38%),
      linear-gradient(180deg, hsl(var(--card) / 0.95), hsl(var(--muted) / 0.55));
    backdrop-filter: blur(18px);
    box-shadow: inset -1px 0 0 hsl(var(--card) / 0.46), var(--shadow-md);
  }

  .sidebar-header {
    padding: 1rem 0 0.65rem;
    position: relative;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .brand-text {
    line-height: 1.2;
  }

  .brand-title {
    font-family: var(--font-display);
    font-size: 0.96rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: hsl(var(--foreground));
  }

  .brand-sub {
    color: hsl(var(--muted-foreground));
    font-size: 0.8rem;
  }

  .sidebar-nav {
    padding-top: 0.25rem;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.66rem 0.82rem;
    border-radius: 0.74rem;
    text-decoration: none;
    color: hsl(var(--muted-foreground));
    transition: transform 180ms ease, background-color 180ms ease, color 180ms ease, box-shadow 220ms ease;
    position: relative;
  }

  .nav-item:hover {
    background: hsl(var(--secondary) / 0.9);
    color: hsl(var(--foreground));
    transform: translateX(2px);
  }

  .nav-item.active {
    background: var(--gradient-brand);
    color: hsl(var(--primary-foreground));
    box-shadow: var(--shadow-md);
  }

  .nav-icon {
    font-size: 1.05rem;
    width: 1.5rem;
    text-align: center;
  }

  .nav-text {
    font-weight: 700;
  }

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
    transition: transform 180ms ease, box-shadow 220ms ease, border-color 220ms ease;
    box-shadow: var(--shadow);
  }

  .theme-toggle:hover {
    border-color: hsl(var(--primary) / 0.45);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .theme-icon {
    font-size: 1rem;
  }

  .mobile-header {
    position: sticky;
    top: 0;
    z-index: 40;
    display: block;
    backdrop-filter: blur(16px);
    background: hsl(var(--background) / 0.78);
    border-bottom: 1px solid hsl(var(--border) / 0.7);
    box-shadow: var(--shadow);
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
    border-radius: 0.6rem;
    padding: 0.5rem;
    color: hsl(var(--foreground));
    transition: transform 180ms ease, box-shadow 220ms ease, border-color 220ms ease;
    box-shadow: var(--shadow);
  }

  .menu-btn:hover {
    border-color: hsl(var(--primary) / 0.45);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .mobile-search {
    flex: 1;
    min-width: 0;
    max-width: 400px;
  }

  .mobile-search :global(.header-search) {
    width: 100%;
  }

  .mobile-search :global(input.search-input) {
    font-size: 16px;
  }

  .mobile-sidebar-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
  }

  .mobile-sidebar-backdrop {
    position: absolute;
    inset: 0;
    background: rgb(2 6 23 / 0.48);
    backdrop-filter: blur(4px);
  }

  .mobile-sidebar {
    position: relative;
    width: 292px;
    height: 100vh;
    background:
      radial-gradient(circle at 14% 12%, hsl(var(--primary) / 0.12), transparent 35%),
      radial-gradient(circle at 90% 4%, hsl(var(--accent) / 0.12), transparent 38%),
      linear-gradient(180deg, hsl(var(--card) / 0.96), hsl(var(--muted) / 0.58));
    backdrop-filter: blur(20px);
    border-right: 1px solid hsl(var(--border) / 0.74);
    box-shadow: var(--shadow-xl);
    display: flex;
    flex-direction: column;
    transform: translateX(-100%);
    animation: slideIn 260ms ease-out forwards;
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
    padding: 1.2rem 1.3rem;
    border-bottom: 1px solid hsl(var(--border) / 0.75);
  }

  .mobile-sidebar-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.08rem;
    font-weight: 700;
    color: hsl(var(--foreground));
  }

  .mobile-sidebar-close {
    background: transparent;
    border: none;
    font-size: 1.45rem;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    padding: 0.4rem;
    border-radius: 0.5rem;
    transition: background-color 180ms ease, color 180ms ease;
  }

  .mobile-sidebar-close:hover {
    background: hsl(var(--secondary));
    color: hsl(var(--foreground));
  }

  .mobile-sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0.8rem 0;
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
    padding: 0.94rem 1.2rem;
    color: hsl(var(--muted-foreground));
    text-decoration: none;
    transition: background-color 180ms ease, color 180ms ease;
    border-radius: 0;
  }

  .mobile-sidebar-link:hover {
    background: hsl(var(--secondary) / 0.82);
    color: hsl(var(--foreground));
  }

  .mobile-sidebar-link.active {
    background: var(--gradient-brand);
    color: hsl(var(--primary-foreground));
  }

  .mobile-sidebar-icon {
    font-size: 1.2rem;
    width: 1.5rem;
    text-align: center;
  }

  .mobile-sidebar-text {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .mobile-sidebar-footer {
    padding: 1rem 1.2rem;
    border-top: 1px solid hsl(var(--border) / 0.76);
  }

  .mobile-sidebar-logout {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    width: 100%;
    padding: 0.9rem 0.95rem;
    border-radius: 0.65rem;
    cursor: pointer;
    transition: transform 160ms ease, box-shadow 200ms ease, background-color 200ms ease;
    font-weight: 600;
    margin-bottom: 0;
    border: 1px solid transparent;
    text-decoration: none;
  }

  .mobile-sidebar-logout {
    background: hsl(var(--destructive) / 0.14);
    color: hsl(var(--destructive));
    border-color: hsl(var(--destructive) / 0.2);
  }

  .mobile-sidebar-logout:hover {
    background: hsl(var(--destructive));
    color: hsl(var(--destructive-foreground));
  }

  .admin-entry-btn {
    background: var(--gradient-brand) !important;
    color: hsl(var(--primary-foreground)) !important;
    border: 1px solid hsl(var(--primary) / 0.3) !important;
    box-shadow: var(--shadow-md) !important;
    border-radius: 0.62rem !important;
  }

  .admin-entry-btn:hover {
    transform: translateY(-1px) !important;
    box-shadow: var(--shadow-lg) !important;
  }

  .admin-exit-btn,
  .mobile-admin-exit-btn {
    background: hsl(var(--destructive)) !important;
    color: hsl(var(--destructive-foreground)) !important;
    border: none !important;
    border-radius: 0.62rem !important;
  }

  .admin-exit-btn {
    padding: 0.75rem 1.4rem !important;
    margin-right: 0.5rem !important;
  }

  .mobile-admin-exit-btn,
  .mobile-admin-entry-btn {
    padding: 0.5rem !important;
    min-width: 2.5rem !important;
    height: 2.5rem !important;
    font-size: 0.875rem !important;
  }

  .mobile-admin-entry-btn {
    background: var(--gradient-brand) !important;
    color: hsl(var(--primary-foreground)) !important;
    border: 1px solid hsl(var(--primary) / 0.3) !important;
    box-shadow: var(--shadow-md) !important;
    border-radius: 0.62rem !important;
  }

  .mobile-admin-entry-btn:hover,
  .mobile-admin-exit-btn:hover,
  .admin-exit-btn:hover {
    transform: translateY(-1px) !important;
    box-shadow: var(--shadow-md) !important;
  }

  :global(.btn-modern) {
    background: var(--gradient-brand);
    color: hsl(var(--primary-foreground));
  }

  :global(.logout-btn) {
    background: linear-gradient(130deg, hsl(var(--destructive)), hsl(var(--destructive) / 0.82)) !important;
    color: hsl(var(--destructive-foreground)) !important;
    border: 1px solid hsl(var(--destructive) / 0.36) !important;
    box-shadow: var(--shadow-md) !important;
    font-weight: 700 !important;
  }

  :global(.logout-btn:hover) {
    transform: translateY(-1px) !important;
    box-shadow: var(--shadow-lg) !important;
  }
</style>
