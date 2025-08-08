import { writable } from 'svelte/store';

export type Language = 'ru' | 'kz';

// Получаем язык из localStorage или используем русский по умолчанию
const getInitialLanguage = (): Language => {
	if (typeof window !== 'undefined') {
		const saved = localStorage.getItem('language');
		if (saved === 'ru' || saved === 'kz') {
			return saved;
		}
	}
	return 'ru';
};

export const languageStore = writable<Language>(getInitialLanguage());

// Подписываемся на изменения языка и сохраняем в localStorage
if (typeof window !== 'undefined') {
	languageStore.subscribe(language => {
		localStorage.setItem('language', language);
	});
}

export function setLanguage(language: Language) {
	languageStore.set(language);
}

export function toggleLanguage() {
	languageStore.update(current => current === 'ru' ? 'kz' : 'ru');
}
