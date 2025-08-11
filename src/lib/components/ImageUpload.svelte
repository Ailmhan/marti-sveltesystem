<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { uploadToDigitalOceanSpaces } from '$lib/utils/digitalOceanSpaces';

	export let value: string = '';
	export let accept = 'image/*';
	export let maxSize = 10 * 1024 * 1024; // 10MB
	export let disabled = false;
	export let folder = 'uploads';
	export let id: string = '';

	const dispatch = createEventDispatcher<{
		change: { value: string; uploading: boolean };
		error: { message: string };
		success: { message: string };
		uploadStart: void;
		uploadEnd: void;
	}>();

	let fileInput: HTMLInputElement;
	let dragOver = false;
	let uploading = false;

	function handleFileSelect(event: Event) {
		console.log('File select event triggered');
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		console.log('Selected file:', file);
		
		if (file) {
			handleFile(file);
		} else {
			console.log('No file selected');
		}
	}

	async function handleFile(file: File) {
		console.log('Handling file:', file.name, file.size, file.type);
		
		// Проверка размера файла
		if (file.size > maxSize) {
			const errorMsg = `Файл слишком большой. Максимальный размер: ${Math.round(maxSize / 1024 / 1024)}MB`;
			console.error(errorMsg);
			dispatch('error', { message: errorMsg });
			return;
		}

		// Проверка типа файла
		if (!file.type.startsWith('image/')) {
			const errorMsg = 'Пожалуйста, выберите изображение';
			console.error(errorMsg);
			dispatch('error', { message: errorMsg });
			return;
		}

		// Показываем состояние загрузки
		uploading = true;
		dispatch('uploadStart');
		console.log('Starting upload...');

		try {
			// Создаем временный URL для предварительного просмотра
			const tempUrl = URL.createObjectURL(file);
			value = tempUrl;
			console.log('Created temp URL:', tempUrl);

			// Загружаем файл в Digital Ocean Spaces
			const result = await uploadToDigitalOceanSpaces(file, folder);
			console.log('Upload result:', result);

			if (result.success && result.url) {
				// Освобождаем временный URL
				URL.revokeObjectURL(tempUrl);
				
				// Устанавливаем URL из Digital Ocean Spaces
				value = result.url;
				dispatch('change', { value: result.url, uploading: false });
				dispatch('success', { message: 'Изображение успешно загружено' });
				console.log('Upload successful:', result.url);
			} else {
				// Освобождаем временный URL в случае ошибки
				URL.revokeObjectURL(tempUrl);
				value = '';
				const errorMsg = result.error || 'Ошибка загрузки изображения';
				console.error('Upload failed:', errorMsg);
				dispatch('error', { message: errorMsg });
			}
		} catch (error) {
			value = '';
			const errorMsg = error instanceof Error ? error.message : 'Ошибка загрузки изображения';
			console.error('Upload error:', error);
			dispatch('error', { message: errorMsg });
		} finally {
			uploading = false;
			dispatch('uploadEnd');
			console.log('Upload finished');
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;

		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			handleFile(files[0]);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragOver = true;
	}

	function handleDragLeave() {
		dragOver = false;
	}

	function clearImage() {
		value = '';
		dispatch('change', { value });
		if (fileInput) {
			fileInput.value = '';
		}
	}

	function openFileDialog() {
		console.log('Opening file dialog...');
		if (fileInput) {
			fileInput.click();
		} else {
			console.error('File input not found');
		}
	}
</script>

<div class="space-y-4">
	{#if value}
		<!-- Preview -->
		<div class="relative group">
			<img 
				src={value} 
				alt="Preview" 
				class="w-full h-48 object-cover rounded-lg border"
			/>
			<div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
				<button 
					type="button"
					class="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
					on:click={clearImage}
					disabled={disabled}
				>
					<span>✕</span>
				</button>
			</div>
		</div>
	{:else}
		<!-- Upload area -->
		<div
			class="border-2 border-dashed rounded-lg p-6 text-center transition-colors {dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'} {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
			on:dragover={handleDragOver}
			on:dragleave={handleDragLeave}
			on:drop={handleDrop}
		>
			{#if uploading}
				<span class="mx-auto text-4xl text-gray-400 mb-4 animate-pulse">⏳</span>
				<div class="text-sm text-gray-600 mb-4">
					<p class="font-medium">Загрузка изображения...</p>
					<div class="mt-2 w-full bg-gray-200 rounded-full h-2">
						<div class="bg-blue-600 h-2 rounded-full animate-pulse" style="width: 60%"></div>
					</div>
				</div>
			{:else}
				<span class="mx-auto text-4xl text-gray-400 mb-4">🖼️</span>
				<div class="text-sm text-gray-600 mb-4">
					<p class="font-medium">Перетащите изображение сюда или</p>
					<button
						type="button"
						class="mt-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						on:click={openFileDialog}
						disabled={disabled}
					>
						<span class="mr-2">📤</span>
						Выберите файл
					</button>
				</div>
				<p class="text-xs text-gray-500">
					PNG, JPG, GIF до 10MB
				</p>
			{/if}
		</div>
	{/if}

	<input
		bind:this={fileInput}
		type="file"
		{accept}
		class="hidden"
		on:change={handleFileSelect}
		{disabled}
	/>
</div> 