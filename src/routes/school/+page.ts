import { authStore } from '$lib/stores/auth';
import { get } from 'svelte/store';

export const ssr = false; // Отключаем SSR для получения данных из stores

export async function load() {
	// Загружаем данные школы если они не загружены
	const currentAuth = get(authStore);
	
	if (!currentAuth.schoolData && currentAuth.token) {
		await authStore.loadSchoolData();
	}
	
	return {
		// Можем передать дополнительные параметры если нужно
		timestamp: Date.now()
	};
}