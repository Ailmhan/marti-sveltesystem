import { writable } from 'svelte/store';
import { apiClient } from '$lib/api/client';

interface AdminState {
	isAdminMode: boolean;
}

function createAdminStore() {
	const { subscribe, set } = writable<AdminState>({
		isAdminMode: false
	});

	return {
		subscribe,
		enterAdminMode: async (email: string, password: string) => {
			try {
				// Просто проверяем данные через тот же endpoint авторизации
				// Но не сохраняем токен - просто валидируем
				await apiClient.login(email, password);
				
				// Если успешно - разрешаем редактирование
				set({ isAdminMode: true });
				
			} catch (error) {
				console.error('Admin auth failed:', error);
				throw new Error('Неверный email или пароль');
			}
		},
		exitAdminMode: () => {
			set({ isAdminMode: false });
		}
	};
}

export const adminStore = createAdminStore();