<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import Button from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils/cn';
	import { onMount } from 'svelte';
	import '../app.css';

	let sidebarOpen = false;

	const navigation = [
		{ name: 'Главная', href: '/', icon: '🏠' },
		{ name: 'Новости', href: '/news', icon: '📰' },
		{ name: 'Учителя', href: '/teachers', icon: '👥' },
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
		sidebarOpen = !sidebarOpen;
	}

	// Инициализируем auth store при загрузке
	onMount(() => {
		authStore.initialize();
	});
</script>

<svelte:head>
	<title>Школьная система</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Sidebar for desktop -->
	<div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
		<div class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 pb-4">
			<div class="flex h-16 shrink-0 items-center">
				<h1 class="text-xl font-bold text-primary">Школьная система</h1>
			</div>
			<nav class="flex flex-1 flex-col">
				<ul role="list" class="flex flex-1 flex-col gap-y-7">
					<li>
						<ul role="list" class="-mx-2 space-y-1">
							{#each navigation as item}
								<li>
									<a
										href={item.href}
										class={cn(
											$page.url.pathname === item.href
												? 'bg-primary text-primary-foreground'
												: 'text-muted-foreground hover:text-foreground hover:bg-accent',
											'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
										)}
									>
										<span class="text-lg">{item.icon}</span>
										{item.name}
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
		<div class="relative z-50 lg:hidden">
			<div class="fixed inset-0 bg-background/80"></div>
			<div class="fixed inset-0 flex">
				<div class="relative mr-16 flex w-full max-w-xs flex-1">
					<div class="absolute left-full top-0 flex w-16 justify-center pt-5">
						<Button variant="outline" size="icon" on:click={toggleSidebar}>
							<span>✕</span>
						</Button>
					</div>
					<div class="flex grow flex-col gap-y-5 overflow-y-auto bg-card px-6 pb-4">
						<div class="flex h-16 shrink-0 items-center">
							<h1 class="text-xl font-bold text-primary">Школьная система</h1>
						</div>
						<nav class="flex flex-1 flex-col">
							<ul role="list" class="flex flex-1 flex-col gap-y-7">
								<li>
									<ul role="list" class="-mx-2 space-y-1">
										{#each navigation as item}
											<li>
												<a
													href={item.href}
													class={cn(
														$page.url.pathname === item.href
															? 'bg-primary text-primary-foreground'
															: 'text-muted-foreground hover:text-foreground hover:bg-accent',
														'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
													)}
													on:click={() => sidebarOpen = false}
												>
													<span class="text-lg">{item.icon}</span>
													{item.name}
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
			</div>
		</div>
	{/if}

	<!-- Main content -->
	<div class="lg:pl-72">
		<!-- Mobile header -->
		<div class="sticky top-0 z-40 flex items-center gap-x-6 bg-background px-4 py-4 shadow-sm sm:px-6 lg:hidden">
			<Button variant="outline" size="icon" on:click={toggleSidebar}>
				<span>☰</span>
			</Button>
			<div class="flex-1 text-sm font-semibold leading-6 text-foreground">
				Школьная система
			</div>
		</div>

		<!-- Page content -->
		<main class="py-6">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<slot />
			</div>
		</main>
	</div>
</div>
