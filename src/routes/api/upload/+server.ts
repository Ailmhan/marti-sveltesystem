import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { v4 as uuidv4 } from 'uuid';
import S3 from 'aws-sdk/clients/s3';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
	try {
		console.log('Upload request received');
		
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const folder = formData.get('folder') as string || 'uploads';

		console.log('Form data parsed:', { folder, fileSize: file?.size });

		if (!file) {
			console.error('No file provided');
			return json({ success: false, error: 'No file provided' }, { status: 400 });
		}

		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			console.error('File too large:', file.size);
			return json({ success: false, error: 'File too large. Maximum size is 10MB' }, { status: 400 });
		}

		if (!file.type.startsWith('image/')) {
			console.error('Invalid file type:', file.type);
			return json({ success: false, error: 'Only image files are allowed' }, { status: 400 });
		}

		// Конвертируем File в Uint8Array для загрузки в S3
		console.log('Converting file to binary...');
		const arrayBuffer = await file.arrayBuffer();
		const fileData = new Uint8Array(arrayBuffer);

		// DigitalOcean Spaces settings (configured via server env vars)
		const accessKey = env.DO_SPACES_KEY;
		const secretKey = env.DO_SPACES_SECRET;
		const bucket = env.DO_SPACES_BUCKET || 'martiscdn';
		const region = env.DO_SPACES_REGION || 'sfo3';
		const endpoint = env.DO_SPACES_ENDPOINT || 'sfo3.digitaloceanspaces.com';
		const cdn = env.DO_SPACES_CDN || 'sfo3.cdn.digitaloceanspaces.com';

		if (!accessKey || !secretKey) {
			return json(
				{
					success: false,
					error: 'Missing DO_SPACES_KEY/DO_SPACES_SECRET in server environment'
				},
				{ status: 500 }
			);
		}

		// Создаем уникальное имя файла
		const fileName = `${folder}/${uuidv4()}-${file.name}`;

		console.log('Upload settings:', {
			bucket,
			fileName,
			contentType: file.type,
			endpoint
		});

		// Настройка S3 клиента
		const s3 = new S3({
			endpoint: `https://${endpoint}`,
			accessKeyId: accessKey,
			secretAccessKey: secretKey,
			region,
			s3ForcePathStyle: false
		});

		// Параметры для загрузки
		const uploadParams = {
			Bucket: bucket,
			Key: fileName,
			Body: fileData,
			ContentType: file.type,
			ACL: 'public-read'
		};

		console.log('Uploading to Digital Ocean Spaces...');

		// Загружаем файл
		const uploadResult = await s3.upload(uploadParams).promise();
		
		console.log('Upload successful:', uploadResult.Location);

		// Формируем CDN URL для доступа к файлу
		const cdnUrl = `https://${bucket}.${cdn}/${fileName}`;

		return json({
			success: true,
			url: cdnUrl,
			key: fileName
		});

	} catch (error) {
		console.error('Upload error details:', {
			message: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
			name: error instanceof Error ? error.name : 'Unknown'
		});
		
		return json(
			{ 
				success: false, 
				error: error instanceof Error ? error.message : 'Upload failed',
				details: import.meta.env.DEV ? (error instanceof Error ? error.stack : undefined) : undefined
			}, 
			{ status: 500 }
		);
	}
};
