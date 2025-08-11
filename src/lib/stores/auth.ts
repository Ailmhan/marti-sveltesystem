import { writable } from 'svelte/store';
import { apiClient } from '$lib/api/client';

interface AuthState {
	token: string | null;
	isAuthenticated: boolean;
	schoolId: number | null;
	schoolData: any | null;
}

function createAuthStore() {
	// Получаем токен из localStorage при инициализации
	const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
	
	const { subscribe, set, update } = writable<AuthState>({
		token,
		isAuthenticated: !!token,
		schoolId: null,
		schoolData: null
	});

	// Если есть токен, загружаем данные школы
	if (token && typeof window !== 'undefined') {
		loadSchoolData();
	}

	async function loadSchoolData() {
		try {
			// Сначала получаем ID школы через /auth/me
			const meResponse = await apiClient.getMe();
			const schoolId = meResponse.id;
			
			// Затем получаем полные данные школы через /api/school/{id}
			const schoolData = await apiClient.getSchool(schoolId);
			
			set({ token, isAuthenticated: true, schoolId, schoolData });
		} catch (error) {
			console.error('Error loading school data:', error);
			set({ token, isAuthenticated: true, schoolId: null, schoolData: null });
		}
	}

	return {
		subscribe,
		login: async (token: string) => {
			localStorage.setItem('authToken', token);
			await loadSchoolData();
		},
		logout: () => {
			localStorage.removeItem('authToken');
			set({ token: null, isAuthenticated: false, schoolId: null, schoolData: null });
		},
		loadSchoolData,
		updateSchoolData: (newSchoolData: any) => {
			update(state => ({
				...state,
				schoolData: newSchoolData
			}));
		}
	};
}

export const authStore = createAuthStore(); 