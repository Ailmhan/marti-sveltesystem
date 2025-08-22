import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Типы для темы
export type Theme = 'light' | 'dark' | 'system';

// Интерфейс для состояния темы
interface ThemeState {
	theme: Theme;
	isDark: boolean;
}

// Функция для получения системной темы
function getSystemTheme(): boolean {
	if (!browser) return false;
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Функция для получения сохраненной темы
function getSavedTheme(): Theme {
	if (!browser) return 'light';
	try {
		return (localStorage.getItem('theme') as Theme) || 'system';
	} catch {
		return 'system';
	}
}

// Функция для применения темы к DOM
function applyTheme(theme: Theme, isDark: boolean) {
	if (!browser) return;
	
	// Убираем все классы тем
	document.documentElement.classList.remove('light', 'dark');
	
	// Добавляем нужный класс
	if (theme === 'system') {
		document.documentElement.classList.add(isDark ? 'dark' : 'light');
	} else {
		document.documentElement.classList.add(theme);
	}
	
	// Сохраняем в localStorage
	try {
		localStorage.setItem('theme', theme);
	} catch (error) {
		console.warn('Failed to save theme to localStorage:', error);
	}
}

// Функция для определения, должна ли тема быть темной
function shouldBeDark(theme: Theme): boolean {
	if (theme === 'dark') return true;
	if (theme === 'light') return false;
	return getSystemTheme();
}

// Создаем основной store
function createThemeStore() {
	// Начальное состояние
	const initialState: ThemeState = {
		theme: 'system',
		isDark: false
	};

	const { subscribe, set, update } = writable<ThemeState>(initialState);

	// Инициализация при создании store
	function init() {
		if (!browser) return;
		
		const savedTheme = getSavedTheme();
		const isDark = shouldBeDark(savedTheme);
		
		// Применяем тему к DOM
		applyTheme(savedTheme, isDark);
		
		// Обновляем store
		set({ theme: savedTheme, isDark });
		
		// Слушаем изменения системной темы
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', handleSystemThemeChange);
		
		return () => {
			mediaQuery.removeEventListener('change', handleSystemThemeChange);
		};
	}

	// Обработчик изменения системной темы
	function handleSystemThemeChange(event: MediaQueryListEvent) {
		update(state => {
			if (state.theme === 'system') {
				const isDark = event.matches;
				applyTheme('system', isDark);
				return { ...state, isDark };
			}
			return state;
		});
	}

	// Функция для установки темы
	function setTheme(theme: Theme) {
		const isDark = shouldBeDark(theme);
		
		// Применяем тему к DOM
		applyTheme(theme, isDark);
		
		// Обновляем store
		set({ theme, isDark });
	}

	// Функция для переключения между светлой и темной темой
	function toggleTheme() {
		update(state => {
			const newTheme: Theme = state.isDark ? 'light' : 'dark';
			const isDark = shouldBeDark(newTheme);
			
			// Применяем тему к DOM
			applyTheme(newTheme, isDark);
			
			return { theme: newTheme, isDark };
		});
	}

	// Функция для циклического переключения тем
	function cycleTheme() {
		update(state => {
			let newTheme: Theme;
			
			switch (state.theme) {
				case 'light':
					newTheme = 'dark';
					break;
				case 'dark':
					newTheme = 'system';
					break;
				case 'system':
					newTheme = 'light';
					break;
				default:
					newTheme = 'light';
			}
			
			const isDark = shouldBeDark(newTheme);
			
			// Применяем тему к DOM
			applyTheme(newTheme, isDark);
			
			return { theme: newTheme, isDark };
		});
	}

	return {
		subscribe,
		setTheme,
		toggleTheme,
		cycleTheme,
		init
	};
}

// Создаем экземпляр store
export const themeStore = createThemeStore();

// Производный store для удобства
export const isDark = derived(themeStore, $themeStore => $themeStore.isDark);
export const currentTheme = derived(themeStore, $themeStore => $themeStore.theme);

// Store будет инициализирован через ThemeProvider компонент
