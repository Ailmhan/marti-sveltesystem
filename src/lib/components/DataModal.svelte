<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	// Иконки заменены на символы
	import { cn } from '$lib/utils/cn';

	export let open = false;
	export let title = '';
	export let loading = false;
	export let submitText = 'Сохранить';
	export let cancelText = 'Отмена';

	const dispatch = createEventDispatcher();

	function handleClose() {
		if (!loading) {
			dispatch('close');
		}
	}

	function handleSubmit() {
		if (!loading) {
			dispatch('submit');
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}
</script>

{#if open}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		on:click={handleBackdropClick}
	>
		<div class="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl border border-gray-200">
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-gray-100">
				<h2 class="text-xl font-semibold text-gray-900">{title}</h2>
				<Button 
					variant="ghost" 
					size="icon" 
					on:click={handleClose}
					disabled={loading}
					class="hover:bg-gray-100"
				>
					<span class="text-gray-500">✕</span>
				</Button>
			</div>

			<!-- Content -->
			<div class="p-6">
				<slot />
			</div>

			<!-- Footer -->
			<div class="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl">
				<Button 
					variant="outline" 
					on:click={handleClose}
					disabled={loading}
					class="border-gray-300 hover:bg-gray-100"
				>
					{cancelText}
				</Button>
				<Button 
					on:click={handleSubmit}
					disabled={loading}
					class="bg-blue-600 hover:bg-blue-700 text-white"
				>
					{#if loading}
						<span class="mr-2 animate-spin">⏳</span>
					{/if}
					{submitText}
				</Button>
			</div>
		</div>
	</div>
{/if} 