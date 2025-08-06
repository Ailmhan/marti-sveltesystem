import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import S3 from 'aws-sdk/clients/s3';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const fileName = formData.get('fileName') as string;
		const folder = formData.get('folder') as string;

		if (!file) {
			return json({ success: false, error: 'No file provided' }, { status: 400 });
		}

		// Проверяем размер файла (максимум 10MB)
		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			return json({ success: false, error: 'File too large. Maximum size is 10MB' }, { status: 400 });
		}

		// Проверяем тип файла
		if (!file.type.startsWith('image/')) {
			return json({ success: false, error: 'Only image files are allowed' }, { status: 400 });
		}

		// Настраиваем S3 клиент для Digital Ocean Spaces
		const s3 = new S3({
			endpoint: env.DO_SPACES_ENDPOINT,
			accessKeyId: env.DO_SPACES_KEY,
			secretAccessKey: env.DO_SPACES_SECRET,
			region: env.DO_SPACES_REGION,
			s3ForcePathStyle: false
		});

		// Конвертируем File в Buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Загружаем файл в Digital Ocean Spaces
		const uploadParams = {
			Bucket: env.DO_SPACES_BUCKET,
			Key: fileName,
			Body: buffer,
			ContentType: file.type,
			ACL: 'public-read'
		};

		const uploadResult = await s3.upload(uploadParams).promise();

		// Возвращаем CDN URL
		const cdnUrl = `https://${env.DO_SPACES_BUCKET}.${env.DO_SPACES_CDN}/${fileName}`;

		return json({
			success: true,
			url: cdnUrl,
			key: fileName
		});

	} catch (error) {
		console.error('Upload error:', error);
		return json(
			{ 
				success: false, 
				error: error instanceof Error ? error.message : 'Upload failed' 
			}, 
			{ status: 500 }
		);
	}
}; 