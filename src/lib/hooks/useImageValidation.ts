import { writable, derived } from 'svelte/store';
import { validateImageUrl, hasImageChanged } from '$lib/utils/imageValidation';

/**
 * Хук для валидации изображения в формах
 * @param originalImageUrl - оригинальный URL изображения
 * @param currentImageUrl - текущий URL изображения
 * @returns объект с состоянием валидации
 */
export function useImageValidation(originalImageUrl: string, currentImageUrl: string) {
	// Состояние валидации
	const isValidating = writable(false);
	const isValid = writable(true);
	const validationError = writable('');
	
	// Проверяем, изменилось ли изображение
	const imageChanged = hasImageChanged(originalImageUrl, currentImageUrl);
	
	// Вычисляем, должна ли быть заблокирована кнопка сохранения
	const shouldDisableSubmit = derived(
		[isValidating, isValid],
		([$isValidating, $isValid]) => {
			// Если изображение не изменилось, кнопка активна
			if (!imageChanged) return false;
			
			// Если изображение изменилось, но еще валидируется - блокируем
			if ($isValidating) return true;
			
			// Если изображение изменилось и невалидно - блокируем
			if (!$isValid) return true;
			
			// В остальных случаях кнопка активна
			return false;
		}
	);
	
	/**
	 * Валидирует текущий URL изображения
	 */
	async function validateCurrentImage() {
		// Если изображение не изменилось, валидация не нужна
		if (!imageChanged) {
			isValid.set(true);
			validationError.set('');
			return;
		}
		
		isValidating.set(true);
		validationError.set('');
		
		try {
			const result = await validateImageUrl(currentImageUrl);
			isValid.set(result);
			
			if (!result) {
				validationError.set('Неверный URL изображения или изображение недоступно');
			}
		} catch (error) {
			isValid.set(false);
			validationError.set('Ошибка валидации изображения');
		} finally {
			isValidating.set(false);
		}
	}
	
	/**
	 * Сбрасывает состояние валидации
	 */
	function resetValidation() {
		isValidating.set(false);
		isValid.set(true);
		validationError.set('');
	}
	
	return {
		isValidating: { subscribe: isValidating.subscribe },
		isValid: { subscribe: isValid.subscribe },
		validationError: { subscribe: validationError.subscribe },
		shouldDisableSubmit: { subscribe: shouldDisableSubmit.subscribe },
		validateCurrentImage,
		resetValidation
	};
}
