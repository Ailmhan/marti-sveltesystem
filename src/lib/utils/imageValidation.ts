/**
 * Проверяет, является ли URL валидным изображением
 * @param url - URL для проверки
 * @returns Promise<boolean> - true если URL валиден, false если нет
 */
export async function validateImageUrl(url: string): Promise<boolean> {
	if (!url || url.trim() === '') return true; // Пустой URL считается валидным (не обязательное поле)
	
	try {
		// Проверяем, что это HTTP/HTTPS URL
		const urlObj = new URL(url);
		if (!urlObj.protocol.startsWith('http')) return false;
		
		// Проверяем, что файл имеет расширение изображения
		const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
		const hasImageExtension = imageExtensions.some(ext => 
			urlObj.pathname.toLowerCase().includes(ext)
		);
		
		if (!hasImageExtension) return false;
		
		// Проверяем доступность изображения
		const response = await fetch(url, { method: 'HEAD' });
		const contentType = response.headers.get('content-type');
		return response.ok && contentType ? contentType.startsWith('image/') : false;
	} catch {
		return false;
	}
}

/**
 * Проверяет, изменилось ли изображение в форме
 * @param originalValue - оригинальное значение
 * @param currentValue - текущее значение
 * @returns boolean - true если изображение изменилось
 */
export function hasImageChanged(originalValue: string, currentValue: string): boolean {
	return originalValue !== currentValue;
}
