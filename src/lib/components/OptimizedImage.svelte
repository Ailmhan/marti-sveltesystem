<script lang="ts">
	import { onMount } from 'svelte';
	
	export let src: string;
	export let alt: string = '';
	export let width: number = 300;
	export let height: number = 200;
	export let loading: 'lazy' | 'eager' = 'lazy';
	export let className: string = '';
	
	let imageRef: HTMLImageElement;
	let isVisible = false;
	let isLoaded = false;
	let hasError = false;
	
	// Генерируем placeholder или используем blur
	const placeholder = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23f3f4f6'/%3E%3C/svg%3E`;
	
	onMount(() => {
		if (loading === 'lazy') {
			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) {
						isVisible = true;
						observer.unobserve(imageRef);
					}
				},
				{ 
					threshold: 0.1,
					rootMargin: '50px'
				}
			);
			
			if (imageRef) {
				observer.observe(imageRef);
			}
		} else {
			isVisible = true;
		}
	});
	
	function handleLoad() {
		isLoaded = true;
	}
	
	function handleError() {
		hasError = true;
	}
</script>

<div class="image-container {className}" style="width: {width}px; height: {height}px;">
	{#if !isVisible}
		<!-- Placeholder пока изображение не видимо -->
		<div 
			class="placeholder"
			style="width: 100%; height: 100%; background: #f3f4f6; display: flex; align-items: center; justify-content: center;"
		>
			<span style="color: #9ca3af; font-size: 0.875rem;">Загрузка...</span>
		</div>
	{:else if hasError}
		<!-- Fallback при ошибке -->
		<div 
			class="error-placeholder"
			style="width: 100%; height: 100%; background: #fef2f2; display: flex; align-items: center; justify-content: center; border: 1px solid #fecaca;"
		>
			<span style="color: #dc2626; font-size: 0.875rem;">Ошибка загрузки</span>
		</div>
	{:else}
		<!-- Оптимизированное изображение -->
		<img
			bind:this={imageRef}
			src={src}
			alt={alt}
			width={width}
			height={height}
			loading={loading}
			on:load={handleLoad}
			on:error={handleError}
			class="optimized-image"
			style="
				width: 100%;
				height: 100%;
				object-fit: cover;
				transition: opacity 0.3s ease;
				opacity: {isLoaded ? 1 : 0};
			"
		/>
		
		<!-- Loading overlay -->
		{#if !isLoaded}
			<div 
				class="loading-overlay"
				style="
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background: #f3f4f6;
					display: flex;
					align-items: center;
					justify-content: center;
				"
			>
				<div 
					class="spinner"
					style="
						width: 20px;
						height: 20px;
						border: 2px solid #e5e7eb;
						border-top: 2px solid #3b82f6;
						border-radius: 50%;
						animation: spin 1s linear infinite;
					"
				></div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.image-container {
		position: relative;
		overflow: hidden;
		border-radius: 0.5rem;
	}
	
	.optimized-image {
		display: block;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	/* Responsive adjustments */
	@media (max-width: 768px) {
		.image-container {
			width: 100% !important;
			height: auto !important;
			aspect-ratio: 3/2;
		}
	}
</style> 