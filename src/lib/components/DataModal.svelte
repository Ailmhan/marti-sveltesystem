<script lang="ts">
	import { createEventDispatcher } from 'svelte';

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
		console.log('DataModal handleSubmit called, loading:', loading);
		if (!loading) {
			console.log('Dispatching submit event');
			dispatch('submit');
		} else {
			console.log('Submit blocked due to loading state');
		}
	}

	function handleBackdropClick(mouseEvent: MouseEvent) {
		if (mouseEvent.target === mouseEvent.currentTarget) {
			handleClose();
		}
	}

	function handleKeyDown(keyboardEvent: KeyboardEvent) {
		if (keyboardEvent.key === 'Escape') {
			handleClose();
		}
	}
</script>

{#if open}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		on:click={handleBackdropClick}
		on:keydown={handleKeyDown}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl border border-gray-200">
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-gray-100">
				<h2 class="text-xl font-semibold text-gray-900">{title}</h2>
				<button 
					type="button"
					on:click={handleClose}
					disabled={loading}
					class="p-2 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
				>
					<span>✕</span>
				</button>
			</div>

			<!-- Content -->
			<div class="p-6">
				<slot />
			</div>

			<!-- Footer -->
			<div class="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl">
				<button 
					type="button"
					on:click={handleClose}
					disabled={loading}
					class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 transition-colors"
				>
					{cancelText}
				</button>
				<button 
					type="button"
					on:click={handleSubmit}
					disabled={loading}
					class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 transition-colors flex items-center"
				>
					{#if loading}
						<span class="mr-2 animate-spin">⏳</span>
					{/if}
					{submitText}
				</button>
			</div>
		</div>
	</div>
{/if} 