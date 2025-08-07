import { v4 as uuidv4 } from 'uuid';

export async function uploadToDigitalOceanSpaces(file: File, folder = 'uploads') {
	try {
		console.log('Uploading file:', file.name, 'to folder:', folder);

		// Создаем FormData для отправки на сервер
		const formData = new FormData();
		formData.append('file', file);
		formData.append('folder', folder);

		// Отправляем файл на наш API endpoint
		const response = await fetch('/api/upload', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Upload failed:', response.status, errorText);
			return { success: false, error: `Upload failed: ${response.statusText}` };
		}

		const result = await response.json();
		console.log('Upload response:', result);

		if (result.success) {
			return {
				success: true,
				url: result.url
			};
		} else {
			return {
				success: false,
				error: result.error || 'Upload failed'
			};
		}
		
	} catch (error) {
		console.error('Upload error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
} 