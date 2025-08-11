<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { languageStore } from '$lib/stores/language';
	import { adminStore } from '$lib/stores/admin';
	import { t } from '$lib/i18n/translations';
	import LanguageSwitch from '$lib/components/LanguageSwitch.svelte';
	import AdminLoginModal from '$lib/components/AdminLoginModal.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import '../../app.css';

	let isDark = false;
	let showAdminModal = false;

	function openAdminModal() {
		console.log('🔐 School Group: openAdminModal called, current showAdminModal:', showAdminModal);
		showAdminModal = true;
		console.log('🔐 School Group: showAdminModal set to:', showAdminModal);
	}

	function closeAdminModal() {
		showAdminModal = false;
	}

	function exitAdminMode() {
		adminStore.exitAdminMode();
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('theme');
			isDark = saved === 'dark';
			document.documentElement.classList.toggle('dark', isDark);
		}
	});

	function toggleTheme() {
		isDark = !isDark;
		document.documentElement.classList.toggle('dark', isDark);
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
	}

	const navigationItems = [
		{ key: 'home', href: '/school', icon: '🏠', label: 'Главная' },
		{ key: 'news', href: '/school#news', icon: '📰', label: 'Новости' },
		{ key: 'teachers', href: '/school#teachers', icon: '👥', label: 'Учителя' },
		{ key: 'honorBoard', href: '/school#honor-board', icon: '🏆', label: 'Почета' },
		{ key: 'canteen', href: '/school#canteen', icon: '🍽️', label: 'Меню' },
		{ key: 'schedule', href: '/school#schedule', icon: '📅', label: 'Расписание' },
		{ key: 'classes', href: '/school#classes', icon: '🎓', label: 'Классы' },
	];
</script>

<svelte:head>
	<title>{$authStore.schoolData?.nameRu || 'Школа'} - Официальный сайт</title>
	<meta name="description" content={$authStore.schoolData?.descriptionRu || 'Официальный сайт школы'} />
</svelte:head>

