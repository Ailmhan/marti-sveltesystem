<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { uploadToDigitalOceanSpaces } from '$lib/utils/digitalOceanSpaces';

	// === Public props ===
	export let value: string = '';                 // внешний URL (bind:value)
	export let accept: string = 'image/*';         // допустимые типы
	export let maxSize: number = 10 * 1024 * 1024; // 10MB
	export let disabled: boolean = false;          // внешняя блокировка
	export let folder: string = 'uploads';         // папка в Spaces
	export let id: string = '';                    // id для aria/label
	export let uploading: boolean = false;         // внешний флаг загрузки (если нужно принудительно блокировать снаружи)

	const dispatch = createEventDispatcher<{
		uploading: { uploading: boolean };
		change: { value: string };
		success: { message: string; url: string };
		error: { message: string };
	}>();

	// === Internal state ===
	let fileInput: HTMLInputElement | null = null;
	let isDragOver = false;
	let internalUploading = false;
	let previewUrl: string | null = null; // локальный ObjectURL для превью
	let uploadSuccess = false;

	// Вычисляемый итоговый флаг загрузки
	$: isUploading = !!uploading || internalUploading;
	// Итоговая блокировка любых интеракций
	$: isBlocked = !!disabled || isUploading;

	// Экспортируем флаг успеха — если он тебе нужен снаружи
	export { uploadSuccess };

	// --- Utils ---
	function readableSize(n: number) {
		const mb = n / (1024 * 1024);
		return `${mb.toFixed(mb >= 10 ? 0 : 1)}MB`;
	}

	function revokePreview() {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = null;
		}
	}

	onDestroy(() => {
		revokePreview();
	});

	function checkSize(file: File): string | null {
		return file.size > maxSize
			? `Файл слишком большой. Максимальный размер: ${readableSize(maxSize)}`
			: null;
	}

	// Примитивная проверка соответствия accept (более строгая валидация на бэке всё равно нужна)
	function matchesAccept(file: File, accept: string): boolean {
		if (!accept || accept === '*/*') return true;
		return accept.split(',').some((rule) => {
			const trimmed = rule.trim();
			if (!trimmed) return false;
			// image/*  |  image/png  |  .png
			if (trimmed.startsWith('.')) {
				return file.name.toLowerCase().endsWith(trimmed.toLowerCase());
			}
			if (trimmed.endsWith('/*')) {
				return file.type.startsWith(trimmed.slice(0, -1));
			}
			return file.type === trimmed;
		});
	}

	function typeErrorText(): string {
		return accept
			? `Неверный тип файла. Допустимо: ${accept}`
			: 'Пожалуйста, выберите поддерживаемый тип файла';
	}

	// --- Core handlers ---
	function openFileDialog() {
		if (isBlocked) return;
		fileInput?.click();
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) processFile(file);
		// очищаем value у input, чтобы одинаковый файл можно было выбрать повторно
		if (fileInput) fileInput.value = '';
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		if (isBlocked) return;
		isDragOver = true;
	}

	function handleDragLeave() {
		isDragOver = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		if (isBlocked) return;
		isDragOver = false;

		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			processFile(files[0]);
		}
	}

	function clearImage() {
		if (isBlocked) return;
		value = '';
		uploadSuccess = false;
		revokePreview();
		dispatch('change', { value: '' });
		// На случай, если кто-то ждет сброс uploading снаружи
		dispatch('uploading', { uploading: false });
	}

	async function processFile(file: File) {
		// Валидации
		{
			const sizeErr = checkSize(file);
			if (sizeErr) {
				dispatch('error', { message: sizeErr });
				return;
			}
			if (!matchesAccept(file, accept)) {
				dispatch('error', { message: typeErrorText() });
				return;
			}
		}

		// Локальный превью до успешной загрузки
		revokePreview();
		previewUrl = URL.createObjectURL(file);
		value = previewUrl;

		// Флаги загрузки
		internalUploading = true;
		uploadSuccess = false;
		dispatch('uploading', { uploading: true });

		try {
			const result = await uploadToDigitalOceanSpaces(file, folder);

			if (result?.success && result?.url) {
				// Готовый внешний URL — подменяем превью
				revokePreview();
				value = result.url;
				uploadSuccess = true;

				dispatch('change', { value: result.url });
				dispatch('success', { message: 'Изображение успешно загружено', url: result.url });
			} else {
				// Ошибка загрузки — чистим превью и value
				revokePreview();
				value = '';
				uploadSuccess = false;

				const msg = result?.error || 'Ошибка загрузки изображения';
				dispatch('error', { message: msg });
			}
		} catch (err) {
			revokePreview();
			value = '';
			uploadSuccess = false;

			const msg = err instanceof Error ? err.message : 'Ошибка загрузки изображения';
			dispatch('error', { message: msg });
		} finally {
			internalUploading = false;
			dispatch('uploading', { uploading: false });
		}
	}

	// Клавиатура по блокy: Enter/Space открывают диалог
	function onKeyInteract(e: KeyboardEvent) {
		if (isBlocked) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openFileDialog();
		}
	}
