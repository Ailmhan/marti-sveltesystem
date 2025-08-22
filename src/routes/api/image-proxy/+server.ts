import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, fetch }) => {
	try {
		// Получаем URL изображения из query параметра
		const imageUrl = url.searchParams.get('url');
		
		if (!imageUrl) {
			throw error(400, 'Missing image URL parameter');
		}

		// Проверяем, что URL ведет на DigitalOcean Spaces
		if (!imageUrl.includes('digitaloceanspaces.com')) {
			throw error(400, 'Invalid image URL domain');
		}

		console.log('Proxying image:', imageUrl);

		// Загружаем изображение с DigitalOcean Spaces
		console.log('Fetching from DigitalOcean...');
		const response = await fetch(imageUrl);
		
		console.log('Response status:', response.status);
		console.log('Response headers:', Object.fromEntries(response.headers.entries()));
		
		if (!response.ok) {
			throw error(response.status, 'Failed to fetch image');
		}

		// Получаем содержимое изображения
		const imageBuffer = await response.arrayBuffer();
		
		// Получаем тип контента
		const contentType = response.headers.get('content-type') || 'image/jpeg';
		
		// Возвращаем изображение с правильными заголовками
		return new Response(imageBuffer, {
			status: 200,
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=3600', // Кэшируем на 1 час
				'Access-Control-Allow-Origin': '*', // Разрешаем CORS
				'Access-Control-Allow-Methods': 'GET',
				'Access-Control-Allow-Headers': 'Content-Type'
			}
		});

	} catch (err) {
		console.error('Image proxy error:', err);
		
		if (err instanceof Error && err.message.includes('Failed to fetch image')) {
			throw error(404, 'Image not found');
		}
		
		throw error(500, 'Internal server error');
	}
};