<!-- Фиксированный навбар -->
<nav class="school-navbar">
	<div class="navbar-container">
		<!-- Логотип и название школы -->
		<div class="navbar-brand">
			{#if $authStore.schoolData?.logoUrl}
				<img src={$authStore.schoolData.logoUrl} alt="Логотип школы" class="school-logo" />
			{:else}
				<div class="school-logo-placeholder">🏫</div>
			{/if}
			<div class="school-name">
				{$languageStore === 'ru' ? $authStore.schoolData?.nameRu : $authStore.schoolData?.nameKz}
			</div>
		</div>

		<!-- Навигационные ссылки -->
		<div class="navbar-nav">
			{#each navigationItems as item}
				<a 
					href={item.href} 
					class="nav-link"
					title={item.label}
				>
					<span class="nav-icon">{item.icon}</span>
					<span class="nav-label">{item.label}</span>
				</a>
			{/each}
		</div>

		<!-- Действия в навбаре -->
		<div class="navbar-actions">
			<LanguageSwitch />
			<button 
				type="button" 
				on:click={toggleTheme}
				class="theme-toggle"
				title="Сменить тему"
			>
				{isDark ? '☀️' : '🌙'}
			</button>
			
			{#if $authStore.token}
				{#if $adminStore.isAdminMode}
					<button 
						type="button"
						on:click={exitAdminMode} 
						class="admin-exit-btn"
						title="Выйти из режима администратора"
					>
						<span>🚪</span>
						<span>Выйти из админа</span>
					</button>
				{:else}
					<button 
						type="button"
						on:click={openAdminModal} 
						class="admin-mode-btn"
						title="Войти как администратор"
					>
						<span>🔐</span>
						<span>Войти как админ</span>
					</button>
				{/if}
				
				<a href="/" class="dashboard-btn">
					<span>📊</span>
					<span>Панель</span>
				</a>
			{:else}
				<a href="/login" class="admin-login-btn">
					<span>🔐</span>
					<span>Вход</span>
				</a>
			{/if}
		</div>
	</div>
</nav>

<!-- Основной контент -->
<main class="school-main">
	<slot />
</main>

<!-- Футер -->
<footer class="school-footer">
	<div class="footer-container">
		<div class="footer-content">
			<div class="footer-info">
				<h3>Контактная информация</h3>
				{#if $authStore.schoolData}
					<p><strong>Адрес:</strong> {$languageStore === 'ru' ? $authStore.schoolData.addressRu : $authStore.schoolData.addressKz}</p>
					<p><strong>Email:</strong> {$authStore.schoolData.email}</p>
				{/if}
			</div>
			<div class="footer-links">
				<h3>Навигация</h3>
				<div class="footer-nav">
					{#each navigationItems as item}
						<a href={item.href} class="footer-link">
							{item.icon} {item.label}
						</a>
					{/each}
				</div>
			</div>
		</div>
		<div class="footer-bottom">
			<p>&copy; 2024 {$languageStore === 'ru' ? $authStore.schoolData?.nameRu : $authStore.schoolData?.nameKz}. Все права защищены.</p>
		</div>
	</div>
</footer>

<!-- Toast уведомления -->
<ToastContainer />

<!-- Модальное окно входа администратора -->
<AdminLoginModal bind:open={showAdminModal} on:close={closeAdminModal} />

<style>
	/* Навбар */
	.school-navbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		background: hsl(var(--background) / 0.95);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid hsl(var(--border));
		box-shadow: 0 2px 10px hsl(var(--shadow) / 0.1);
	}

	.navbar-container {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		gap: 2rem;
	}

	.navbar-brand {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	.school-logo {
		width: 40px;
		height: 40px;
		border-radius: 0.5rem;
		object-fit: cover;
	}

	.school-logo-placeholder {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border-radius: 0.5rem;
		font-size: 1.25rem;
	}

	.school-name {
		font-weight: 600;
		color: hsl(var(--foreground));
		font-size: 1.1rem;
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.navbar-nav {
		display: flex;
		gap: 0.5rem;
		flex: 1;
		justify-content: center;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		color: hsl(var(--muted-foreground));
		text-decoration: none;
		transition: all 0.2s ease;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.nav-link:hover {
		color: hsl(var(--primary));
		background: hsl(var(--muted) / 0.5);
	}

	.nav-icon {
		font-size: 1rem;
	}

	.navbar-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	.theme-toggle {
		background: none;
		border: none;
		padding: 0.5rem;
		border-radius: 0.375rem;
		cursor: pointer;
		font-size: 1.25rem;
		color: hsl(var(--muted-foreground));
		transition: all 0.2s ease;
	}

	.theme-toggle:hover {
		color: hsl(var(--primary));
		background: hsl(var(--muted) / 0.5);
	}

	.admin-login-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 1rem;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		text-decoration: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.admin-login-btn:hover {
		background: hsl(var(--primary) / 0.9);
		transform: translateY(-1px);
	}

	.dashboard-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 1rem;
		background: hsl(var(--accent));
		color: hsl(var(--accent-foreground));
		text-decoration: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.dashboard-btn:hover {
		background: hsl(var(--accent) / 0.9);
		transform: translateY(-1px);
	}

	.admin-mode-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 1rem;
		background: hsl(var(--secondary));
		color: hsl(var(--secondary-foreground));
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.admin-mode-btn:hover {
		background: hsl(var(--secondary) / 0.8);
		transform: translateY(-1px);
	}

	.admin-exit-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 1rem;
		background: hsl(var(--destructive));
		color: hsl(var(--destructive-foreground));
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.admin-exit-btn:hover {
		background: hsl(var(--destructive) / 0.9);
		transform: translateY(-1px);
	}

	/* Основной контент */
	.school-main {
		margin-top: 80px; /* Компенсируем высоту навбара */
		min-height: calc(100vh - 80px);
	}

	/* Футер */
	.school-footer {
		background: hsl(var(--muted) / 0.3);
		border-top: 1px solid hsl(var(--border));
		margin-top: 4rem;
	}

	.footer-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 3rem 1rem 1rem;
	}

	.footer-content {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.footer-info h3,
	.footer-links h3 {
		color: hsl(var(--foreground));
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.footer-info p {
		color: hsl(var(--muted-foreground));
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}

	.footer-nav {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
	}

	.footer-link {
		color: hsl(var(--muted-foreground));
		text-decoration: none;
		font-size: 0.875rem;
		padding: 0.25rem 0;
		transition: color 0.2s ease;
	}

	.footer-link:hover {
		color: hsl(var(--primary));
	}

	.footer-bottom {
		border-top: 1px solid hsl(var(--border));
		padding-top: 1rem;
		text-align: center;
	}

	.footer-bottom p {
		color: hsl(var(--muted-foreground));
		font-size: 0.875rem;
		margin: 0;
	}

	/* Мобильная адаптация */
	@media (max-width: 768px) {
		.navbar-container {
			padding: 0.5rem;
			gap: 1rem;
		}

		.school-name {
			max-width: 150px;
			font-size: 1rem;
		}

		.navbar-nav {
			gap: 0.25rem;
		}

		.nav-label {
			display: none;
		}

		.nav-link {
			padding: 0.5rem;
		}

		.navbar-actions {
			gap: 0.5rem;
		}

		.admin-login-btn,
		.dashboard-btn,
		.admin-mode-btn,
		.admin-exit-btn {
			padding: 0.5rem;
		}

		.admin-login-btn span:last-child,
		.dashboard-btn span:last-child,
		.admin-mode-btn span:last-child,
		.admin-exit-btn span:last-child {
			display: none;
		}

		.footer-nav {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 640px) {
		.navbar-nav {
			overflow-x: auto;
			scrollbar-width: none;
			-ms-overflow-style: none;
		}

		.navbar-nav::-webkit-scrollbar {
			display: none;
		}
	}
</style>