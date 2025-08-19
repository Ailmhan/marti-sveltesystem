<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { uploadToDigitalOceanSpaces } from '$lib/utils/digitalOceanSpaces';

	export let value: string = '';
	export let accept = 'image/*';
	export let maxSize = 10 * 1024 * 1024; // 10MB
	export let disabled = false;
	export let folder = 'uploads';
	export let id: string = '';
	export let uploading = false; // Экспортируем состояние загрузки для внешнего контроля

	const dispatch = createEventDispatcher();

	let fileInput: HTMLInputElement;
	let isDragOver = false;
	let internalUploading = false;
	let uploadSuccess = false; // Состояние для отслеживания успешной загрузки
	
	// Вычисляемое значение для uploading
	$: isUploading = uploading || internalUploading;

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (file) {
			handleFile(file);
		}
	}

	async function handleFile(file: File) {
		// Сброс состояния
		uploadSuccess = false;
		
		// Проверка размера файла
		if (file.size > maxSize) {
			const errorMsg = `Файл слишком большой. Максимальный размер: ${Math.round(maxSize / 1024 / 1024)}MB`;
			dispatch('error', { message: errorMsg });
			return;
		}

		// Проверка типа файла
		if (!file.type.startsWith('image/')) {
			const errorMsg = 'Пожалуйста, выберите изображение';
			dispatch('error', { message: errorMsg });
			return;
		}

		// Показываем состояние загрузки
		internalUploading = true;
		dispatch('uploading', { uploading: true });

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
				uploadSuccess = true; // Устанавливаем флаг успешной загрузки
				dispatch('change', { value: result.url });
				dispatch('success', { message: 'Изображение успешно загружено' });
				dispatch('uploading', { uploading: false });
			} else {
				// Освобождаем временный URL в случае ошибки
				URL.revokeObjectURL(tempUrl);
				value = '';
				uploadSuccess = false;
				const errorMsg = result.error || 'Ошибка загрузки изображения';
				dispatch('error', { message: errorMsg });
				dispatch('uploading', { uploading: false });
			}
		} catch (error) {
			value = '';
			uploadSuccess = false;
			const errorMsg = error instanceof Error ? error.message : 'Ошибка загрузки изображения';
			dispatch('error', { message: errorMsg });
			dispatch('uploading', { uploading: false });
		} finally {
			internalUploading = false;
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;

		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			handleFile(files[0]);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave() {
		isDragOver = false;
	}

	function clearImage() {
		value = '';
		uploadSuccess = false;
		dispatch('change', { value: '' });
		dispatch('uploading', { uploading: false });
	}

	function openFileDialog() {
		console.log('Opening file dialog...');
		if (fileInput) {
			fileInput.click();
		} else {
			console.error('File input not found');
		}
	}

	// Экспортируем состояние загрузки для родительского компонента
	export { uploadSuccess };
</script>

	<div class="image-upload">
		<div 
			class="upload-area" 
			class:drag-over={isDragOver}
			on:click|stopPropagation={() => fileInput?.click()}
			on:dragover|stopPropagation={handleDragOver}
			on:dragleave|stopPropagation={handleDragLeave}
			on:drop|stopPropagation={handleDrop}
		>
		{#if value && !isUploading}
			<div class="image-preview">
				<img src={value} alt="Preview" />
				<button type="button" class="remove-btn" on:click|stopPropagation={clearImage}>✕</button>
			</div>
		{:else if isUploading}
			<div class="uploading-state">
				<div class="spinner"></div>
				<p>Загрузка...</p>
			</div>
		{:else}
			<div class="upload-placeholder">
				<span class="upload-icon">📷</span>
				<p>Нажмите или перетащите изображение</p>
				<p class="upload-hint">PNG, JPG до 10MB</p>
			</div>
		{/if}
	</div>

	<input
		bind:this={fileInput}
		type="file"
		{accept}
		on:change={handleFileSelect}
		style="display: none;"
		{disabled}
	/>

	{#if isDragOver}
		<div class="drag-overlay" on:click|stopPropagation>
			<span>Отпустите файл для загрузки</span>
		</div>
	{/if}
</div>

<style>
	.image-upload {
		position: relative;
		width: 100%;
	}

	.upload-area {
		border: 2px dashed hsl(var(--border));
		border-radius: var(--radius);
		padding: 2rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s ease;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
	}

	.upload-area:hover {
		border-color: hsl(var(--primary));
		background: hsl(var(--accent) / 0.1);
	}

	.upload-area.drag-over {
		border-color: hsl(var(--primary));
		background: hsl(var(--primary) / 0.1);
	}

	.upload-area:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.image-preview {
		position: relative;
		display: inline-block;
	}

	.image-preview img {
		max-width: 100%;
		max-height: 200px;
		border-radius: var(--radius);
		object-fit: cover;
	}

	.remove-btn {
		position: absolute;
		top: -0.5rem;
		right: -0.5rem;
		background: hsl(var(--destructive));
		color: hsl(var(--destructive-foreground));
		border: none;
		border-radius: 50%;
		width: 2rem;
		height: 2rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.875rem;
		transition: all 0.2s ease;
	}

	.remove-btn:hover {
		background: hsl(var(--destructive) / 0.9);
		transform: scale(1.1);
	}

	.uploading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.spinner {
		width: 2rem;
		height: 2rem;
		border: 2px solid hsl(var(--border));
		border-top: 2px solid hsl(var(--primary));
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.upload-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.upload-icon {
		font-size: 3rem;
		opacity: 0.7;
	}

	.upload-hint {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
		opacity: 0.8;
	}

	.drag-overlay {
		position: absolute;
		inset: 0;
		background: hsl(var(--primary) / 0.9);
		color: hsl(var(--primary-foreground));
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius);
		font-weight: 600;
		z-index: 10;
	}

	/* Темная тема */
	:global(.dark) .upload-area {
		background: hsl(var(--background));
		border-color: hsl(var(--border));
		color: hsl(var(--foreground));
	}

	:global(.dark) .upload-area:hover {
		background: hsl(var(--accent) / 0.1);
		border-color: hsl(var(--primary));
	}

	:global(.dark) .upload-area.drag-over {
		background: hsl(var(--primary) / 0.1);
		border-color: hsl(var(--primary));
	}

	:global(.dark) .upload-hint {
		color: hsl(var(--muted-foreground));
	}

	:global(.dark) .upload-placeholder {
		color: hsl(var(--foreground));
	}

	:global(.dark) .drag-overlay {
		background: hsl(var(--primary) / 0.9);
		color: hsl(var(--primary-foreground));
	}
</style> 