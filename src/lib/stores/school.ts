import { writable } from 'svelte/store';
import type { School } from '$lib/types/api';

function createSchoolStore() {
	const { subscribe, set, update } = writable<School | null>(null);

	return {
		subscribe,
		set,
		update,
		clear: () => set(null)
	};
}

export const schoolStore = createSchoolStore(); 