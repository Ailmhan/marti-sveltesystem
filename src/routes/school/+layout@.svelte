<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { languageStore } from '$lib/stores/language';
	import { adminStore } from '$lib/stores/admin';
	import LanguageSwitch from '$lib/components/LanguageSwitch.svelte';
	import AdminLoginModal from '$lib/components/AdminLoginModal.svelte';
	import Toast from '$lib/components/Toast.svelte';

	// Подключаем CSS темы
	import '../../app.css';

	let isDark = false;
	let showAdminModal = false;

	function openAdminModal() {
		console.log('🔐 School Layout: openAdminModal called, current showAdminModal:', showAdminModal);
		console.log('🔐 School Layout: adminStore state:', $adminStore);
		showAdminModal = true;
		console.log('🔐 School Layout: showAdminModal set to:', showAdminModal);
	}

	function closeAdminModal() {
		console.log('🔐 School Layout: closeAdminModal called');
		showAdminModal = false;
	}

	// Отладочная функция для проверки
	function testModal() {
		console.log('🧪 Test modal clicked!');
		alert('Тест модального окна');
		openAdminModal();
	}

	onMount(() => {
		console.log('🏫 School Layout mounted, authStore:', {
			hasToken: !!$authStore.token,
			hasSchoolData: !!$authStore.schoolData,
			schoolId: $authStore.schoolId
		});
		
		// Загружаем данные школы если их еще нет
		if (!$authStore.schoolData && $authStore.token) {
			console.log('🏫 Loading school data in layout...');
			authStore.loadSchoolData();
		}
	});
</script>

<svelte:head>
	<title>Школьный лендинг</title>
</svelte:head>

<div class="school-layout">
	<!-- Навбар школы -->
	<header class="school-header">
		<div class="container">
			<div class="header-content">
				<!-- Логотип и название школы -->
				<div class="brand">
					{#if $authStore.schoolData?.logoUrl}
						<img class="brand-logo" src={$authStore.schoolData.logoUrl} alt="Логотип школы" />
					{:else}
						<div class="brand-logo placeholder">🏫</div>
					{/if}
					<div class="brand-text">
						<h1 class="brand-title">
							{$authStore.schoolData ? 
								($languageStore === 'ru' ? $authStore.schoolData.nameRu : $authStore.schoolData.nameKz) :
								'Школьная система'
							}
						</h1>
						<p class="brand-subtitle">Официальный сайт</p>
					</div>
				</div>

				<!-- Управление -->
				<div class="header-actions">
					<LanguageSwitch />
					
					{#if $adminStore.isAdminMode}
						<a href="/" class="admin-mode-btn active">
							📊 Панель управления
						</a>
					{:else if $authStore.token}
						<a href="/" class="admin-mode-btn dashboard">
							📊 Перейти в панель
						</a>
					{:else}
						<button 
							type="button"
							on:click={openAdminModal} 
							class="admin-mode-btn"
							title="Войти как администратор"
						>
							🔐 Войти как администратор
						</button>
						<button 
							type="button"
							on:click={testModal} 
							class="admin-mode-btn"
							style="background: red; margin-left: 0.5rem;"
							title="Тест модального окна"
						>
							🧪 Тест
						</button>
					{/if}
				</div>
			</div>
		</div>
	</header>

	<!-- Основное содержимое -->
	<main class="school-main">
		<slot />
	</main>
</div>

<!-- Модальное окно входа администратора -->
<AdminLoginModal bind:open={showAdminModal} on:close={closeAdminModal} />

<!-- Toast контейнер -->
<Toast />

<style>
	.school-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: hsl(var(--background));
	}

	.school-header {
		background: hsl(var(--card));
		border-bottom: 1px solid hsl(var(--border));
		position: sticky;
		top: 0;
		z-index: 50;
		backdrop-filter: blur(10px);
		background: hsl(var(--card) / 0.8);
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 0;
		gap: 1rem;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.brand-logo {
		width: 48px;
		height: 48px;
		border-radius: 0.5rem;
		object-fit: cover;
		border: 2px solid hsl(var(--border));
	}

	.brand-logo.placeholder {
		background: hsl(var(--primary));
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.brand-text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.brand-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: hsl(var(--foreground));
		margin: 0;
		line-height: 1.2;
	}

	.brand-subtitle {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
		margin: 0;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.admin-mode-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.875rem;
	}

	.admin-mode-btn:hover {
		background: hsl(var(--primary) / 0.9);
		transform: translateY(-1px);
	}

	.admin-mode-btn.active {
		background: hsl(var(--accent));
		color: hsl(var(--accent-foreground));
	}

	.admin-mode-btn.dashboard {
		background: hsl(var(--secondary));
		color: hsl(var(--secondary-foreground));
	}

	.school-main {
		flex: 1;
		overflow-x: hidden;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.brand {
			width: 100%;
		}

		.header-actions {
			width: 100%;
			justify-content: space-between;
		}

		.brand-title {
			font-size: 1.125rem;
		}

		.admin-mode-btn {
			font-size: 0.8rem;
			padding: 0.4rem 0.8rem;
		}
	}

	@media (max-width: 480px) {
		.container {
			padding: 0 0.5rem;
		}

		.brand {
			gap: 0.75rem;
		}

		.brand-logo {
			width: 40px;
			height: 40px;
		}

		.brand-title {
			font-size: 1rem;
		}

		.brand-subtitle {
			font-size: 0.8rem;
		}
	}
</style>