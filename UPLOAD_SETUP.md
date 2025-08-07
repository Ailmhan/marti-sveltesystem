# Настройка загрузки файлов

## Шаг 1: Создание файла .env

Создайте файл `.env` в корне проекта и добавьте следующие переменные:

```env
# Digital Ocean Spaces Configuration
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_KEY=your_access_key_here
DO_SPACES_SECRET=your_secret_key_here
DO_SPACES_BUCKET=your_bucket_name_here
DO_SPACES_REGION=nyc3
DO_SPACES_CDN=nyc3.cdn.digitaloceanspaces.com
```

## Шаг 2: Замените значения на ваши реальные ключи

- `DO_SPACES_KEY` - ваш Access Key ID
- `DO_SPACES_SECRET` - ваш Secret Access Key  
- `DO_SPACES_BUCKET` - имя вашего bucket
- `DO_SPACES_ENDPOINT` - endpoint вашего региона (обычно nyc3, sgp1, fra1, etc.)
- `DO_SPACES_REGION` - регион вашего bucket
- `DO_SPACES_CDN` - CDN endpoint (обычно region.cdn.digitaloceanspaces.com)

## Шаг 3: Перезапустите сервер

```bash
npm run dev
```

## Шаг 4: Протестируйте загрузку

1. Перейдите на страницу: `http://localhost:5173/test-upload`
2. Попробуйте загрузить изображение
3. Проверьте консоль браузера на наличие ошибок

## Возможные проблемы

### Ошибка "Upload service not configured"
- Проверьте, что файл `.env` создан в корне проекта
- Проверьте, что все переменные окружения заполнены
- Перезапустите сервер разработки

### Ошибка "Access Denied"
- Проверьте правильность ключей доступа
- Убедитесь, что bucket существует и доступен
- Проверьте права доступа к bucket

### Ошибка "Bucket not found"
- Проверьте правильность имени bucket
- Убедитесь, что bucket создан в правильном регионе

## Структура папок в bucket

Файлы будут загружаться в следующие папки:
- `news/` - изображения для новостей
- `teachers/` - фотографии учителей
- `honor-board/` - фотографии учеников
- `canteen/` - изображения меню
- `test/` - тестовые изображения

## Безопасность

- Никогда не коммитьте файл `.env` в git
- Файл `.env` уже добавлен в `.gitignore`
- Используйте разные ключи для разработки и продакшена
