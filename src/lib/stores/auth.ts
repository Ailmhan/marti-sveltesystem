import { writable } from 'svelte/store';

interface AuthState {
	token: string | null;
	isAuthenticated: boolean;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		token: null,
		isAuthenticated: false
	});

	return {
		subscribe,
		set,
		login: (token: string) => {
			localStorage.setItem('authToken', token);
			set({ token, isAuthenticated: true });
		},
		logout: () => {
			localStorage.removeItem('authToken');
			set({ token: null, isAuthenticated: false });
		},
		initialize: () => {
			const token = localStorage.getItem('authToken');
			if (token) {
				set({ token, isAuthenticated: true });
			}
		}
	};
}

export const authStore = createAuthStore(); 