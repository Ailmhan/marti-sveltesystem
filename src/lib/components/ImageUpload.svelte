<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { uploadToDigitalOceanSpaces } from '$lib/utils/digitalOceanSpaces';
	// Иконки заменены на символы
	import { cn } from '$lib/utils/cn';

	export let value: string = '';
	export let placeholder = 'Загрузить изображение';
	export let accept = 'image/*';
	export let maxSize = 10 * 1024 * 1024; // 10MB
	export let disabled = false;
	export let folder = 'uploads';
	export let id: string = '';

	const dispatch = createEventDispatcher();

	let fileInput: HTMLInputElement;
	let dragOver = false;
	let uploading = false;

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (file) {
			handleFile(file);
		}
	}

	async function handleFile(file: File) {
		// Проверка размера файла
		if (file.size > maxSize) {
			dispatch('error', { message: `Файл слишком большой. Максимальный размер: ${Math.round(maxSize / 1024 / 1024)}MB` });
			return;
		}

		// Проверка типа файла
		if (!file.type.startsWith('image/')) {
			dispatch('error', { message: 'Пожалуйста, выберите изображение' });
			return;
		}

		// Показываем состояние загрузки
		uploading = true;

		try {
			// Создаем временный URL для предварительного просмотра
			const tempUrl = URL.createObjectURL(file);
			value = tempUrl;

			// Загружаем файл в Digital Ocean Spaces
			const result = await uploadToDigitalOceanSpaces(file, folder);

			if (result.success && result.url) {
				// Освобождаем временный URL
				URL.revokeObjectURL(tempUrl);
				
				// Устанавливаем URL из Digital Ocean Spaces
				value = result.url;
				dispatch('change', { value: result.url });
				dispatch('success', { message: 'Изображение успешно загружено' });
			} else {
				// Освобождаем временный URL в случае ошибки
				URL.revokeObjectURL(tempUrl);
				value = '';
				dispatch('error', { message: result.error || 'Ошибка загрузки изображения' });
			}
		} catch (error) {
			value = '';
			dispatch('error', { message: error instanceof Error ? error.message : 'Ошибка загрузки изображения' });
		} finally {
			uploading = false;
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
		fileInput?.click();
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
				<Button 
					variant="destructive" 
					size="icon"
					class="opacity-0 group-hover:opacity-100 transition-opacity"
					on:click={clearImage}
					disabled={disabled}
				>
					<span>✕</span>
				</Button>
			</div>
		</div>
	{:else}
				<!-- Upload area -->
		<div
			class={cn(
				"border-2 border-dashed rounded-lg p-6 text-center transition-colors",
				dragOver
					? "border-primary bg-primary/5"
					: "border-muted-foreground/25 hover:border-muted-foreground/50",
				disabled && "opacity-50 cursor-not-allowed"
			)}
			on:dragover={handleDragOver}
			on:dragleave={handleDragLeave}
			on:drop={handleDrop}
		>
			{#if uploading}
				<span class="mx-auto text-4xl text-muted-foreground mb-4 animate-pulse">⏳</span>
				<div class="text-sm text-muted-foreground mb-4">
					<p class="font-medium">Загрузка изображения...</p>
					<div class="mt-2 w-full bg-gray-200 rounded-full h-2">
						<div class="bg-blue-600 h-2 rounded-full animate-pulse" style="width: 60%"></div>
					</div>
				</div>
			{:else}
				<span class="mx-auto text-4xl text-muted-foreground mb-4">🖼️</span>
				<div class="text-sm text-muted-foreground mb-4">
					<p class="font-medium">Перетащите изображение сюда или</p>
					<Button
						variant="outline"
						size="sm"
						class="mt-2"
						on:click={openFileDialog}
						disabled={disabled}
					>
						<span class="mr-2">📤</span>
						Выберите файл
					</Button>
				</div>
				<p class="text-xs text-muted-foreground">
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