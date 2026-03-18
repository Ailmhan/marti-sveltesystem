export function isValidImageUrl(url?: string | null): boolean {
	if (!url) return true;

	try {
		const parsed = new URL(url);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}
