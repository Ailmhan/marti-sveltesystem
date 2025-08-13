import { writable, get } from 'svelte/store';

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
			console.log('=== adminStore.enterAdminMode() called ===');
			console.log('adminData:', adminData);
			console.log('Current state before enter:', get({ subscribe }));
			
			update(state => {
				console.log('Updating state in enterAdminMode');
				return {
					...state,
					isAdminMode: true,
					adminData: adminData || null
				};
			});
			
			console.log('State updated, new state:', get({ subscribe }));
			
			// Сохраняем в localStorage
			if (typeof window !== 'undefined') {
				localStorage.setItem('adminMode', 'true');
				if (adminData) {
					localStorage.setItem('adminData', JSON.stringify(adminData));
				}
				console.log('localStorage updated');
			}
			
			console.log('=== adminStore.enterAdminMode() completed ===');
		},

		// Выйти из админ-режима
		exitAdminMode: () => {
			console.log('=== adminStore.exitAdminMode() called ===');
			console.log('Current state before exit:', get({ subscribe }));
			
			update(state => {
				console.log('Updating state in exitAdminMode');
				return {
					...state,
					isAdminMode: false,
					adminData: null
				};
			});
			
			console.log('State updated, new state:', get({ subscribe }));
			
			// Удаляем из localStorage
			if (typeof window !== 'undefined') {
				localStorage.removeItem('adminMode');
				localStorage.removeItem('adminData');
				console.log('localStorage cleared');
			}
			
			console.log('=== adminStore.exitAdminMode() completed ===');
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
