import { writable } from 'svelte/store';
import { apiClient } from '$lib/api/client';

interface AdminState {
	isAdminMode: boolean;
	isAdminAuthenticated: boolean;
	adminToken: string | null;
}

function createAdminStore() {
	const { subscribe, set, update } = writable<AdminState>({
		isAdminMode: false,
		isAdminAuthenticated: false,
		adminToken: null
	});

	return {
		subscribe,
		enterAdminMode: async (email: string, password: string) => {
			try {
				// Используем тот же API endpoint для аутентификации
				const response = await apiClient.login(email, password);
				
				// Сохраняем админ токен отдельно от обычного токена
				const adminToken = response.token;
				
				update(state => ({
					...state,
					isAdminMode: true,
					isAdminAuthenticated: true,
					adminToken
				}));
				
				return true;
			} catch (error) {
				console.error('Admin login failed:', error);
				throw error;
			}
		},
		exitAdminMode: () => {
			update(state => ({
				...state,
				isAdminMode: false,
				isAdminAuthenticated: false,
				adminToken: null
			}));
		},
		// Проверка админ доступа для критических операций
		verifyAdminAccess: async () => {
			return new Promise((resolve, reject) => {
				const unsubscribe = subscribe(state => {
					if (state.isAdminMode && state.isAdminAuthenticated && state.adminToken) {
						resolve(true);
					} else {
						reject(new Error('Admin access required'));
					}
					unsubscribe();
				});
			});
		}
	};
}

export const adminStore = createAdminStore();