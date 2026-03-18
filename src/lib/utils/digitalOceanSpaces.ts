function getUploadEndpoint() {
	return import.meta.env.VITE_UPLOAD_API_URL || '/api/upload';
}

async function uploadFormData(formData: FormData) {
	const endpoint = getUploadEndpoint();
	const response = await fetch(endpoint, {
		method: 'POST',
		body: formData
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error('Upload failed:', response.status, errorText);
		throw new Error(`Upload failed: ${response.statusText}`);
	}

	return response.json();
}

export async function uploadToDigitalOceanSpaces(file: File, folder = 'uploads') {
	try {
		console.log('Uploading file:', file.name, 'to folder:', folder);

		const formData = new FormData();
		formData.append('file', file);
		formData.append('folder', folder);

		const result = await uploadFormData(formData);
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

export async function uploadBlobToDigitalOceanSpaces(
	blob: Blob,
	fileName = 'image.jpg',
	folder = 'uploads'
) {
	try {
		const formData = new FormData();
		formData.append('file', blob, fileName);
		formData.append('folder', folder);
		const result = await uploadFormData(formData);
		return {
			success: true,
			url: result.url
		};
	} catch (error) {
		console.error('Blob upload error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}
