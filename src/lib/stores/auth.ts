import { get, writable } from 'svelte/store';
import { apiClient } from '$lib/api/client';

interface AuthState {
	token: string | null;
	isAuthenticated: boolean;
	schoolId: number | null;
	schoolData: any | null;
	isLoading: boolean;
}

function createAuthStore() {
	const initialToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

	const store = writable<AuthState>({
		token: initialToken,
		isAuthenticated: false,
		schoolId: null,
		schoolData: null,
		isLoading: !!initialToken
	});

	const { subscribe, set } = store;

	// Если есть токен, загружаем данные школы
	if (initialToken && typeof window !== 'undefined') {
		void loadSchoolData(initialToken);
	}

	async function loadSchoolData(tokenOverride?: string) {
		const currentState = get(store);
		const activeToken =
			tokenOverride ||
			currentState.token ||
			(typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);

		if (!activeToken) {
			set({ token: null, isAuthenticated: false, schoolId: null, schoolData: null, isLoading: false });
			return null;
		}

		set({ ...currentState, token: activeToken, isLoading: true });

		try {
			// Сначала получаем ID школы через /auth/me
			const meResponse = await apiClient.getMe();
			const schoolId = meResponse.id;
			
			// Затем получаем полные данные школы через /api/school/{id}
			const schoolData = await apiClient.getSchool(schoolId);
			
			set({ token: activeToken, isAuthenticated: true, schoolId, schoolData, isLoading: false });
			return schoolData;
		} catch (error) {
			console.error('Error loading school data:', error);
			if (typeof window !== 'undefined') {
				localStorage.removeItem('authToken');
			}
			set({ token: null, isAuthenticated: false, schoolId: null, schoolData: null, isLoading: false });
			return null;
		}
	}

	return {
		subscribe,
		login: async (token: string) => {
			localStorage.setItem('authToken', token);
			const schoolData = await loadSchoolData(token);
			if (!schoolData) {
				throw new Error('Не удалось авторизоваться');
			}
		},
		logout: () => {
			localStorage.removeItem('authToken');
			set({ token: null, isAuthenticated: false, schoolId: null, schoolData: null, isLoading: false });
		},
		loadSchoolData
	};
}

export const authStore = createAuthStore(); 
