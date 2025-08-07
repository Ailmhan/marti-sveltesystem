<script lang="ts">
	import ImageUpload from '$lib/components/ImageUpload.svelte';

	let imageUrl = '';
	let error = '';

	function handleImageChange(event: CustomEvent) {
		imageUrl = event.detail.value;
		console.log('Image changed:', imageUrl);
	}

	function handleError(event: CustomEvent) {
		error = event.detail.message;
		console.error('Upload error:', error);
	}

	function handleSuccess(event: CustomEvent) {
		error = '';
		console.log('Upload success:', event.detail.message);
	}
</script>

<svelte:head>
	<title>Тест загрузки файлов</title>
</svelte:head>

<div class="container mx-auto p-8">
	<h1 class="text-2xl font-bold mb-6">Тест загрузки файлов</h1>
	
	<div class="max-w-md">
		<ImageUpload
			bind:value={imageUrl}
			folder="test"
			on:change={handleImageChange}
			on:error={handleError}
			on:success={handleSuccess}
		/>
		
		{#if error}
			<div class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
				{error}
			</div>
		{/if}
		
		{#if imageUrl}
			<div class="mt-4">
				<h3 class="font-semibold mb-2">Загруженное изображение:</h3>
				<img src={imageUrl} alt="Uploaded" class="w-full h-48 object-cover rounded border" />
				<p class="text-sm text-gray-600 mt-2">URL: {imageUrl}</p>
			</div>
		{/if}
	</div>
</div>
