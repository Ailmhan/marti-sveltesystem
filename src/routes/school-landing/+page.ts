import { authStore } from '$lib/stores/auth';
import { get } from 'svelte/store';

export const ssr = false; // Отключаем SSR для получения данных из stores

export async function load() {
	// Загружаем данные школы если они не загружены
	const currentAuth = get(authStore);
	
	console.log('🏫 School Landing +page.ts load, currentAuth:', {
		hasToken: !!currentAuth.token,
		hasSchoolData: !!currentAuth.schoolData,
		logoUrl: currentAuth.schoolData?.logoUrl,
		schoolId: currentAuth.schoolId
	});
	
	if (!currentAuth.schoolData && currentAuth.token) {
		console.log('🏫 Loading school data from school-landing +page.ts...');
		await authStore.loadSchoolData();
	}
	
	return {
		// Можем передать дополнительные параметры если нужно
		timestamp: Date.now()
	};
}