</script>

<!-- Wrapper -->
<div class="image-upload">
	<!-- Click / DnD область -->
	<div
		class="upload-area"
		class:drag-over={isDragOver}
		role="button"
		tabindex={isBlocked ? -1 : 0}
		aria-disabled={isBlocked}
		aria-busy={isUploading}
		aria-describedby={id ? `${id}-hint` : undefined}
		on:click|stopPropagation={openFileDialog}
		on:keydown|stopPropagation={onKeyInteract}
		on:dragover|stopPropagation={handleDragOver}
		on:dragleave|stopPropagation={handleDragLeave}
		on:drop|stopPropagation={handleDrop}
	>
		{#if value && !isUploading}
			<div class="image-preview">
				<img src={value} alt="Превью изображения" />
				<button
					type="button"
					class="remove-btn"
					on:click|stopPropagation={clearImage}
					disabled={isBlocked}
					aria-label="Удалить изображение"
				>✕</button>
			</div>
		{:else if isUploading}
			<div class="uploading-state" aria-live="polite">
				<div class="spinner" aria-hidden="true"></div>
				<p>Загрузка…</p>
			</div>
		{:else}
			<div class="upload-placeholder">
				<span class="upload-icon" aria-hidden="true">📷</span>
				<p>{disabled ? 'Загрузка отключена' : 'Нажмите или перетащите изображение'}</p>
				<p id={id ? `${id}-hint` : undefined} class="upload-hint">
					{accept?.includes('image') ? 'PNG, JPG' : 'Поддерживаемые типы'} до {readableSize(maxSize)}
				</p>
			</div>
		{/if}
	</div>

	<!-- Невидимый file input -->
	<input
		bind:this={fileInput}
		id={id}
		type="file"
		{accept}
		on:change={handleFileSelect}
		disabled={isBlocked}
		style="display: none;"
	/>
</div>

<style>
	.image-upload { position: relative; width: 100%; }

	.upload-area {
		border: 2px dashed hsl(var(--border));
		border-radius: var(--radius);
		padding: 2rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s ease;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		outline: none;
	}
	.upload-area:hover { border-color: hsl(var(--primary)); background: hsl(var(--accent) / 0.12); }
	.upload-area:focus-visible { box-shadow: 0 0 0 3px hsl(var(--primary) / 0.35); }
	.upload-area.drag-over {
		border-color: hsl(var(--primary));
		background: hsl(var(--primary) / 0.12);
	}
	.upload-area[aria-disabled="true"] { opacity: 0.6; cursor: not-allowed; }

	.image-preview { position: relative; display: inline-block; max-width: 100%; }
	.image-preview img {
		max-width: 100%;
		max-height: 220px;
		border-radius: var(--radius);
		object-fit: cover;
		border: 1px solid hsl(var(--border));
	}

	.remove-btn {
		position: absolute;
		top: -0.5rem;
		right: -0.5rem;
		background: hsl(var(--destructive));
		color: hsl(var(--destructive-foreground));
		border: none;
		border-radius: 9999px;
		width: 2rem;
		height: 2rem;
		cursor: pointer;
		display: grid;
		place-items: center;
		font-size: 0.875rem;
		transition: transform 0.15s ease, opacity 0.15s ease, background 0.15s ease;
		box-shadow: 0 2px 8px rgba(0,0,0,.12);
	}
	.remove-btn:hover { background: hsl(var(--destructive) / 0.9); transform: scale(1.06); }
	.remove-btn:disabled { opacity: 0.6; cursor: not-allowed; }

	.uploading-state { display: grid; place-items: center; gap: 0.75rem; min-height: 120px; }
	.spinner {
		width: 2rem; height: 2rem;
		border: 2px solid hsl(var(--border));
		border-top: 2px solid hsl(var(--primary));
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	@keyframes spin { to { transform: rotate(360deg); } }

	.upload-placeholder { display: grid; place-items: center; gap: 0.5rem; min-height: 120px; }
	.upload-icon { font-size: 3rem; opacity: 0.75; }
	.upload-hint { font-size: 0.875rem; color: hsl(var(--muted-foreground)); opacity: 0.9; }

	/* Темная тема */
	:global(.dark) .upload-area { background: hsl(var(--background)); border-color: hsl(var(--border)); color: hsl(var(--foreground)); }
	:global(.dark) .upload-area:hover { background: hsl(var(--accent) / 0.12); border-color: hsl(var(--primary)); }
	:global(.dark) .upload-area.drag-over { background: hsl(var(--primary) / 0.12); border-color: hsl(var(--primary)); }
	:global(.dark) .upload-hint { color: hsl(var(--muted-foreground)); }
</style>
