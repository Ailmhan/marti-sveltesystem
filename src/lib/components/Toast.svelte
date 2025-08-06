<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	export let message: string;
	export let type: 'success' | 'error' | 'info' = 'info';
	export let duration: number = 5000;
	export let show: boolean = false;

	const dispatch = createEventDispatcher();

	let timeoutId: ReturnType<typeof setTimeout>;

	$: if (show && duration > 0) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			show = false;
			dispatch('close');
		}, duration);
	}

	function close() {
		show = false;
		dispatch('close');
	}
</script>

{#if show}
	<div
		class="fixed top-4 right-4 z-50 max-w-sm"
		transition:fly={{ y: -50, duration: 300 }}
	>
		<div
			class={`
				p-4 rounded-lg shadow-lg border-l-4 flex items-center justify-between
				${type === 'success' ? 'bg-green-50 border-green-400 text-green-800' : ''}
				${type === 'error' ? 'bg-red-50 border-red-400 text-red-800' : ''}
				${type === 'info' ? 'bg-blue-50 border-blue-400 text-blue-800' : ''}
			`}
		>
			<div class="flex items-center">
				<span class="text-lg mr-2">
					{type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
				</span>
				<p class="text-sm font-medium">{message}</p>
			</div>
			<button
				on:click={close}
				class="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
			>
				✕
			</button>
		</div>
	</div>
{/if} 