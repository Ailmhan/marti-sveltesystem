import { writable } from 'svelte/store';

interface AdminState {
	isAdminMode: boolean;
	adminData: any | null;
}

function createAdminStore() {
	const { subscribe, set, update } = writable<AdminState>({
		isAdminMode: false,
		adminData: null
	});

	return {
		subscribe,
		
		// Войти в админ-режим
		enterAdminMode: (adminData?: any) => {
			update(state => ({
				...state,
				isAdminMode: true,
				adminData: adminData || null
			}));
			
			// Сохраняем в localStorage
			if (typeof window !== 'undefined') {
				localStorage.setItem('adminMode', 'true');
				if (adminData) {
					localStorage.setItem('adminData', JSON.stringify(adminData));
				}
			}
		},

		// Выйти из админ-режима
		exitAdminMode: () => {
			update(state => ({
				...state,
				isAdminMode: false,
				adminData: null
			}));
			
			// Удаляем из localStorage
			if (typeof window !== 'undefined') {
				localStorage.removeItem('adminMode');
				localStorage.removeItem('adminData');
			}
		},

		// Обновить данные администратора
		updateAdminData: (adminData: any) => {
			update(state => ({
				...state,
				adminData
			}));
			
			// Обновляем в localStorage
			if (typeof window !== 'undefined') {
				localStorage.setItem('adminData', JSON.stringify(adminData));
			}
		},

		// Инициализация из localStorage
		init: () => {
			if (typeof window !== 'undefined') {
				const adminMode = localStorage.getItem('adminMode') === 'true';
				const adminData = localStorage.getItem('adminData');
				
				if (adminMode) {
					update(state => ({
						...state,
						isAdminMode: true,
						adminData: adminData ? JSON.parse(adminData) : null
					}));
				}
			}
		},

		// Сброс состояния
		reset: () => {
			set({
				isAdminMode: false,
				adminData: null
			});
			
			if (typeof window !== 'undefined') {
				localStorage.removeItem('adminMode');
				localStorage.removeItem('adminData');
			}
		}
	};
}

export const adminStore = createAdminStore();

// Автоматически инициализируем при импорте
if (typeof window !== 'undefined') {
	adminStore.init();
}
