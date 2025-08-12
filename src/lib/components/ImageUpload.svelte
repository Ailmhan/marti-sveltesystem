<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { uploadToDigitalOceanSpaces } from '$lib/utils/digitalOceanSpaces';

	export let value: string = '';
	export let accept = 'image/*';
	export let maxSize = 10 * 1024 * 1024; // 10MB
	export let disabled = false;
	export let folder = 'uploads';
	export let id: string = '';

	const dispatch = createEventDispatcher();

	let fileInput: HTMLInputElement;
	let dragOver = false;
	let uploading = false;
	let uploadSuccess = false; // Новое состояние для отслеживания успешной загрузки

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
		
		// Сброс состояния
		uploadSuccess = false;
		
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
				uploadSuccess = true; // Устанавливаем флаг успешной загрузки
				dispatch('change', { value: result.url });
				dispatch('success', { message: 'Изображение успешно загружено' });
				console.log('Upload successful:', result.url);
			} else {
				// Освобождаем временный URL в случае ошибки
				URL.revokeObjectURL(tempUrl);
				value = '';
				uploadSuccess = false;
				const errorMsg = result.error || 'Ошибка загрузки изображения';
				console.error('Upload failed:', errorMsg);
				dispatch('error', { message: errorMsg });
			}
		} catch (error) {
			value = '';
			uploadSuccess = false;
			const errorMsg = error instanceof Error ? error.message : 'Ошибка загрузки изображения';
			console.error('Upload error:', error);
			dispatch('error', { message: errorMsg });
		} finally {
			uploading = false;
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
		uploadSuccess = false;
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

	// Экспортируем состояние загрузки для родительского компонента
	export { uploading, uploadSuccess };
</script>

<div class="image-upload">
	{#if value}
		<!-- Preview -->
		<div class="image-preview">
			<img 
				src={value} 
				alt="Preview" 
				class="preview-image"
			/>
			<div class="preview-overlay">
				<button 
					type="button"
					class="clear-button"
					on:click={clearImage}
					disabled={disabled}
				>
					<span>✕</span>
				</button>
			</div>
			{#if uploading}
				<div class="upload-status">
					<span class="upload-icon">⏳</span>
					<p>Загрузка в CDN...</p>
				</div>
			{:else if uploadSuccess}
				<div class="upload-status success">
					<span class="upload-icon">✅</span>
					<p>Загружено в CDN</p>
				</div>
			{:else}
				<div class="upload-status warning">
					<span class="upload-icon">⚠️</span>
					<p>Временное изображение</p>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Upload area -->
		<div
			class="upload-area {dragOver ? 'drag-over' : ''} {disabled ? 'disabled' : ''}"
			on:dragover={handleDragOver}
			on:dragleave={handleDragLeave}
			on:drop={handleDrop}
		>
			{#if uploading}
				<span class="upload-icon large">⏳</span>
				<div class="upload-text">
					<p class="upload-title">Загрузка изображения...</p>
					<div class="progress-bar">
						<div class="progress-fill"></div>
					</div>
				</div>
			{:else}
				<span class="upload-icon large">🖼️</span>
				<div class="upload-text">
					<p class="upload-title">Перетащите изображение сюда или</p>
					<button
						type="button"
						class="select-button"
						on:click={openFileDialog}
						disabled={disabled}
					>
						<span class="button-icon">📤</span>
						Выберите файл
					</button>
				</div>
				<p class="upload-hint">
					PNG, JPG, GIF до 10MB
				</p>
			{/if}
		</div>
	{/if}

	<input
		bind:this={fileInput}
		type="file"
		{accept}
		class="hidden-input"
		on:change={handleFileSelect}
		{disabled}
	/>
</div>

<style>
	.image-upload {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.image-preview {
		position: relative;
		border-radius: var(--radius);
		overflow: hidden;
		border: 2px solid hsl(var(--border));
	}

	.preview-image {
		width: 100%;
		height: 12rem;
		object-fit: cover;
		display: block;
	}

	.preview-overlay {
		position: absolute;
		inset: 0;
		background: hsl(var(--background) / 0.1);
		opacity: 0;
		transition: opacity 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.image-preview:hover .preview-overlay {
		opacity: 1;
	}

	.clear-button {
		background: hsl(var(--destructive));
		color: hsl(var(--destructive-foreground));
		border: none;
		border-radius: 50%;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 1rem;
	}

	.clear-button:hover:not(:disabled) {
		background: hsl(var(--destructive) / 0.9);
		transform: scale(1.1);
	}

	.clear-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.upload-status {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: hsl(var(--background) / 0.9);
		backdrop-filter: blur(8px);
		padding: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.upload-status.success {
		color: hsl(142 76% 36%);
	}

	.upload-status.warning {
		color: hsl(48 96% 53%);
	}

	.upload-icon {
		font-size: 1rem;
	}

	.upload-icon.large {
		font-size: 3rem;
	}

	.upload-area {
		border: 2px dashed hsl(var(--border));
		border-radius: var(--radius);
		padding: 2rem;
		text-align: center;
		transition: all 0.2s ease;
		cursor: pointer;
		background: hsl(var(--muted) / 0.3);
	}

	.upload-area:hover:not(.disabled) {
		border-color: hsl(var(--primary));
		background: hsl(var(--muted) / 0.5);
	}

	.upload-area.drag-over {
		border-color: hsl(var(--primary));
		background: hsl(var(--primary) / 0.1);
	}

	.upload-area.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.upload-text {
		margin: 1rem 0;
	}

	.upload-title {
		font-weight: 500;
		color: hsl(var(--foreground));
		margin-bottom: 1rem;
	}

	.select-button {
		padding: 0.75rem 1.5rem;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border: none;
		border-radius: calc(var(--radius) - 0.25rem);
		cursor: pointer;
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 500;
	}

	.select-button:hover:not(:disabled) {
		background: hsl(var(--primary) / 0.9);
		transform: translateY(-1px);
	}

	.select-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.button-icon {
		font-size: 1rem;
	}

	.upload-hint {
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
		margin: 0;
	}

	.progress-bar {
		width: 100%;
		height: 0.25rem;
		background: hsl(var(--muted));
		border-radius: 0.125rem;
		overflow: hidden;
		margin-top: 0.5rem;
	}

	.progress-fill {
		height: 100%;
		background: hsl(var(--primary));
		border-radius: 0.125rem;
		animation: progress 2s ease-in-out infinite;
	}

	@keyframes progress {
		0% { width: 0%; }
		50% { width: 60%; }
		100% { width: 100%; }
	}

	.hidden-input {
		display: none;
	}

	/* Темная тема */
	:global(.dark) .image-preview {
		border-color: hsl(var(--border));
	}

	:global(.dark) .preview-overlay {
		background: hsl(var(--background) / 0.2);
	}

	:global(.dark) .upload-status {
		background: hsl(var(--background) / 0.95);
	}

	:global(.dark) .upload-area {
		background: hsl(var(--muted) / 0.2);
		border-color: hsl(var(--border));
	}

	:global(.dark) .upload-area:hover:not(.disabled) {
		background: hsl(var(--muted) / 0.3);
	}

	:global(.dark) .upload-area.drag-over {
		background: hsl(var(--primary) / 0.15);
	}

	@media (max-width: 640px) {
		.upload-area {
			padding: 1.5rem;
		}

		.upload-icon.large {
			font-size: 2.5rem;
		}

		.select-button {
			width: 100%;
			justify-content: center;
		}
	}
</style> 