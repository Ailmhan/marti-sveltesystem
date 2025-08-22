<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { PinturaEditor } from '@pqina/svelte-pintura';
	import { getEditorDefaults } from '@pqina/pintura';
	import '@pqina/pintura/pintura.css';
  
	/**
	 * ПРОПСЫ
	 * imageUrl — URL/BlobURL/DataURL исходного изображения (обязателен)
	 * outputSize — размер итогового квадрата в пикселях
	 * format — формат результата ('image/jpeg' или 'image/png')
	 * quality — качество JPEG (0..1), игнорируется для PNG
	 * title — заголовок виджета
	 */
	export let imageUrl: string | null = null;
	export let outputSize = 600;
	export let format: 'image/jpeg' | 'image/png' = 'image/jpeg';
	export let quality = 0.92;
	export let title = 'Настройка отображения фото (340x240px)';
  
	/**
	 * СОБЫТИЯ
	 * - confirm: { blob, dataUrl, width, height, cropData } — по нажатию «Сохранить»
	 * - cancel:  без данных — по нажатию «Отмена»
	 * - error:   { message } — если не удалось обрезать
	 * - ready:   без данных — когда редактор инициализирован
	 */
	const dispatch = createEventDispatcher<{
	  confirm: { blob: Blob; dataUrl: string; width: number; height: number; cropData: any };
	  cancel: void;
	  error: { message: string };
	  ready: void;
	}>();
  
	let result: string | null = null;
	let ready = false;
	let isLoadingBlob = false;
	
	// Настройки Pintura для редактирования
	const editorDefaults = getEditorDefaults();
	
	// Функция для получения проксированного URL изображения
	function getProxiedImageUrl(originalUrl: string): string {
		if (!originalUrl) return '';
		
		// Если URL уже локальный или относительный, возвращаем как есть
		if (originalUrl.startsWith('/') || originalUrl.startsWith('blob:') || originalUrl.startsWith('data:')) {
			return originalUrl;
		}
		
		// Если URL с DigitalOcean Spaces, используем наш прокси
		if (originalUrl.includes('digitaloceanspaces.com')) {
			return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
		}
		
		// Для других URL возвращаем как есть
		return originalUrl;
	}
	
	// Fallback: загружаем изображение как Blob для избежания CORS
	async function loadImageAsBlob(url: string): Promise<string> {
		isLoadingBlob = true;
		try {
			// Используем наш прокси-сервер для DigitalOcean URLs
			const fetchUrl = url.includes('digitaloceanspaces.com') 
				? `/api/image-proxy?url=${encodeURIComponent(url)}`
				: url;
			
			console.log('Loading image as blob from:', fetchUrl);
			
			const response = await fetch(fetchUrl);
			if (!response.ok) throw new Error('Failed to fetch image');
			
			const blob = await response.blob();
			return URL.createObjectURL(blob);
		} catch (error) {
			console.error('Failed to load image as blob:', error);
			throw error;
		} finally {
			isLoadingBlob = false;
		}
	}
	
	// Обработчик события load от Pintura
	function handleLoad(event: CustomEvent) {
		console.log('🔄 Pintura загружает изображение:', event.detail);
	}
	
	// Обработчик события crop от Pintura
	function handleCrop(event: CustomEvent) {
		console.log('✂️ Pintura обрезает изображение:', event.detail);
	}
	
	// Обработчик изменения состояния Pintura
	function handleStateChange(event: CustomEvent) {
		console.log('🔄 Изменение состояния Pintura:', event.detail);
	}
	
	// Обработчик завершения редактирования Pintura
	function handleFinish(event: CustomEvent) {
		console.log('🏁 Pintura завершил редактирование:', event.detail);
		if (event.detail.dest) {
			result = URL.createObjectURL(event.detail.dest);
			console.log('✅ Blob URL создан для результата:', result);
			ready = true;
			dispatch('ready');
		}
	}
	
	// Обработчик успешной обработки изображения
	function handleProcess(event: CustomEvent) {
		console.log('🎉 Изображение обработано Pintura:', event.detail);
		console.log('📊 Детали события:', {
			dest: event.detail.dest,
			type: event.detail.dest?.type,
			size: event.detail.dest?.size
		});
		
		if (event.detail.dest) {
			result = URL.createObjectURL(event.detail.dest);
			console.log('✅ Blob URL создан для результата:', result);
		} else {
			console.error('❌ event.detail.dest отсутствует!');
		}
		
					ready = true;
					dispatch('ready');
				}
	
	// Обработчик ошибок
	function handleError(event: CustomEvent) {
		console.error('❌ Ошибка Pintura:', event.detail);
		
		// Проверяем, не связана ли ошибка с CORS
		const errorMessage = event.detail?.message || 'Не удалось обработать изображение';
		if (errorMessage.includes('CORS') || errorMessage.includes('Access-Control-Allow-Origin')) {
			dispatch('error', { message: 'Ошибка CORS при загрузке изображения. Попробуйте использовать кнопку "Загрузить как Blob".' });
					} else {
			dispatch('error', { message: errorMessage });
		}
	}
	
	// Обработчик готовности редактора
	function handleReady() {
		console.log('✅ Pintura редактор готов');
		ready = true;
		dispatch('ready');
	}
	
	// Обработчик закрытия редактора
	function handleClose() {
		console.log('🚪 Pintura редактор закрыт');
		dispatch('cancel');
	}
  
	// Публичный метод: получить Blob без нажатия кнопки (по ссылке извне)
	export async function getCroppedBlob(size = outputSize): Promise<Blob> {
	  if (!result) {
		throw new Error('Изображение ещё не обработано');
	  }
	  
	  // Конвертируем data URL в Blob
	  const response = await fetch(result);
	  return await response.blob();
	}
  
		async function onConfirm() {
		console.log('=== НАЖАТИЕ КНОПКИ СОХРАНИТЬ ===');
		console.log('📊 Текущее состояние:', { result, ready, imageUrl });
		
		if (!result) {
			console.log('❌ Результат не готов');
			dispatch('error', { message: 'Изображение не обработано' });
			return;
		}
		
		try {
			console.log('🚀 Получаем Blob из результата...');
			console.log('🔗 Result URL:', result);
			
			const response = await fetch(result);
			const blob = await response.blob();
			console.log('✅ Blob получен:', {
				type: blob.type,
				size: blob.size
			});
			
			console.log('🖼️ Создаем dataUrl...');
			const dataUrl = result; // result уже является data URL
			console.log('✅ DataUrl готов:', dataUrl.substring(0, 100) + '...');
			
			console.log('📤 Отправляем событие confirm...');
			dispatch('confirm', { 
				blob, 
				dataUrl, 
				width: outputSize, 
				height: outputSize, 
				cropData: { aspectRatio: 1 } 
			});
			console.log('✅ Кроп успешно применен');
			
		} catch (e: any) {
			console.error('❌ Ошибка в onConfirm:', e);
			dispatch('error', { message: e?.message ?? 'Не удалось обработать изображение' });
		}
	}
  
	function onCancel() {
	  dispatch('cancel');
	}
  </script>
  
  <div class="ids">
	{#if imageUrl}
	  <div class="ids__header">
		<div class="ids__title">
		  <span class="ids__icon">✏️</span>{title}
				{#if !ready}
					<span class="ids__status ids__status--loading">⏳ Инициализация...</span>
				{:else}
					<span class="ids__status ids__status--ready">✅ Готов</span>
				{/if}
			</div>
			<div class="ids__hint">
				Используйте Pintura для профессиональной обрезки изображений
				{#if !ready}
					<br><span class="ids__debug">Редактор инициализируется</span>
				{:else}
					<br><span class="ids__debug">📋 Инструкция: 1) Обрежьте изображение 2) Нажмите "Crop" в Pintura 3) Сохраните в модалке</span>
					<br><span class="ids__debug">📐 Размеры: 340x240px (под карточку учителя)</span>
				{/if}
			</div>
		</div>

				<!-- Pintura Editor -->
		<div class="ids__editor">
			<PinturaEditor
				{...editorDefaults}
				src={getProxiedImageUrl(imageUrl)}
				imageCropAspectRatio={340/240}
				imageCropMinSize={{ width: 340, height: 240 }}
				imageCropMaxSize={{ width: 680, height: 480 }}
				on:process={handleProcess}
				on:error={handleError}
				on:ready={handleReady}
				on:close={handleClose}
				on:load={handleLoad}
				on:crop={handleCrop}
				on:statechange={handleStateChange}
				on:finish={handleFinish}
			>
				<!-- Добавляем кнопки управления Pintura -->
				<div class="ids__pintura-controls">
					<button type="button" class="ids__btn ids__btn--ghost" on:click={() => {
						// Закрываем Pintura без сохранения
						console.log('🚪 Закрываем Pintura без сохранения');
						dispatch('cancel');
					}}>
						❌ Отмена
					</button>
					<button type="button" class="ids__btn ids__btn--primary" on:click={() => {
						// Применяем обрезку
						console.log('✂️ Применяем обрезку...');
						console.log('🎯 Текущий результат:', result);
						
						if (result) {
							// Если есть результат, показываем инструкцию
							alert('✅ Обрезка уже применена!\n\n📋 Следующие шаги:\n1. Вернитесь в модалку и нажмите "Сохранить"\n2. Обрезанное изображение автоматически загрузится на сервер\n\n📐 Размеры: 340x240px (под карточку учителя)');
						} else {
							// Если нет результата, показываем инструкцию
							alert('❌ Обрезка еще не применена!\n\n📋 Инструкция:\n1. Выберите область обрезки в редакторе (340x240px)\n2. Нажмите кнопку "Crop" или "Apply" в Pintura\n3. Дождитесь появления результата\n4. Вернитесь в модалку и нажмите "Сохранить"\n\n📐 Размеры: 340x240px (под карточку учителя)');
						}
					}}>
						ℹ️ Инструкция
					</button>
				</div>
			</PinturaEditor>
	  </div>
  
				<!-- Результат обрезки -->
		{#if result}
			<div class="ids__result">
				<h4>✅ Обрезка применена успешно!</h4>
				<img src={result} alt="Результат" class="ids__preview" />
				<div class="ids__result-info">
					<p>📐 Размер: 340x240px</p>
					<p>🎯 Пропорции: под карточку учителя</p>
					<p>💾 Готово к сохранению в модалке</p>
				</div>
			</div>
		{/if}
  
	  <div class="ids__actions">
		<button type="button" class="ids__btn ids__btn--ghost" on:click={onCancel}>Отмена</button>
			{#if imageUrl && imageUrl.includes('digitaloceanspaces.com')}
				<button type="button" class="ids__btn ids__btn--secondary" on:click={async () => {
					try {
						if (imageUrl) {
							console.log('🔄 Загружаем изображение как Blob...');
							const blobUrl = await loadImageAsBlob(imageUrl);
							console.log('✅ Blob URL создан:', blobUrl);
							// Обновляем src для Pintura Editor
							imageUrl = blobUrl;
							console.log('🔄 Обновляем imageUrl на Blob URL');
							
							// Показываем инструкцию
							alert('🔄 Изображение загружено как Blob!\n\n📋 Инструкция:\n1. Обрежьте изображение в редакторе (340x240px)\n2. Нажмите кнопку "Crop" или "Apply" в Pintura\n3. Дождитесь появления результата\n4. Вернитесь в модалку и нажмите "Сохранить"\n\n📐 Размеры: 340x240px (под карточку учителя)');
						}
					} catch (error) {
						console.error('Failed to load image as blob:', error);
						dispatch('error', { message: 'Не удалось загрузить изображение как Blob. Попробуйте обновить страницу.' });
					}
				}} disabled={isLoadingBlob}>
					{isLoadingBlob ? '⏳ Загрузка...' : 'Загрузить как Blob'}
				</button>
			{/if}
			<button type="button" class="ids__btn ids__btn--primary" on:click={onConfirm} disabled={!result}>
		  Сохранить
		</button>
	  </div>
	{:else}
	  <div class="ids__empty">Нет изображения для обрезки</div>
	{/if}
  </div>
  
  <style>
	.ids { display: flex; flex-direction: column; gap: .75rem; }
  
	.ids__header { display: flex; flex-direction: column; gap: .25rem; }
	.ids__title { display: inline-flex; align-items: center; gap: .5rem; font-weight: 700; font-size: 1rem; }
	.ids__icon { font-size: 1.1rem; }
	.ids__status { 
		font-size: 0.875rem; 
		font-weight: 500; 
		padding: 0.25rem 0.5rem; 
		border-radius: 0.375rem; 
		margin-left: auto;
	}
	.ids__status--loading { 
		background: hsl(var(--warning) / 0.1); 
		color: hsl(var(--warning)); 
		border: 1px solid hsl(var(--warning) / 0.2);
	}
	.ids__status--ready { 
		background: hsl(var(--success) / 0.1); 
		color: hsl(var(--success)); 
		border: 1px solid hsl(var(--success) / 0.2);
	}
	.ids__hint { color: hsl(var(--muted-foreground)); font-size: .875rem; }
	.ids__debug { 
		color: hsl(var(--destructive)); 
		font-size: 0.75rem; 
		font-style: italic;
		opacity: 0.8;
	}
  
	/* Контейнер для Pintura Editor */
	.ids__editor {
	  width: 100%;
		height: 600px;
	  border: 2px solid hsl(var(--border));
	  border-radius: var(--radius);
	  overflow: hidden;
	  background: #111;
		position: relative;
	}
	
	/* Кнопки управления Pintura */
	.ids__pintura-controls {
		position: absolute;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 10px;
		z-index: 1000;
		background: rgba(0, 0, 0, 0.8);
		padding: 10px;
		border-radius: var(--radius);
	}
	
	/* Стили для Pintura Editor */
	:global(.pintura-editor) {
		height: 100% !important;
	}
  
	/* Результат обрезки */
	.ids__result {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		background: hsl(var(--muted) / 0.1);
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
	}
	
	.ids__result h4 {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: hsl(var(--foreground));
	}
	
	.ids__preview {
		width: 200px;
		height: 200px;
		object-fit: cover;
		border-radius: var(--radius);
		border: 1px solid hsl(var(--border));
	}
	
	.ids__result-info {
		margin-top: 1rem;
		padding: 1rem;
		background: hsl(var(--muted) / 0.1);
		border-radius: var(--radius);
		border: 1px solid hsl(var(--border));
	}
	
	.ids__result-info p {
		margin: 0.5rem 0;
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
	}
  
	.ids__actions { display: flex; justify-content: flex-end; gap: .5rem; }
	.ids__btn {
	  padding: .55rem .95rem;
	  border-radius: .6rem;
	  font-weight: 600;
	  border: 1px solid hsl(var(--border));
	  background: hsl(var(--muted));
	  color: hsl(var(--foreground));
	  cursor: pointer;
	  transition: .15s ease;
	}
	.ids__btn:hover { filter: brightness(1.03); }
	.ids__btn:disabled { opacity: .6; cursor: not-allowed; }
	.ids__btn--primary {
	  background: hsl(var(--primary));
	  color: hsl(var(--primary-foreground));
	  border-color: transparent;
	}
	.ids__btn--ghost { background: hsl(var(--muted)); }
	.ids__btn--secondary {
		background: hsl(var(--secondary));
		color: hsl(var(--secondary-foreground));
		border-color: transparent;
	}
  
	.ids__empty {
	  padding: 2rem;
	  text-align: center;
	  color: hsl(var(--muted-foreground));
	  border: 1px dashed hsl(var(--border));
	  border-radius: var(--radius);
	}
  </style>
  