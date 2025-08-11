import { writable } from 'svelte/store';
import { apiClient } from '$lib/api/client';
import { toastStore } from './toast';

interface AdminState {
	isAdminMode: boolean;
	sessionExpiry: number | null;
}

const ADMIN_SESSION_DURATION = 10 * 60 * 1000; // 10 минут в миллисекундах

function createAdminStore() {
	const { subscribe, set, update } = writable<AdminState>({
		isAdminMode: false,
		sessionExpiry: null
	});

	let autoLogoutTimer: ReturnType<typeof setTimeout> | null = null;

	// Проверяем истечение сессии при инициализации
	const checkSession = () => {
		update(state => {
			if (state.sessionExpiry && Date.now() > state.sessionExpiry) {
				// Сессия истекла
				if (autoLogoutTimer) {
					clearTimeout(autoLogoutTimer);
					autoLogoutTimer = null;
				}
				return {
					isAdminMode: false,
					sessionExpiry: null
				};
			}
			return state;
		});
	};

	// Проверяем каждую минуту
	setInterval(checkSession, 60000);

	return {
		subscribe,
		enterAdminMode: async (email: string, password: string) => {
			try {
				// Простая проверка - пытаемся аутентифицироваться
				await apiClient.login(email, password);
				
				const expiry = Date.now() + ADMIN_SESSION_DURATION;
				
				update(() => ({
					isAdminMode: true,
					sessionExpiry: expiry
				}));

				// Устанавливаем таймер автоматического выхода
				if (autoLogoutTimer) {
					clearTimeout(autoLogoutTimer);
				}
				
				autoLogoutTimer = setTimeout(() => {
					update(() => ({
						isAdminMode: false,
						sessionExpiry: null
					}));
					toastStore.info('Сессия администратора истекла. Система вернулась в режим просмотра.');
				}, ADMIN_SESSION_DURATION);

				return true;
			} catch (error) {
				console.error('Admin login failed:', error);
				throw error;
			}
		},
		exitAdminMode: () => {
			if (autoLogoutTimer) {
				clearTimeout(autoLogoutTimer);
				autoLogoutTimer = null;
			}
			
			update(() => ({
				isAdminMode: false,
				sessionExpiry: null
			}));
			
			toastStore.info('Вы вышли из режима администратора');
		},
		// Получить оставшееся время сессии в минутах
		getRemainingTime: (): number => {
			let remainingTime = 0;
			const unsubscribe = subscribe(state => {
				if (state.sessionExpiry) {
					remainingTime = Math.max(0, Math.ceil((state.sessionExpiry - Date.now()) / 60000));
				}
			});
			unsubscribe();
			return remainingTime;
		}
	};
}

export const adminStore = createAdminStore();